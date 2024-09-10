import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import os
from flask import Flask, request, jsonify
import whisper
import torch
import tempfile
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This allows all origins; you can customize as needed

# Load Whisper model (on GPU if available)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=device)

@app.route('/')
def home():
    return "Whisper Live Transcription Server Running!"

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Ensure audio file is present in request
    if 'audio_data' not in request.files:
        return jsonify({"error": "No audio data found!"}), 400
    
    audio_file = request.files['audio_data']
    
    # Save the file temporarily
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio_file:
        audio_file.save(temp_audio_file.name)

    # Transcribe the temporary audio file using Whisper
    result = model.transcribe(temp_audio_file.name, fp16=False, language="Swedish")
    
    # Clean up the temporary file
    os.remove(temp_audio_file.name)
    
    transcription = result["text"]
    
    return jsonify({"transcription": transcription})

if __name__ == "__main__":
    app.run(debug=True)
