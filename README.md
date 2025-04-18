# Collaboration
Thanks for your interest in our solution.  Having specific examples of replication and cloning allows us to continue to grow and scale our work. If you clone or download this repository, kindly shoot us a quick email to let us know you are interested in this work!

[wwps-cic@amazon.com] 

# Disclaimers

**Customers are responsible for making their own independent assessment of the information in this document.**

**This document:**

(a) is for informational purposes only, 

(b) represents current AWS product offerings and practices, which are subject to change without notice, and 

(c) does not create any commitments or assurances from AWS and its affiliates, suppliers or licensors. AWS products or services are provided “as is” without warranties, representations, or conditions of any kind, whether express or implied. The responsibilities and liabilities of AWS to its customers are controlled by AWS agreements, and this document is not part of, nor does it modify, any agreement between AWS and its customers. 

(d) is not to be considered a recommendation or viewpoint of AWS

**Additionally, all prototype code and associated assets should be considered:**

(a) as-is and without warranties

(b) not suitable for production environments

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

### Background
- The backend of the SPD Care Project is constructed using AWS serverless technologies which are orchestrated to handle data-intensive operations and real-time interactions.
- Key functionalities include audio processing, data transcription via AWS Transcribe, and real-time prediction delivery through WebSocket connections managed by AWS Lambda functions.
- The system is designed for high availability and scalability, ensuring it can handle an increasing load of data and user interactions without performance bottlenecks.

### Overview
The backend is responsible for audio processing, transcription via AWS Transcribe, storing call data, and sending predictions to the frontend through WebSocket connections managed by AWS Lambda.

### Audio Diarization - `audio_diarization.py`
This Python script records audio from a local microphone, sends the audio stream to AWS Transcribe, and writes the transcription to the `current_calls` DynamoDB table in real time, excluding the 911 call operator's speech.

#### Prerequisites for Backend
- AWS CLI
- Python 3.x
- Libraries: Boto3, Sounddevice, Amazon Transcribe Streaming Service

#### Environment Setup
Before running the script, ensure that the AWS credentials are set up with the required permissions to access Transcribe services and DynamoDB.

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
This table stores connection IDs for WebSocket clients, which are used to send prediction data to the frontend.

#### current_calls
This table holds the real-time transcription data, with each row representing a single call. The `audio_diarization.py` script updates this table.

#### PredictionsTable
This table captures prediction data from the machine learning model. The `SendSessionData` Lambda function reads from this table to process and send predictions.

### WebSocket API via API Gateway (`SPD Demo`)
This interface provides full-duplex communication channels over a single TCP connection. It enables real-time data exchange between the client and server.

#### Routes
- `connect`: Invoked when a client establishes a new WebSocket connection.
- `disconnect`: Invoked when a client's WebSocket connection is closed.

### Known Bugs/Concerns
- Hardcoded 'Seattle' as call location.
- Lack of support for concurrent call handling.

### Future Backend Work
- Enable multiple simultaneous call sessions.
- Dynamically determine the operation location.
- Accurate stability modeling.

## AWS SAM for Backend Deployment
Use AWS Serverless Application Model (SAM) for deployment with the `template.yaml` file:
```bash
sam build
sam deploy --guided
```

## Additional Resource Links
- [AWS SAM configuration](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)
- [Vite guide](https://vitejs.dev/guide/)

## Support
For any queries or issues, please contact:
- Darren Kraker, Sr Solutions Architect - dkraker@amazon.com
- Pallavi Das, Software Developer Intern - padas@calpoly.edu
- Ryan Gertz, Software Developer Intern - rgertz@calpoly.edu
