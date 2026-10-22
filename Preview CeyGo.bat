@echo off
title CeyGo preview
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\preview-site.ps1"
if errorlevel 1 pause
