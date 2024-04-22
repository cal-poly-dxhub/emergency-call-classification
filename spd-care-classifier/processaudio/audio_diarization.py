import asyncio
import boto3
import os
import datetime
import sounddevice
from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent
import amazon_transcribe

# Initialize DynamoDB resources
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('current_calls')

class MyEventHandler(TranscriptResultStreamHandler):
    """ Handles transcription events and manages state for a transcription session. """
    def __init__(self, session_id, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_id = session_id
        self.current_transcript = ""
        self.partial_transcript = ""
        self.last_final_time = None
        self.complete_transcript = []  # List to store all final transcriptions
        self.full_transcript = ""

    async def handle_transcript_event(self, transcript_event: TranscriptEvent):
        """ Processes transcription results, updates partial and complete transcripts. """
        now = asyncio.get_event_loop().time()
        results = transcript_event.transcript.results
        for result in results:
            if result.is_partial:
                # Handle partial results (still being spoken), assuming speaker 0 is Call Operator
                partial_contents = self.extract_speaker_content(result, exclude_speaker=0)
                if partial_contents:
                    # Log and update partial results
                    self.partial_transcript = ' '.join(partial_contents)
                    # dynamo table is updated with every word spoken
                    self.update_transcript_in_dynamodb(self.session_id, self.full_transcript + self.partial_transcript)
                    print("Partial (Excluding Speaker 0):", self.partial_transcript)
            else:
                # Handle final results (speaking has stopped)
                final_contents = self.extract_speaker_content(result, exclude_speaker=0)
                if final_contents:
                    self.current_transcript = ' '.join(final_contents)
                    self.complete_transcript.append(self.current_transcript)
                    self.full_transcript = "\n".join(self.complete_transcript)
                    self.update_transcript_in_dynamodb(self.session_id, self.full_transcript)
                    print("Final (Excluding Speaker 0):", self.current_transcript)
    
    def extract_speaker_content(self, result, exclude_speaker):
        """ Extracts content from a result excluding the specified speaker. """
        content_list = []
        for alt in result.alternatives:
            for item in alt.items:
                # print(item.speaker)
                if item.speaker is not None and item.speaker != "None" and item.speaker != exclude_speaker and item.speaker!=str(exclude_speaker):
                    content_list.append(item.content)
        return content_list

    def update_transcript_in_dynamodb(self, session_id, transcript, is_active=True):
        """ Updates the transcription record in DynamoDB. """
        try:
            response = table.update_item(
                Key={
                    'id': session_id
                },
                UpdateExpression="set transcript = :t, active = :a, loc = :l",
                ExpressionAttributeValues={
                    ':t': transcript,
                    ':a': is_active,
                    ':l': "Seattle"  # hardcoded for now
                },
                ReturnValues="UPDATED_NEW"
            )
        except Exception as e:
            print(f"Error updating transcript in DynamoDB: {e}")

async def mic_stream():
    """ Captures microphone input and sends the data as an asynchronous stream. """
    loop = asyncio.get_event_loop()
    input_queue = asyncio.Queue()

    def callback(indata, frame_count, time_info, status):
        loop.call_soon_threadsafe(input_queue.put_nowait, (bytes(indata), status))

    stream = sounddevice.RawInputStream(
        channels=1,
        samplerate=16000,
        callback=callback,
        blocksize=1024 * 2,
        dtype="int16",
    )
    with stream:
        while True:
            indata, status = await input_queue.get()
            yield indata, status

async def write_chunks(stream):
    """ Sends audio chunks from the microphone to the transcription service. """
    async for chunk, status in mic_stream():
        await stream.input_stream.send_audio_event(audio_chunk=chunk)
    await stream.input_stream.end_stream()

async def basic_transcribe():
    """ Manages the transcription process including starting, monitoring, and stopping sessions. """
    global current_session_id
    # session id is the current date and time the call started
    current_session_id = datetime.datetime.now().strftime("session_%Y%m%d_%H%M%S")
    print(f"Starting transcription for {current_session_id}...")
    try:
        await start_transcription(current_session_id)
        print(f"Transcription for {current_session_id} ended. Restarting...")
    except KeyboardInterrupt:
        print("Transcription stopped by user.")
        if current_session_id:
            set_session_inactive(current_session_id)
        raise

def set_session_inactive(session_id):
    """ 
    Marks the transcription session as inactive in DynamoDB. 
    For now makrking the session as inactive when transcription is stopped. (Ctrl+C)
    """
    try:
        response = table.update_item(
            Key={
                'id': session_id
            },
            UpdateExpression="set active = :a",
            ExpressionAttributeValues={
                ':a': False
            },
            ReturnValues="UPDATED_NEW"
        )
        print(f"Session {session_id} marked as inactive in DynamoDB.")
    except Exception as e:
        print(f"Error setting session {session_id} to inactive in DynamoDB: {e}")

async def start_transcription(session_id):
    """ Configures and starts a new transcription session with Amazon Transcribe. """
    try:
        client = TranscribeStreamingClient(region="us-west-2")
        stream = await client.start_stream_transcription(
            language_code="en-US",
            media_sample_rate_hz=16000,
            media_encoding="pcm",
            show_speaker_label=True,  # Enable diarization
        )
        handler = MyEventHandler(session_id, stream.output_stream)
        await asyncio.gather(write_chunks(stream), handler.handle_events())
    except amazon_transcribe.exceptions.BadRequestException:
        print("Transcription stream timeout. Restarting transcription...")
        await start_transcription(session_id)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(basic_transcribe())
    except KeyboardInterrupt:
        set_session_inactive(current_session_id)
        print("Transcription stopped by user.")