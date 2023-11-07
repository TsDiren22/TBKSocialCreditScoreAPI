const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); // Require cors
const app = express();

app.use(cors()); // Use cors
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', extended: true, parameterLimit: 50000 }));

// API to write data to JSON file
app.post('/write', (req, res) => {
    fs.writeFile('data.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) throw err;
        res.send('Data written to file');
    });
});

// API to read data from JSON file
app.get('/read', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        res.send(JSON.parse(data));
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));