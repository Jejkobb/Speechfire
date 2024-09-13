import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import os
import whisper
import torch
import tempfile
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load Whisper model (on GPU if available)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=device)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Get the language from the query string, default to 'English' if not provided
    language = request.args.get('lang', 'English')
    
    if 'audio_data' not in request.files:
        return jsonify({"error": "No audio data found!"}), 400

    audio_file = request.files['audio_data']

    # Save the file temporarily
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio_file:
            audio_file.save(temp_audio_file.name)

        # Transcribe the temporary audio file using Whisper with the selected language
        result = model.transcribe(temp_audio_file.name, fp16=False, language=language)

        transcription = result["text"]

    finally:
        # Ensure temp file is deleted even if transcription fails
        if os.path.exists(temp_audio_file.name):
            os.remove(temp_audio_file.name)

    return jsonify({"transcription": transcription})


if __name__ == "__main__":
    app.run(debug=True)
