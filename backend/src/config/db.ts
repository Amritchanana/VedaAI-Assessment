import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
  try {
    await mongoose.connect(uri);
    console.log('[MongoDB] Connected');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    process.exit(1);
  }
}
