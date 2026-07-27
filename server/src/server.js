import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, isMemoryMode } from './db.js';
import {
  listMemory,
  getMemory,
  createMemory,
  updateMemory,
} from './memoryStore.js';
import claimsRouter from './routes/claims.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '15mb' })); // 15mb to accept base64 documents

const origin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';
app.use(cors({ origin }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: isMemoryMode() ? 'memory' : 'mongodb' });
});

// When running in memory mode, intercept the same routes the Mongoose router
// would handle, so the API contract is identical either way.
app.use((req, res, next) => {
  if (!isMemoryMode()) return next();

  if (req.method === 'GET' && req.path === '/api/claims') {
    return res.json(
      listMemory({
        status: req.query.status,
        min: req.query.min,
        max: req.query.max,
        sort: req.query.sort,
      }),
    );
  }
  if (req.method === 'GET' && /^\/api\/claims\/[^/]+$/.test(req.path)) {
    const claim = getMemory(req.path.split('/').pop());
    return claim ? res.json(claim) : res.status(404).json({ error: 'Claim not found' });
  }
  if (req.method === 'POST' && req.path === '/api/claims') {
    const { name, email, claimAmount, description, documentUrl } = req.body;
    if (!name || !email || claimAmount == null || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    return res.status(201).json(
      createMemory({
        name,
        email,
        claimAmount: Number(claimAmount),
        description,
        documentUrl: documentUrl ?? null,
      }),
    );
  }
  if (req.method === 'PATCH' && /^\/api\/claims\/[^/]+$/.test(req.path)) {
    const { status, approvedAmount, insurerComments } = req.body;
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = { status };
    if (approvedAmount !== undefined) update.approvedAmount = approvedAmount;
    if (insurerComments !== undefined) update.insurerComments = insurerComments;
    const claim = updateMemory(req.path.split('/').pop(), update);
    return claim ? res.json(claim) : res.status(404).json({ error: 'Claim not found' });
  }
  next();
});

app.use('/api/claims', claimsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[api] ClaimFlow API listening on http://localhost:${PORT}`);
  });
});
