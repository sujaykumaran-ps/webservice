const express = require('express');

const app = express();

app.get('/healthz', (req, res) => {
    res.send()
});

app.listen(3000, () => console.log("App listening at http://localhost:3000"));