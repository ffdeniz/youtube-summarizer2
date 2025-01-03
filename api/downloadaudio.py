from flask import Flask, jsonify, request
from utils.test import hello_module
import os
from pytubefix import YouTube, Playlist
from pytubefix.cli import on_progress
from pytubefix.exceptions import VideoUnavailable
import time
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

def download_audio_from_youtube(youtube_link, max_retries=5, retry_delay=5):
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1} to download audio from YouTube...")
            yt = YouTube(youtube_link, on_progress_callback=on_progress)
            title = yt.title.replace('/', '-').replace('\\', '-').replace(':', ' -')\
                            .replace('|', '-').replace('?', '-').replace('*', '-')\
                            .replace('"', "'").replace('.', '').replace(',', ' -')
            
            if "- Part" in title:
                project_name, title = title.split("- Part", 1)
                project_name = project_name.strip()
                title = "Part" + title + ".mp3"
            else:
                project_name = "Downloads"
                title = title + ".mp3"

            output_dir = os.path.join(project_name, "audio")
            os.makedirs(output_dir, exist_ok=True)

            audio_path = os.path.join(output_dir, title)
            if os.path.exists(audio_path):
                print(f"Audio file for {title} already exists. Skipping download.")
                return {"success": True, "path": audio_path, "message": "File already exists"}
            
            print(f"Downloading {title} audio from YouTube...")
            audio_stream = yt.streams.get_audio_only()
            audio_stream.download(output_path=output_dir, filename=title)
            
            return {"success": True, "path": audio_path, "message": "Download successful"}
            
        except VideoUnavailable:
            if attempt < max_retries - 1:
                print(f"Video unavailable. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                return {"success": False, "error": "Video unavailable after multiple attempts"}
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                return {"success": False, "error": f"Failed to download: {str(e)}"}

def transcribe_audio(audio_path):
    print(f"Transcribing audio file: {audio_path}")
    try:
        # Get the transcript directory path
        transcript_dir = os.path.join(os.path.dirname(audio_path).replace("/audio/", "/transcripts/"))
        os.makedirs(transcript_dir, exist_ok=True)
        
        # Create transcript file path
        transcript_path = os.path.join(transcript_dir, os.path.basename(audio_path).replace('.mp3', '.txt'))
        
        # Check if transcript already exists
        if os.path.exists(transcript_path):
            print(f"Transcript already exists at {transcript_path}")
            with open(transcript_path, 'r', encoding='utf-8') as file:
                return {"success": True, "transcript": file.read(), "path": transcript_path}
        
        # Open and transcribe the audio file
        with open(audio_path, 'rb') as audio_file:
            print("Sending audio to Whisper API...")
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        # Save the transcript
        with open(transcript_path, 'w', encoding='utf-8') as file:
            file.write(transcript.text)
        
        print(f"Transcription saved to {transcript_path}")
        return {"success": True, "transcript": transcript.text, "path": transcript_path}
        
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return {"success": False, "error": str(e)}

@app.route('/api/downloadaudio', methods=['POST'])
def downloadaudio():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    video_url = data.get('videoUrl')
    should_transcribe = data.get('transcribe', False)  # Optional parameter
    
    if not video_url:
        return jsonify({"error": "No video URL provided"}), 400

    # Download the audio
    download_result = download_audio_from_youtube(video_url)
    
    if not download_result.get("success"):
        return jsonify(download_result), 500

    # If transcription is requested and download was successful
    if should_transcribe:
        transcription_result = transcribe_audio(download_result["path"])
        if transcription_result["success"]:
            return jsonify({
                "success": True,
                "audio_path": download_result["path"],
                "transcript": transcription_result["transcript"],
                "transcript_path": transcription_result["path"],
                "message": "Audio downloaded and transcribed successfully"
            })
        else:
            return jsonify({
                "success": False,
                "audio_path": download_result["path"],
                "error": f"Audio downloaded but transcription failed: {transcription_result['error']}"
            }), 500

    # If only download was requested
    return jsonify(download_result)

if __name__ == '__main__':
    app.run(port=5555, debug=True)