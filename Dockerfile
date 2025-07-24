FROM python:3.11-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-download Whisper model to avoid download on first run
RUN python -c "import whisper; whisper.load_model('base')"

# Expose the Flask port
EXPOSE 5000

# Set environment variable to indicate Docker environment
ENV DOCKER_ENV=1

# Command to run the application
CMD ["python", "server.py"]