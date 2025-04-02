// services/gmailService.ts
import { google } from 'googleapis';
import config from '../config';

const { clientId, clientSecret, redirectUri, refreshToken } = config.gmail;

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
// Set the refresh token for the OAuth2 client
oAuth2Client.setCredentials({ refresh_token: refreshToken });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

// List of subject keywords to filter out
const subjectFilters = [
    'newsletter',
    'sale',
    'offer',
    'promotion',
    'promo',
    'discount',
    'notification',
    'update',
    'advertisement',
    'ad'
];

// Build the subject filter portion of the query dynamically
const subjectQuery = subjectFilters.map(word => `-subject:"${word}"`).join(' ');

// Combined query string for listing emails
const query = `is:unread -category:promotions -category:social -label:SPAM ${subjectQuery}`;

export const listNewEmails = async (): Promise<any[]> => {
    const res = await gmail.users.messages.list({ userId: 'me', q: query });
    const emails = res.data.messages || [];

    // Fetch detailed metadata for each email (including the Subject header)
    const detailedEmails = await Promise.all(
        emails.map(async (email: any) => {
            const message = await gmail.users.messages.get({
                userId: 'me',
                id: email.id,
                format: 'metadata',
                metadataHeaders: ['Subject']
            });
            return message.data;
        })
    );

    // Filter out emails based on subject content using additional heuristics if needed
    return detailedEmails.filter(email => {
        const headers = email.payload?.headers || [];
        const subjectHeader = headers.find((header: any) => header.name.toLowerCase() === 'subject');
        const subject = subjectHeader?.value?.toLowerCase() || '';

        // Additional filtering can be done here if necessary.
        return true;
    });
};

export const getEmailThread = async (threadId: string): Promise<any> => {
    const res = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full'
    });
    return res.data;
};

export const markEmailAsProcessed = async (messageId: string): Promise<void> => {
    await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            removeLabelIds: ['UNREAD']
        }
    });
};

export const extractTextFromMessage = (message: any): string => {
    if (message.payload?.parts) {
        for (const part of message.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                const buff = Buffer.from(part.body.data, 'base64');
                return buff.toString('utf8');
            }
        }
    }
    return message.snippet || '';
};
