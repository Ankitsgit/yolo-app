/**
 * db.js — MongoDB Atlas connection configuration
 *
 * Centralizes database connection logic so server.js
 * stays clean. Called once at app startup.
 *
 * Uses Mongoose ODM (Object Document Mapper) to provide
 * a schema layer on top of MongoDB's flexible documents.
 */

const mongoose = require('mongoose')


const connectDB = async () => {
  try {


    const conn = await mongoose.connect(process.env.MONGODB_URI, )




    /**
     * conn.connection.host gives us the Atlas cluster hostname
     * Useful to confirm which DB we actually connected to
     * Example output: "yolo-cluster.xxxxx.mongodb.net"
     */
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

  } catch (error) {

    /**
     * If connection fails (wrong password, no internet,
     * IP not whitelisted), log the error clearly and
     * exit the process. No point running without a DB.
     */
    // 🧠 LEARN: error.message gives human-readable error text
    console.error(`MongoDB connection failed: ${error.message}`)


    process.exit(1)
  }
}
module.exports = connectDB