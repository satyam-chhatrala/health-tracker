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

const dailyLogSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    split: String,
    foods: [String],
    water: String,
    steps: String,
    junkKcal: String,
    junkProtein: String,
    sets: { type: Map, of: String },
    cardio: {
        incline: String,
        speed: String,
        minutes: String,
        kcal: String
    }
});

const Log = mongoose.model('Log', dailyLogSchema);

app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find();
        const storageFormat = {};
        logs.forEach(log => {
            storageFormat[log.date] = log;
        });
        res.json(storageFormat);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching logs' });
    }
});

app.post('/api/log', async (req, res) => {
    const { date, data } = req.body;
    try {
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
