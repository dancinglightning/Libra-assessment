// ./config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export default {
    gmail: {
        clientId: process.env.GMAIL_CLIENT_ID || '',
        clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
        redirectUri: process.env.GMAIL_REDIRECT_URI || '',
        refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
    },
    llm: {
        apiKey: process.env.LLM_API_KEY || ''
    },
    database: {
        filename: process.env.DB_FILENAME || 'database.sqlite'
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
};
