// routes/preview.js
const express = require('express');
const router = express.Router();
const { JSDOM } = require('jsdom');

// Importación compatible con node-fetch v3+
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Falta el parámetro url' });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const title =
      doc.querySelector('meta[property="og:title"]')?.content ||
      doc.querySelector('title')?.textContent ||
      'Sin título';

    const description =
      doc.querySelector('meta[property="og:description"]')?.content ||
      doc.querySelector('meta[name="description"]')?.content ||
      '';

    let image =
      doc.querySelector('meta[property="og:image"]')?.content || '';

    // Si la imagen es relativa, la volvemos absoluta
    if (image && !image.startsWith('http')) {
      try {
        const base = new URL(url);
        image = base.origin + image;
      } catch (err) {
        console.warn('No se pudo resolver la URL de imagen:', err.message);
      }
    }

    res.json({ title, description, image });
  } catch (err) {
    console.error('Error obteniendo metadatos:', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los metadatos' });
  }
});

module.exports = router;
