# Vauntico Fulfillment Engine

## Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/Tygertbone/vauntico-fulfillment-engine.git
   cd vauntico-fulfillment-engine
   npm install
   ```

2. Create a `.env` file in the project root with these variables:
   ```env
   AIRTABLE_API_KEY=your_airtable_pat
   AIRTABLE_BASE_ID=appBhHL11mxVND348
   AIRTABLE_TABLE_NAME=Digital Products
   RESEND_API_KEY=your_resend_key
   SENDER_EMAIL=your@email.com
   PORT=5000
   ```

## Running the Server

```bash
npm start
```

## Fulfillment Endpoint

POST `/api/fulfillment/run`
- Body: `{ "recordId": "<airtable_record_id>" }`
- Returns: `{ success: true, messageId }` on success

## Health Check

GET `/api/status` returns `{ status: 'ok' }`.

## Notes
- `.env` is excluded from version control.
- All errors are logged with stack traces and returned as JSON.
- For production, set `NODE_ENV=production` and use a process manager (e.g., PM2).

## License
MIT
