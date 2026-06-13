@echo off
setlocal

set "CI=1"
set "EXPO_NO_TELEMETRY=1"
set "EXPO_UNSTABLE_HEADLESS=1"
set "EXPO_UNSTABLE_BONJOUR=0"
set "EXPO_NO_WEB_SETUP=0"
set "NODE_OPTIONS=--use-system-ca --max-old-space-size=768"
set "__UNSAFE_EXPO_HOME_DIRECTORY=%~dp0..\.expo-local"

pushd "%~dp0.."
"%~dp0..\..\node-v24.16.0-win-x64\node.exe" "%~dp0..\node_modules\expo\bin\cli" start --web --lan --port 8081
popd
