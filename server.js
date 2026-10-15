// ==============================================================================
// FundX Panel — Hostinger Production Server Entrypoint
// Compatible with Hostinger hPanel Node.js Application Manager & Passenger
// ==============================================================================

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV === 'development';
const rawPort = process.env.PORT || '3000';
const port = isNaN(Number(rawPort)) ? rawPort : parseInt(rawPort, 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

const app = next({ dev, hostname, port: typeof port === 'number' ? port : 3000 });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling request:', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.once('error', (err) => {
      console.error('FundX Server failed to start:', err);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`> [FundX Production] Server listening on ${typeof port === 'number' ? `http://${hostname}:${port}` : port}`);
      console.log(`> Domain: https://fundxx.in/`);
      console.log(`> Mode: ${dev ? 'development' : 'production'}`);
    });
  })
  .catch((err) => {
    console.error('Error during app.prepare():', err);
    process.exit(1);
  });
