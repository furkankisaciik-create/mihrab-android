@echo off
set "NODE_BIN=C:\Users\ezgic\AppData\Local\OpenAI\Codex\runtimes\cua_node\415ffebf3d576e9b\bin"
set "PATH=%NODE_BIN%;%PATH%"
cd /d "%~dp0mobile"
"%NODE_BIN%\npx.cmd" expo start --lan
