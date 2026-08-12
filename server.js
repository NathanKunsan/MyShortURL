const express = require('express');
const sqlite = require('better-sqlite3');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 441;

// On Vercel, the root directory is read-only. We must use /tmp/ for SQLite, 
// though note that data in /tmp/ is temporary and will reset on cold starts.
const dbPath = process.env.VERCEL ? '/tmp/links.db' : path.join(__dirname, 'links.db');

const db = sqlite(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    original_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to validate URL destination
async function validateUrlDestination(url) {
  try {
    let response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    if (response.status === 404) return false;
    if (!response.ok && response.status !== 404) {
      response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (!response.ok && response.status === 404) return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// API: Validate URL Destination
app.post('/api/validate', async (req, res) => {
  let { url } = req.body;
  if (!url) return res.json({ valid: false });
  
  if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
  }

  try {
    new URL(url);
    const isValid = await validateUrlDestination(url);
    res.json({ valid: isValid });
  } catch (error) {
    res.json({ valid: false });
  }
});

// API: Shorten URL
app.post('/api/shorten', async (req, res) => {
  const { url, customCode } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Strict enforcement: Destination must exist
  const isValid = await validateUrlDestination(url);
  if (!isValid) {
    return res.status(400).json({ error: 'Cannot shorten: URL is unreachable or does not exist.' });
  }

  let shortId;

  if (customCode) {
    // Validate custom code: English letters and numbers only
    if (!/^[a-zA-Z0-9]+$/.test(customCode)) {
      return res.status(400).json({ error: 'Custom code must contain only English letters and numbers.' });
    }
    // Check if it already exists
    const existing = db.prepare('SELECT id FROM links WHERE id = ?').get(customCode);
    if (existing) {
      return res.status(400).json({ error: 'This custom code is already in use. Please choose another one.' });
    }
    shortId = customCode;
  } else {
    // Generate random 5-character string
    shortId = crypto.randomBytes(3).toString('hex').slice(0, 5);
  }

  try {
    db.prepare('INSERT INTO links (id, original_url) VALUES (?, ?)').run(shortId, url);
    res.json({ shortId: shortId, shortUrl: `https://MyShortURL.org/${shortId}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Redirect endpoint
app.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Ignore requests that aren't matching our format to avoid catching things like favicon.ico
  if (!/^[a-zA-Z0-9]+$/.test(id)) {
    return res.status(404).send('Not Found');
  }

  const link = db.prepare('SELECT original_url FROM links WHERE id = ?').get(id);

  if (link) {
    res.redirect(link.original_url);
  } else {
    res.status(404).send('<h1>404 - Link Not Found</h1><p>The shortened URL does not exist.</p><a href="/">Go Home</a>');
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
