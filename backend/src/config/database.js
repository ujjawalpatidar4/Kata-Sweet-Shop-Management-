import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
