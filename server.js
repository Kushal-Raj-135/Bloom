const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('biobloom'));

// Handle routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'biobloom', 'index.html'));
});

app.get('/crop', (req, res) => {
    res.sendFile(path.join(__dirname, 'biobloom', 'crop', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'biobloom', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'biobloom', 'register.html'));
});

// Handle all other routes
app.get('*', (req, res) => {
    res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 