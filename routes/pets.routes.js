import express from 'express';
import Pet from '../models/Pet.js';
import AdoptionRequest from '../models/AdoptionRequest.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, species, sort } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (species) {
      const speciesList = species.split(',').map((s) => s.trim());
      if (speciesList.includes('Others')) {
        filter.species = { $in: ['Others', 'Other', 'Rabbit', 'Fish'] };
      } else {
        filter.species = { $in: speciesList };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'fee-low') sortOption = { adoptionFee: 1 };
    if (sort === 'fee-high') sortOption = { adoptionFee: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const pets = await Pet.find(filter).sort(sortOption);
    res.json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    let pets = await Pet.find({ status: 'available', featured: true }).limit(6);
    if (pets.length < 6) {
      const extra = await Pet.find({ status: 'available', featured: { $ne: true } })
        .limit(6 - pets.length)
        .sort({ createdAt: -1 });
      pets = [...pets, ...extra];
    }
    res.json({ success: true, pets: pets.slice(0, 6) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-listings', verifyToken, async (req, res) => {
  try {
    const pets = await Pet.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 });
    const total = pets.length;
    const available = pets.filter((p) => p.status === 'available').length;
    const adopted = pets.filter((p) => p.status === 'adopted').length;

    res.json({
      success: true,
      pets,
      stats: { total, available, adopted },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }
    res.json({ success: true, pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const data = { ...req.body, ownerEmail: req.user.email };
    const pet = await Pet.create(data);
    res.status(201).json({ success: true, message: 'Pet listed successfully.', pet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only update your own listings.' });
    }

    const updated = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Pet updated successfully.', pet: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only delete your own listings.' });
    }

    await AdoptionRequest.deleteMany({ petId: pet._id });
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pet deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
