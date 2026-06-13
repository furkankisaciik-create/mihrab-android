Set-Location (Resolve-Path "$PSScriptRoot\..")

$nodeDir = Resolve-Path '..\node-v24.16.0-win-x64'
$env:PATH = "$nodeDir;$env:PATH"
$env:NODE_OPTIONS = '--use-system-ca'
$env:__UNSAFE_EXPO_HOME_DIRECTORY = Join-Path (Get-Location) '.expo-local'
$env:EXPO_NO_TELEMETRY = '1'

& "$nodeDir\node.exe" '.\node_modules\expo\bin\cli' start --lan --clear *>> '.expo-server.log'
