import { google } from 'googleapis';
import config from '../config';

const { clientId, clientSecret, redirectUri, refreshToken } = config.gmail;

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
// Set the refresh token for the OAuth2 client
oAuth2Client.setCredentials({ refresh_token: refreshToken });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

export const listNewEmails = async (): Promise<any[]> => {
    // Exclude promotions, social, and spam emails.
    const query = 'is:unread -category:promotions -category:social -label:SPAM';
    const res = await gmail.users.messages.list({ userId: 'me', q: query });
    return res.data.messages || [];
};

export const getEmailThread = async (threadId: string): Promise<any> => {
    // Use 'full' format to get complete message details.
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

// Helper function to extract plain text from a Gmail message.
export const extractTextFromMessage = (message: any): string => {
    // Try to decode from message payload parts if available.
    if (message.payload?.parts) {
        for (const part of message.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                const buff = Buffer.from(part.body.data, 'base64');
                return buff.toString('utf8');
            }
        }
    }
    // Fallback to snippet.
    return message.snippet || '';
};
