require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const { errorHandler } = require('./middleware/errorHandler');

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);

// Centralized error handler mounted last
app.use(errorHandler);

const dbURI = process.env.MONGODB_URI;

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