import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing. Copy .env.example to .env first.');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
