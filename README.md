# Email Task Extractor

This project processes real Gmail threads to extract actionable tasks. It uses a Redis-backed queue and a LangGraph-based LLM orchestration pipeline to analyze email conversations, filter out irrelevant messages, and prevent duplicate tasks across threads.

---

## Pipeline Flow

1. **Real Email Integration**  
   - **Connect to Gmail:** Uses the Gmail API (OAuth2) to access the user’s inbox.  
   - **Fetch Emails:** Retrieves new, unread emails while filtering out promotions, newsletters, spam, and other irrelevant messages.  
   - **Thread Grouping:** Groups emails by thread to maintain conversation context.

2. **Email Queuing**  
   - **Enqueue Emails:** New emails are pushed to a Redis-backed queue.  
   - **Mark as Queued:** Ensures emails are not processed more than once.

3. **LLM-Powered Task Extraction**  
   - **Dequeue & Retrieve Thread:** A worker process dequeues emails and fetches the full email thread.  
   - **Summarize:** A LangGraph “Summarize Node” generates a concise summary of the conversation.  
   - **Extract Task:** A subsequent “Extract Task Node” determines whether the summary contains an actionable item and extracts task details (title, description, due date, priority, assignee).

4. **Smart Filtering & Deduplication**  
   - **Filtering:** Additional heuristics ignore newsletters, cold outreach, and other non-actionable emails.  
   - **Deduplication:** Processed threads and task hashes are tracked in a SQLite database to prevent duplicate entries.

5. **Persistence**  
   - **Store Data:** Actionable tasks and email metadata are stored persistently in a SQLite database.

---

## How to Run the Project

### 1. Start the Application Server

Run the following command to start the Express server:

```bash
npm start
```

This command starts the server (default port: 3000) that listens for webhook notifications and manual processing requests.

---

### 2. Start the Worker Process

In a separate terminal window, start the worker process to handle email processing from the queue:

```bash
npx ts-node src/workers/emailWorker.ts
```

The worker processes emails concurrently from the Redis-backed queue.

---

### 3. Ensure Redis Is Running Locally

Make sure you have a Redis instance running on `127.0.0.1:6379`.

#### Using Docker:
```bash
docker run --name redis -p 6379:6379 -d redis
```

#### Using WSL (Windows):
1. Open your WSL terminal.
2. Start Redis with:
   ```bash
   sudo service redis-server start
   ```
3. Verify Redis is running:
   ```bash
   redis-cli ping
   ```
   You should see:
   ```
   PONG
   ```

---

## Usage Overview

- **Webhook Endpoint:**  
  The server exposes a `/webhook` endpoint to receive Gmail push notifications.

- **Manual Processing:**  
  You can trigger email processing manually by visiting:
  ```
  http://localhost:3000/process-emails
  ```

- **Task Extraction Pipeline:**  
  - **Summarize Node:** Generates a summary of the email thread.  
  - **Extract Task Node:** Determines if an actionable task exists and extracts details if so.

- **Deduplication:**  
  Tasks are stored only once per email thread to avoid duplicates.

---

Follow the steps above to run the Email Task Extractor and see the entire pipeline in action.
```

This file outlines the high-level flow of the system, how each component works, and the steps required to run the project.