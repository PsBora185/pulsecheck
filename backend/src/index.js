import express from 'express';
import cors from 'cors';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import pg from 'pg';
import promClient from 'prom-client';

const app = express();
app.use(cors());
app.use(express.json());

// Redis Config
const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

// PostgreSQL Config
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pulsecheck',
});

// Prometheus Setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
const pingLatencyGauge = new promClient.Gauge({
  name: 'pulsecheck_ping_latency_ms',
  help: 'Latency of service pings in ms',
  labelNames: ['url']
});

// BullMQ Queue
const pingQueue = new Queue('pingQueue', { connection: redisOptions });

const worker = new Worker('pingQueue', async job => {
  const { url } = job.data;
  const start = Date.now();
  let isUp = false;
  
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    isUp = res.ok;
  } catch (err) {
    isUp = false;
  }
  
  const latency = Date.now() - start;
  pingLatencyGauge.set({ url }, latency);
  
  // Store result in DB
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO pings(url, is_up, latency) VALUES($1, $2, $3)',
       [url, isUp, latency]
    );
  } catch(e) {
    console.error('DB Insert Error:', e);
  } finally {
    client.release();
  }
  
  // Cache latest in Redis
  const redisCache = new Redis({ host: redisOptions.host, port: redisOptions.port });
  await redisCache.hset('latest_status', url, JSON.stringify({ isUp, latency, ts: Date.now() }));
  redisCache.quit();

}, { connection: redisOptions });

// API Routes
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/api/status', async (req, res) => {
  try {
    const redisCache = new Redis({ host: redisOptions.host, port: redisOptions.port });
    const data = await redisCache.hgetall('latest_status');
    redisCache.quit();
    
    const results = Object.keys(data).map(url => ({
      url,
      ...JSON.parse(data[url])
    }));
    
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/monitor', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  await pingQueue.add('pingJob', { url }, { repeat: { every: 10000 } });
  res.json({ message: `Now monitoring ${url}` });
});

// Initialization
async function init() {
  let client;
  for (let i = 0; i < 5; i++) {
    try {
      client = await pool.connect();
      console.log('Connected to PostgreSQL successfully');
      break;
    } catch(e) {
      console.error(`PostgreSQL connection failed, retrying in 5 seconds... (${i+1}/5)`);
      if (i === 4) throw e;
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pings (
        id SERIAL PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        is_up BOOLEAN NOT NULL,
        latency INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch(e) {
    console.error('Init DB Error:', e);
  } finally {
    client.release();
  }
  
  // Add seed jobs
  await pingQueue.add('pingJob', { url: 'https://example.com' }, { repeat: { every: 10000, pattern: '* * * * * *' } });
}
init();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
