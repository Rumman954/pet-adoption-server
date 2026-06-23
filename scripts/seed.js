import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Pet from '../models/Pet.js';
import User from '../models/User.js';

dotenv.config();

const DEMO_OWNER = {
  name: 'Demo Owner',
  email: 'owner@pethome.org',
  password: 'Demo1234',
  photoURL: 'https://ui-avatars.com/api/?name=Demo+Owner&background=f97316&color=fff',
};

const samplePets = [
  {
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '2 years',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    healthStatus: 'Excellent',
    vaccinationStatus: 'Fully vaccinated',
    location: 'Dhaka',
    adoptionFee: 150,
    description: 'Friendly and playful. Loves walks and children.',
    featured: true,
  },
  {
    name: 'Luna',
    species: 'Cat',
    breed: 'Persian',
    age: '1 year',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1514889586317-4aecd66363fc?w=600',
    healthStatus: 'Good',
    vaccinationStatus: 'Fully vaccinated',
    location: 'Chittagong',
    adoptionFee: 120,
    description: 'Calm indoor cat. Perfect for apartment living.',
    featured: true,
  },
  {
    name: 'Charlie',
    species: 'Dog',
    breed: 'Beagle',
    age: '3 years',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
    healthStatus: 'Excellent',
    vaccinationStatus: 'Fully vaccinated',
    location: 'Sylhet',
    adoptionFee: 180,
    description: 'Energetic and loyal. Great family companion.',
    featured: true,
  },
  {
    name: 'Milo',
    species: 'Cat',
    breed: 'Siamese',
    age: '2 years',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
    healthStatus: 'Good',
    vaccinationStatus: 'Fully vaccinated',
    location: 'Rajshahi',
    adoptionFee: 100,
    description: 'Talkative and affectionate. Loves sunny windowsills.',
    featured: true,
  },
  {
    name: 'Kiwi',
    species: 'Bird',
    breed: 'Budgerigar',
    age: '6 months',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1552728080-57bdde30beb3?w=600',
    healthStatus: 'Excellent',
    vaccinationStatus: 'N/A',
    location: 'Dhaka',
    adoptionFee: 50,
    description: 'Colorful and cheerful. Comes with cage and toys.',
    featured: true,
  },
  {
    name: 'Cotton',
    species: 'Others',
    breed: 'Holland Lop',
    age: '1 year',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600',
    healthStatus: 'Good',
    vaccinationStatus: 'Vaccinated',
    location: 'Khulna',
    adoptionFee: 80,
    description: 'Gentle and soft. Likes fresh vegetables and quiet spaces.',
    featured: true,
  },
  {
    name: 'Rocky',
    species: 'Dog',
    breed: 'German Shepherd',
    age: '4 years',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600',
    healthStatus: 'Good',
    vaccinationStatus: 'Fully vaccinated',
    location: 'Barishal',
    adoptionFee: 200,
    description: 'Protective and smart. Needs an active owner.',
    featured: false,
  },
  {
    name: 'Bubbles',
    species: 'Others',
    breed: 'Goldfish',
    age: '8 months',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1522069169874-58c01787142a?w=600',
    healthStatus: 'Excellent',
    vaccinationStatus: 'N/A',
    location: 'Dhaka',
    adoptionFee: 25,
    description: 'Easy to care for. Tank included with adoption.',
    featured: false,
  },
];

async function seed() {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('cluster.mongodb.net')) {
    console.error('\n❌ Fix MONGODB_URI in server/.env first (use your real Atlas connection string).\n');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let owner = await User.findOne({ email: DEMO_OWNER.email });
  if (!owner) {
    const hashed = await bcrypt.hash(DEMO_OWNER.password, 10);
    owner = await User.create({ ...DEMO_OWNER, password: hashed });
    console.log(`Created demo owner: ${DEMO_OWNER.email} / ${DEMO_OWNER.password}`);
  } else {
    console.log(`Demo owner already exists: ${DEMO_OWNER.email}`);
  }

  const existingPets = await Pet.countDocuments();
  if (existingPets >= 6) {
    console.log(`Database already has ${existingPets} pets — skipping pet seed.`);
  } else {
    await Pet.deleteMany({ ownerEmail: DEMO_OWNER.email });
    await Pet.insertMany(
      samplePets.map((pet) => ({
        ...pet,
        ownerEmail: DEMO_OWNER.email,
        status: 'available',
      }))
    );
    console.log(`Inserted ${samplePets.length} sample pets.`);
  }

  console.log('\n✅ Seed complete! You can login with:');
  console.log(`   Email:    ${DEMO_OWNER.email}`);
  console.log(`   Password: ${DEMO_OWNER.password}\n`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
