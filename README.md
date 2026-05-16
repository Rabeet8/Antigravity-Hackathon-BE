# NER Service for Pakistani Informal Economy

A Node.js REST API that extracts structured information (Service Type, Location, Time) from Pakistani informal service booking messages in Roman Urdu, Urdu, and English using Google Gemini 1.5 Flash.

## Setup Instructions

1.  **Install Dependencies:**
    ```bash
    cd ner-service
    npm install
    ```

2.  **Configuration:**
    - Open the `.env` file.
    - Replace `your_key_here` with your actual **Google Gemini API Key**.

3.  **Run the Server:**
    ```bash
    # For production
    npm start

    # For development (requires nodemon)
    npm run dev
    ```

## API Endpoints

### 1. Health Check
`GET /api/ner/health`
Returns `{ "status": "ok" }`

### 2. NER Extraction
`POST /api/ner/extract`

**Request Body:**
```json
{
  "message": "Mujhe kal subah G-13 mein AC technician chahiye"
}
```

**Response Body:**
```json
{
  "success": true,
  "original_message": "Mujhe kal subah G-13 mein AC technician chahiye",
  "extracted": {
    "intent": "book_service",
    "service_type": "AC Technician",
    "location": "G-13",
    "time_raw": "kal subah",
    "time_normalized": "tomorrow morning",
    "language_detected": "roman_urdu"
  },
  "confidence": "high",
  "missing_fields": []
}
```

## Supported Service Types (Normalization)
The engine automatically normalizes informal terms to standard English:
- `bijli wala` -> **Electrician**
- `AC wala` -> **AC Technician**
- `nalka wala` / `plumber` -> **Plumber**
- `kaam wali` / `masi` -> **House Maid**
- `badhai` -> **Carpenter**
- ... and more.

## Testing
You can test the endpoint using `curl` or Postman:
```bash
curl -X POST http://localhost:3000/api/ner/extract \
     -H "Content-Type: application/json" \
     -d '{"message": "parso subah F-11 mein painter chahiye"}'
```
