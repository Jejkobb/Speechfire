@echo off
cd /d %~dp0
call whisper-env\Scripts\activate
python app.py
pause
