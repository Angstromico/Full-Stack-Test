import mongoose from 'mongoose'

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB

  if (!mongoUri) {
    throw new Error('MONGODB environment variable is not set')
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}
