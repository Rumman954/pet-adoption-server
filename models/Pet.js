import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    species: {
      type: String,
      required: true,
      enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'],
    },
    breed: { type: String, required: true, trim: true },
    age: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    image: { type: String, required: true },
    healthStatus: { type: String, required: true },
    vaccinationStatus: { type: String, required: true },
    location: { type: String, required: true },
    adoptionFee: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    ownerEmail: { type: String, required: true, lowercase: true },
    status: { type: String, enum: ['available', 'adopted'], default: 'available' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Pet', petSchema);
