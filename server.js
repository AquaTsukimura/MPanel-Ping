const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const activePlayers = new Map();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`api runing on port ${PORT}`));
