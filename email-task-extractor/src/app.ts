// app.ts
import { listNewEmails } from './services/gmailService';
import { emailQueue } from './services/queueService';

export const processEmails = async () => {
    const emails = await listNewEmails();
    for (const email of emails) {
        console.log('New email found:', email.id);
        // Enqueue the email for processing in the persistent queue
        await emailQueue.add('processEmail', email);
    }
};

// You might call processEmails() on a schedule, via a webhook, or from an endpoint.
processEmails().catch(err => console.error('Error enqueuing emails:', err));
