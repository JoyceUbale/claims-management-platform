import { Router } from 'express';
import { Claim } from '../models/Claim.js';

const router = Router();

// GET /api/claims — list with optional ?status= & ?sort= & ?min= & ?max= filters
router.get('/', async (req, res) => {
  try {
    const { status, sort, min, max } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (min) filter.claimAmount = { ...filter.claimAmount, $gte: Number(min) };
    if (max) filter.claimAmount = { ...filter.claimAmount, $lte: Number(max) };

    let query = Claim.find(filter);
    switch (sort) {
      case 'oldest':
        query = query.sort({ submissionDate: 1 });
        break;
      case 'amount-high':
        query = query.sort({ claimAmount: -1 });
        break;
      case 'amount-low':
        query = query.sort({ claimAmount: 1 });
        break;
      case 'newest':
      default:
        query = query.sort({ submissionDate: -1 });
    }

    const claims = await query.exec();
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claims', detail: err.message });
  }
});

// GET /api/claims/:id — single claim
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    res.status(400).json({ error: 'Invalid claim id', detail: err.message });
  }
});

// POST /api/claims — submit a new claim
router.post('/', async (req, res) => {
  try {
    const { name, email, claimAmount, description, documentUrl } = req.body;
    if (!name || !email || claimAmount == null || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const claim = await Claim.create({
      name,
      email,
      claimAmount: Number(claimAmount),
      description,
      documentUrl: documentUrl ?? null,
      status: 'Pending',
    });
    res.status(201).json(claim);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create claim', detail: err.message });
  }
});

// PATCH /api/claims/:id — update status, approvedAmount, insurerComments
router.patch('/:id', async (req, res) => {
  try {
    const { status, approvedAmount, insurerComments } = req.body;
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = { status };
    if (approvedAmount !== undefined) update.approvedAmount = approvedAmount;
    if (insurerComments !== undefined) update.insurerComments = insurerComments;

    const claim = await Claim.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update claim', detail: err.message });
  }
});

export default router;
