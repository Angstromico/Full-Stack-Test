import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || '8080',
  mongodb: process.env.MONGODB || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
}
