// ==============================================================================
// FundX Panel — Hostinger Production Server Entrypoint
// Fully Compatible with Hostinger CloudLinux Phusion Passenger & Standalone Node
// ==============================================================================

const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const next = require('next');

function logError(title, err) {
  const logMessage = `[${new Date().toISOString()}] ${title}: ${err && err.stack ? err.stack : err}\n`;
  console.error(logMessage);
  try {
    fs.appendFileSync(path.join(process.cwd(), 'server-error.log'), logMessage);
  } catch (e) {
    // ignore
  }
}

process.on('uncaughtException', (err) => {
  logError('UNCAUGHT EXCEPTION', err);
});

process.on('unhandledRejection', (reason) => {
  logError('UNHANDLED REJECTION', reason);
});

const dev = process.env.NODE_ENV === 'development';
// Next.js application instance
const app = next({ dev });
const handle = app.getRequestHandler();

// Determine port or socket: Passenger sets PORT to 'passenger' or socket path
const port = process.env.PORT || 3000;

app.prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        logError(`Error handling ${req.url}`, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.once('error', (err) => {
      logError('Server listen error', err);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`> [FundX Production] Running on port/socket: ${port}`);
      console.log(`> Domain: https://fundxx.in/`);
      console.log(`> Node Environment: ${process.env.NODE_ENV || 'production'}`);
    });
  })
  .catch((err) => {
    logError('Error during app.prepare()', err);
    process.exit(1);
  });
