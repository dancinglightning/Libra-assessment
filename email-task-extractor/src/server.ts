import express from 'express';
import { processEmails } from './app';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Webhook endpoint for Gmail push notifications
app.post('/webhook', async (req, res) => {
    console.log('Received webhook:', req.body);
    await processEmails();
    res.sendStatus(200);
});

// Endpoint to trigger manual email processing
app.get('/process-emails', async (req, res) => {
    await processEmails();
    res.send('Processed emails');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
