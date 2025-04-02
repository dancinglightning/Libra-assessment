import { listNewEmails, getEmailThread, markEmailAsProcessed, extractTextFromMessage } from './services/gmailService';
import { emailQueue } from './services/queueService';
import { LangGraph } from './services/langgraph';
import { summarizeNode } from './nodes/summarizeNode';
import { extractTaskNode } from './nodes/extractTaskNode';
import { saveTask, saveEmailMetadata, checkEmailProcessed } from './services/database';

// Initialize LangGraph and add nodes
const graph = new LangGraph();
graph.addNode(summarizeNode);
graph.addNode(extractTaskNode);

export const processEmails = async () => {
    const emails = await listNewEmails();
    for (const email of emails) {
        console.log('New email found:', email.id);
        // Enqueue the email for processing
        emailQueue.enqueue(email);
    }

    while (!emailQueue.isEmpty()) {
        const email = emailQueue.dequeue();
        if (!email) continue;
        try {
            const thread = await getEmailThread(email.threadId);
            // Extract full text from each message in the thread.
            const threadText = thread.messages
                .map((msg: any) => extractTextFromMessage(msg))
                .join('\n');
            const taskDetails = await graph.run(threadText, 'summarize');
            const taskHash = Buffer.from(taskDetails.title + taskDetails.description).toString('base64');

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
        }
    }
};

