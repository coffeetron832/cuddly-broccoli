// routes/preview.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

router.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'URL requerida' });

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const title = document.querySelector('title')?.textContent || 'Sin título';
    const description = document.querySelector('meta[name="description"]')?.content ||
                        document.querySelector('meta[property="og:description"]')?.content ||
                        '';
    const image = document.querySelector('meta[property="og:image"]')?.content ||
                  document.querySelector('link[rel~="icon"]')?.href ||
                  '';

    res.json({ title, description, image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener metadatos' });
  }
});

module.exports = router;
