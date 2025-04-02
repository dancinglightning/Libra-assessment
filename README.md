# Libra-assessment

## Email Task Extractor in Python

This prototype system connects to a Gmail inbox, processes email threads using a simple LangGraph orchestration pipeline, and extracts actionable tasks.

### Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt

2. Create a .env file in the project root with your credentials:

```
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=your_redirect_uri
GMAIL_REFRESH_TOKEN=your_refresh_token
LLM_API_KEY=your_llm_api_key
DB_FILENAME=database.sqlite
PORT=5000
```

3. Run the application:

```
python -m app.main
```

The system will check for new emails every 60 seconds, process them through the LangGraph pipeline, and extract actionable tasks.

