const express = require('express');
const path = require('path');
const chat = require('./chat.js');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

app.post('/beautifyEmail', (req, res) => {
    console.log('Request to beautify email received');
    const { text } = req.body;
    chat.craftEmail(text).then((correctedText) => {
        console.log('Text corrected.');
        res.send({ correctedText });
    });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
