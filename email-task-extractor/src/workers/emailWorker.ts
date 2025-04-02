// workers/emailWorker.ts
import { Worker } from 'bullmq';
import { redisConnection } from '../services/queueService';
import { getEmailThread, markEmailAsProcessed, extractTextFromMessage } from '../services/gmailService';
import { saveTask, saveEmailMetadata, checkEmailProcessed } from '../services/database';
import { graph } from '../services/langgraphInstance';

const worker = new Worker(
    'emailQueue',
    async job => {
        const email = job.data;
        try {
            // Load full thread context
            const thread = await getEmailThread(email.threadId);
            const threadText = thread.messages
                .map((msg: any) => extractTextFromMessage(msg))
                .join('\n');

            // Run LangGraph from the "summarize" node.
            // The graph chain should call your summarize node followed by the extractTask node.
            const taskDetails = await graph.run(threadText, 'summarize');

            // Check if an actionable task exists
            if (!taskDetails.actionable) {
                console.log(`No actionable task for thread ${email.threadId}`);
                return;
            }

            const taskHash = Buffer.from(taskDetails.title + taskDetails.description).toString('base64');

            // Deduplication: Skip if already processed
            const alreadyProcessed = await checkEmailProcessed(email.threadId, taskHash);
            if (!alreadyProcessed) {
                saveTask({
                    threadId: email.threadId,
                    title: taskDetails.title,
                    description: taskDetails.description,
                    dueDate: taskDetails.dueDate,
                    priority: taskDetails.priority,
                    assignee: taskDetails.assignee
                });
                saveEmailMetadata({
                    threadId: email.threadId,
                    taskHash: taskHash
                });
            }

            await markEmailAsProcessed(email.id);
        } catch (error) {
            console.error('Error processing email:', error);
            throw error; // Let BullMQ handle retries if configured
        }
    },
    { concurrency: 5, connection: redisConnection } // Use the shared Redis connection
);

worker.on('completed', job => {
    console.log(`Job ${job.id} completed.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err}`);
});
