import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { env } from '../../../packages/config/config';
import eventsRouter from './routes/events';
import workspacesRouter from './routes/workspaces';
import { errorHandler } from './middleware/errorHandler';
import client, { collectDefaultMetrics } from 'prom-client';
import { setupWebSocketServer } from './websocket';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use(eventsRouter);
app.use(workspacesRouter);

// Prometheus metrics endpoint (scrape only)
collectDefaultMetrics();
// for Prometheus
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(errorHandler);

// WebSocket server
const server = http.createServer(app);
setupWebSocketServer(server);

const PORT = env.PORT || 8009;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${PORT}`);
});
