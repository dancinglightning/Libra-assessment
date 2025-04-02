# Email Task Extractor

This project processes real Gmail threads to extract actionable tasks using a Redis-backed queue and a LangGraph-based LLM orchestration pipeline. It connects to a Gmail inbox, filters out irrelevant emails, queues new emails for processing, and uses LLM-powered nodes to generate tasks only when necessary—all while preventing duplicate task creation.

---

## Setup Steps

1. **Clone the Repository and Change Directory:**

   ```bash
   git clone https://github.com/dancinglightning/Libra-assessment.git
   cd email-task-extractor
   ```
2. **Install Dependencies:**

   ```bash
   npm install
   ```
3. **Ensure Redis Is Running Locally:**

   - **Using Docker:**

     ```bash
     docker run --name redis -p 6379:6379 -d redis
     ```
   - **Using WSL (Windows):**

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

## How the Queuing & Extraction Pipeline Works

1. **Real Email Integration:**

   - **Connect to Gmail:** Uses the Gmail API with OAuth2 to access the user's inbox.
   - **Fetch Emails:** Retrieves unread emails while filtering out promotions, newsletters, spam, and other irrelevant messages.
   - **Thread Grouping:** Groups emails by thread so that conversation context is maintained.
2. **Email Queuing:**

   - **Enqueue Emails:** New emails are pushed into a Redis-backed queue (using BullMQ) to ensure that each email is processed only once.
   - **Mark as Queued:** This prevents the same email from being processed multiple times.
3. **LLM-Powered Task Extraction:**

   - **Dequeue & Retrieve Thread:** A worker process dequeues emails and retrieves the complete email thread.
   - **Summarize:** A LangGraph “Summarize Node” generates a concise summary of the conversation.
   - **Extract Task:** A subsequent “Extract Task Node” checks if the summary contains an actionable item and, if so, extracts task details such as title, description, due date, priority, and assignee.
4. **Smart Filtering & Deduplication:**

   - **Filtering:** Additional heuristics ignore newsletters, cold outreach, and unsolicited messages.
   - **Deduplication:** Processed threads and task hashes are stored in a SQLite database to prevent duplicate tasks across follow-up emails.
5. **Persistence:**

   - **Store Data:** Actionable tasks and email metadata are persistently stored in a SQLite database, ensuring that duplicate tasks are not created.

---

## Design Choices and Trade-Offs

- **Redis for Queuing:**

  - **Choice:** Redis (with BullMQ) was chosen for its speed, persistence, and support for concurrent processing.
  - **Trade-Off:** While Redis is excellent for handling high-throughput scenarios, it adds an external dependency. For a prototype, an in-memory queue could be simpler, but it would lack persistence and scalability.
- **LLM Orchestration with LangGraph:**

  - **Choice:** LangGraph provides a simple way to chain LLM calls and handle multi-step processing (summarization followed by task extraction).
  - **Trade-Off:** This design is flexible but might require further refinement for more complex email threads or advanced task extraction logic.
- **SQLite for Persistence:**

  - **Choice:** SQLite was selected for its simplicity and ease of setup, making it ideal for prototyping.
  - **Trade-Off:** For production or high-scale systems, a more robust database (like PostgreSQL) may be necessary to handle increased load and concurrency.
- **Gmail API Integration:**

  - **Choice:** Direct integration with Gmail ensures that real emails are processed.
  - **Trade-Off:** Gmail API usage is subject to quotas and requires proper handling of OAuth2 token refreshes.
- **Separation of Concerns:**

  - **Choice:** The system separates enqueuing (app.ts) from processing (workers/emailWorker.ts), improving scalability and maintainability.
  - **Trade-Off:** This separation means that you need to manage multiple processes and ensure that they are properly orchestrated.

---

## How to Run the Project

### 1. Start the Application Server

Run the following command to start the Express server:

```bash
npm start
```

This command starts the server on the default port (3000) and listens for webhook notifications and manual processing requests.

### 2. Start the Worker Process

In a separate terminal window, start the worker process to handle queued emails:

```bash
npm run worker
```

The worker processes emails concurrently from the Redis-backed queue.

### 3. Trigger Email Processing

- **Webhook:** The server exposes a `/webhook` endpoint to receive Gmail push notifications.
- **Manual Processing:** You can also manually trigger email processing by visiting:

  ```
  http://localhost:3000/process-emails
  ```

---

Follow these instructions to run the Email Task Extractor and observe the complete pipeline in action.

```

This updated README now clearly explains the setup steps, details the queuing and extraction pipeline, and includes design choices and trade-offs as requested.
```
