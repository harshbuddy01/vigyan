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
log('🚀 STARTING APP.JS (NUCLEAR OPTION)');
log(`Running on Node version: ${process.version}`);
log(`Current Directory: ${process.cwd()}`);
log(`Environment PORT: ${process.env.PORT}`);

const server = http.createServer((req, res) => {
    log(`Request received: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`App is RUNNING! 
  Time: ${new Date().toISOString()}
  Port: ${PORT}
  Node: ${process.version}`);
});

server.listen(PORT, '0.0.0.0', () => {
    log(`✅ Server listening on port ${PORT}`);
});

// Handle errors
process.on('uncaughtException', (err) => {
    log(`❌ UNCAUGHT EXCEPTION: ${err.message}`);
    log(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`❌ UNHANDLED REJECTION: ${reason}`);
});
