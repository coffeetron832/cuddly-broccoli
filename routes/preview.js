// routes/preview.js
import express from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Sin título';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '/default-preview.png';

    res.json({ title, description, image });
  } catch (error) {
    console.error('Error obteniendo metadatos:', error);
    res.json({
      title: 'Sin título',
      description: '',
      image: '/default-preview.png'
    });
  }
});

export default router;
