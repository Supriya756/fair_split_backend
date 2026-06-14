const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('FairSplit Backend is Online!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Cloud brain is running on port ${PORT}`);
});