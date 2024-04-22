
# SPD Care Project Readme

## Authors
- Pallavi Das - padas@calpoly.edu
- Ryan Gertz - rgertz@calpoly.edu

## Table of Contents
- [Frontend - React App](#frontend---react-app)
- [Backend Services](#backend-services)
- [AWS SAM for Backend Deployment](#aws-sam-for-backend-deployment)
- [Additional Resource Links](#additional-resource-links)

## Frontend - React app

### Background
- The frontend React app initializes by displaying a landing page where it lists calls with the "active" attribute set to true from an AWS DynamoDB table.
- Clicking on a call box leads to a call page where a WebSocket connection is established with AWS using the react-use-websocket library.
- The app displays the top 3 predictions made by the AI model in real-time, represented by dynamically sized bubbles.
- Once the AI model's prediction stabilizes, the WebSocket sends a boolean value, and the UI transitions to show the dominant prediction and instructions for the operator.

### Prerequisites
- Node.js
- Vite
- Public facing S3 bucket

### Setup
To install project dependencies:
```bash
npm install
```

### Local Development
Run the application locally with:
```bash
npm run dev
```

### Building the Application
Build and package the project using:
```bash
npm run build
```

### Deploying to Amazon S3
Deploy to a public S3 bucket with:
```bash
aws s3 sync <build directory> <s3 destination link>
```

### Known Bugs/Concerns
- Overflow issues with lengthy call instructions.
- Hardcoded placeholder text in various components.

## Backend Services

### Overview
The backend is responsible for audio processing, transcription via AWS Transcribe, storing call data, and sending predictions to the frontend through WebSocket connections managed by AWS Lambda.

### Audio Diarization - `audio_diarization.py`
This script handles real-time transcription excluding the call operator's speech and updates the `current_calls` DynamoDB table.

#### Prerequisites for Backend
- AWS CLI
- Python 3.x
- Libraries: Boto3, Sounddevice, Amazon Transcribe Streaming Service

#### Running the Script
Start processing audio streams with:
```bash
python3 audio_diarization.py
```

### AWS Lambda Functions
#### `SendSessionData`
Triggered by updates to `PredictionsTable`, it evaluates prediction stability and communicates with the frontend.

#### `Connect` and `Disconnect`
Manage WebSocket connections, adding or removing entries in `ConnectionIdMappingTable`.

### DynamoDB Tables
#### ConnectionIdMappingTable
Stores WebSocket connection IDs.

#### current_calls
Contains transcriptions of ongoing calls.

#### PredictionsTable
Captures predictive analysis data.

### WebSocket API via API Gateway (`SPD Demo`)
Manages full-duplex communication with the frontend.

### Known Bugs/Concerns
- Hardcoded 'Seattle' as call location.
- Lack of support for concurrent call handling.

### Future Backend Work
- Enable multiple simultaneous call sessions.
- Dynamically determine the operation location.

## AWS SAM for Backend Deployment
Use AWS Serverless Application Model (SAM) for deployment with the `template.yaml` file:
```bash
sam build
sam deploy --guided
```

## Additional Resource Links
- [AWS SAM configuration](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)
- [Vite guide](https://vitejs.dev/guide/)