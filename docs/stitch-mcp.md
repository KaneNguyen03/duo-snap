# Stitch MCP setup

Duo Snap is ready for Google Stitch MCP, but the server needs a Google API key with Stitch access.

VS Code and Cursor can use .vscode/mcp.json. Restart MCP servers and enter the Google API key when prompted.

Codex CLI command after you have the key:

codex mcp add stitch --env GOOGLE_API_KEY=YOUR_KEY --env PROJECT_ROOT=C:\Users\nguye\Documents\Codex\2026-09-25\banj\duo-snap -- npx -y mcp-stitch

Then run codex mcp list and ask Codex to call stitch_status.

Suggested Stitch prompt:

Design a native mobile app called Duo Snap for one private couple, inspired by Locket but warmer and more intimate. Screens: camera-first home with big circular shutter, latest partner snap widget, private couple timeline, reactions with hearts and short captions, daily streak, invite partner by code, soft cream/pink gradient, rounded cards, playful but premium. Vietnamese friendly copy.
