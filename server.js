const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const activePlayers = new Map();
const wardrobeData = new Map();

app.post('/onlinePing', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'mising userid' });
  }

  const now = Date.now();
  const lastPing = activePlayers.get(userId);

  if (lastPing && (now - lastPing < 10000)) {
    return res.status(429).json({ error: 'to many requests. please wait 10 secnds betwen pings' });
  }

  activePlayers.set(userId, now);
  return res.sendStatus(200);
});

app.get('/getOnlinePlayerCount', (req, res) => {
  const now = Date.now();
  const TEN_SECONDS = 10000;

  for (const [userId, lastPing] of activePlayers.entries()) {
    if (now - lastPing > TEN_SECONDS) {
      activePlayers.delete(userId);
    }
  }

  return res.json({ count: activePlayers.size });
});

app.post('/wardrobe', (req, res) => {
  const { action } = req.query;
  
  if (action !== 'sync') {
    return res.sendStatus(400);
  }

  const { userId, panel, skins } = req.body;

  if (!userId || panel !== 'brodonttouchme') {
    return res.sendStatus(403);
  }

  const now = Date.now();
  wardrobeData.set(userId, { skins, lastSeen: now });

  const players = [];

  for (const [id, data] of wardrobeData.entries()) {
    players.push({ userId: id, skins: data.skins });
  }

  const responsePayload = JSON.stringify({ players });
  const base64Response = Buffer.from(responsePayload).toString('base64');
  
  return res.send(base64Response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`api runing on port ${PORT}`));
