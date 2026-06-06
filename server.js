// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the Schema
const dailyLogSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    split: String,
    foods: [String],
    water: String,
    steps: String,
    junkKcal: String,
    junkProtein: String,
    sets: { type: Map, of: String }, // Map allows dynamic keys like "Incline Bench-s1"
    cardio: {
        incline: String,
        speed: String,
        minutes: String,
        kcal: String
    }
});

const Log = mongoose.model('Log', dailyLogSchema);

// GET API: Fetch logs (allows fetching a range for the analytics charts)
app.get('/api/logs', async (req, res) => {
    try {
        // Find all logs (You can later filter by req.query.startDate / endDate)
        const logs = await Log.find();
        
        // Transform array into a dictionary keyed by date to match your frontend 'storage' object
        const storageFormat = {};
        logs.forEach(log => {
            storageFormat[log.date] = log;
        });
        
        res.json(storageFormat);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching logs' });
    }
});

// POST API: Upsert daily data
app.post('/api/log', async (req, res) => {
    const { date, data } = req.body;
    
    try {
        // upsert: true will create the document if it doesn't exist, or update it if it does
        const updatedLog = await Log.findOneAndUpdate(
            { date: date },
            { ...data, date: date },
            { upsert: true, new: true }
        );
        res.json({ message: 'Data synchronized successfully', log: updatedLog });
    } catch (error) {
        res.status(500).json({ error: 'Server error synchronizing data' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
