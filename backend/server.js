
// Step 1: Import the libraries we installed
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

// Step 2: Create the express app
const app = express()

// Step 3: Middleware — these lines process every request
app.use(cors())              // Allow React to talk to this server
app.use(express.json())      // Understand JSON data sent from frontend

// Step 4: A test route — like a "hello world" for APIs
app.get('/', (req, res) => {
  res.json({ message: 'YOLO backend is running!' })
})

// Step 5: Connect to MongoDB then start server
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/yolo'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB!')
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error)
  })