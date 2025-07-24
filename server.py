import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import os
import whisper
import torch
import tempfile
import traceback
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Add error logging
import logging
logging.basicConfig(level=logging.DEBUG,
                   format='%(asctime)s - %(levelname)s - %(message)s')

# Load Whisper model (on GPU if available)
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = os.environ.get('WHISPER_MODEL', 'base')
logging.info(f"Loading Whisper model: {model_name}")
model = whisper.load_model(model_name, device=device)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    language = request.args.get('lang', 'English')
   
    if 'audio_data' not in request.files:
        return jsonify({"error": "No audio data found!"}), 400
    
    audio_file = request.files['audio_data']
    if audio_file.filename == '':
        return jsonify({"error": "No selected file!"}), 400
    
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio_file:
            audio_file.save(temp_audio_file.name)
            logging.debug(f"Saved temporary file: {temp_audio_file.name}")
            
        result = model.transcribe(temp_audio_file.name, fp16=False, language=language)
        transcription = result.get("text", "")
        
    except Exception as e:
        error_tb = traceback.format_exc()
        logging.error(f"Error during transcription: {str(e)}\n{error_tb}")
        return jsonify({
            "error": str(e),
            "traceback": error_tb,
            "details": {
                "language": language,
                "device": str(device),
                "model": "base"
            }
        }), 500
        
    finally:
        if os.path.exists(temp_audio_file.name):
            os.remove(temp_audio_file.name)
            logging.debug(f"Removed temporary file: {temp_audio_file.name}")
    
    return jsonify({"transcription": transcription})

if __name__ == "__main__":
    # Configure host and port based on environment
    host = os.environ.get('SERVER_HOST', '0.0.0.0' if os.environ.get('DOCKER_ENV') else '127.0.0.1')
    port = int(os.environ.get('SERVER_PORT', 5000))
    
    logging.info(f"Starting server with device: {device}")
    logging.info(f"Server will run on {host}:{port}")
    app.run(host=host, port=port, debug=True, threaded=True)
