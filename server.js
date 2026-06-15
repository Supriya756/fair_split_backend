const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const dbURI = 'mongodb+srv://supriya_admin:QOzTqsk5yg1SrkKW@cluster0.7smkffa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log("Attempting to connect to MongoDB...");

mongoose.connect(dbURI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('CRITICAL: MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('FairSplit Backend is Online and Connected to DB!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Cloud brain is running on port ${PORT}`);
});