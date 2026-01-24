import http from 'http';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const LOG_FILE = 'startup_log.txt';

// LOGGING FUNCTION
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}

log('----------------------------------------');
log('🚀 STARTING INDEX.JS (FALLBACK ENTRY)');
log(`Running on Node version: ${process.version}`);

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Index.js is RUNNING! Port: ${PORT}`);
});

server.listen(PORT, '0.0.0.0', () => {
    log(`✅ Server listening on port ${PORT}`);
});
