// preview.js o dentro de server.js si todo está ahí

const express = require('express');
const router = express.Router();
const { JSDOM } = require('jsdom');

// Importación compatible con node-fetch v3+
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get('/', async (req, res) => {
  const { url } = req.query;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const title = doc.querySelector('meta[property="og:title"]')?.content ||
                  doc.querySelector('title')?.textContent || 'Sin título';
    const description = doc.querySelector('meta[property="og:description"]')?.content ||
                        doc.querySelector('meta[name="description"]')?.content || '';
    const image = doc.querySelector('meta[property="og:image"]')?.content || '';

    res.json({ title, description, image });
  } catch (err) {
    console.error('Error obteniendo metadatos:', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los metadatos' });
  }
});

module.exports = router;
