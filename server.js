const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.INTERFACE_PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/config', (req, res) => {
    res.json({ apiHost: `http://localhost:${process.env.API_PORT}` });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
