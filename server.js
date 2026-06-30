const express = require('express');
const path = require('path');

const app = express();
const events = [];

app.use(express.json());
app.use(express.static(__dirname));

app.post('/event', (req, res) => {
  events.push(req.body);
  res.status(201).json({ ok: true });
});

app.get('/events', (_req, res) => {
  res.json(events);
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3001, () => {
  console.log('pacman-services listening on http://localhost:3001');
});
