import express from 'express';
import Pet from '../models/Pet.js';
import AdoptionRequest from '../models/AdoptionRequest.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pet/:petId', verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Only the pet owner can view requests.' });
    }

    const requests = await AdoptionRequest.find({ petId: pet._id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { petId, petName, pickupDate, message } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }

    if (pet.ownerEmail === req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Pet owners cannot submit adoption requests for their own pets.',
      });
    }

    if (pet.status === 'adopted') {
      return res.status(400).json({ success: false, message: 'This pet has already been adopted.' });
    }

    const existingPending = await AdoptionRequest.findOne({
      petId,
      userEmail: req.user.email,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this pet.' });
    }

    const request = await AdoptionRequest.create({
      petId,
      petName: petName || pet.name,
      userName: req.user.name,
      userEmail: req.user.email,
      ownerEmail: pet.ownerEmail,
      pickupDate,
      message: message || '',
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Adoption request submitted.', request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/approve', verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Only the pet owner can approve requests.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request is already processed.' });
    }

    const pet = await Pet.findById(request.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }

    if (pet.status === 'adopted') {
      return res.status(400).json({ success: false, message: 'This pet is already adopted.' });
    }

    request.status = 'approved';
    await request.save();

    pet.status = 'adopted';
    await pet.save();

    await AdoptionRequest.updateMany(
      { petId: pet._id, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected' }
    );

    res.json({ success: true, message: 'Request approved. Pet marked as adopted.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/reject', verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Only the pet owner can reject requests.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request is already processed.' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.userEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own requests.' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Approved requests cannot be cancelled.' });
    }

    await AdoptionRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Request cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
