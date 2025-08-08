// public/main.js

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.msg);
    if (res.ok) window.location.href = 'login.html';
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      alert(data.msg);
    }
  });
}

const dashboardPage = document.querySelector('.dashboard-container');
if (dashboardPage) {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = 'login.html';

  // Forms: soporta el formulario grande y el compacto en header
  const linkForm = document.getElementById('linkForm'); // antiguo (grande)
  const linkFormCompact = document.getElementById('linkFormCompact'); // nuevo (compacto)
  const linksList = document.getElementById('linksList');
  const logoutBtn = document.getElementById('logoutBtn');

  // Logout (si existe)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Renderizar tarjeta de enlace (con fallback de imagen)
  function renderLink(link, metadata = {}) {
    const title = link.title || metadata.title || 'Sin título';
    const description = link.description || metadata.description || '';
    const image = (metadata.image && typeof metadata.image === 'string' && metadata.image.trim() !== '')
      ? metadata.image
      : '/default-preview.png'; // coloca default-preview.png en /public

    const card = document.createElement('div');
    card.className = 'link-card';
    card.innerHTML = `
      <div class="link-meta">
        <img src="${image}" alt="Vista previa" class="meta-img">
        <div class="meta-text">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
          <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url)}</a>
          <div class="tooltip-preview">
            <strong>Vista previa</strong><br>
            ${escapeHtml(metadata.title || title)}<br>
            ${escapeHtml(metadata.description || description)}
          </div>
        </div>
      </div>
      <button data-id="${link._id}">Eliminar</button>
    `;
    linksList.appendChild(card);
  }

  // Escape sencillo para evitar inyección de HTML
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // Cargar enlaces y metadatos
  async function loadLinks() {
    try {
      const res = await fetch('/api/links', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener enlaces');
      const data = await res.json();
      linksList.innerHTML = '';

      for (const link of data) {
        try {
          const metaRes = await fetch(`/api/preview?url=${encodeURIComponent(link.url)}`);
          // si el endpoint falla, metaRes.ok será false; manejamos igual
          let meta = {};
          if (metaRes.ok) {
            meta = await metaRes.json();
          } else {
            console.warn('Preview no disponible para', link.url, metaRes.status);
          }
          console.log('Metadatos para', link.url, meta);
          renderLink(link, meta);
        } catch (err) {
          console.error('Error cargando metadatos:', err);
          renderLink(link, {}); // sin metadata
        }
      }
    } catch (err) {
      console.error('Error loadLinks:', err);
    }
  }

  // Función para crear enlace (reutilizable)
  async function createLink({ title, url, description = '' }) {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, url, description })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Error al guardar enlace');
      }
      await loadLinks();
    } catch (err) {
      alert('No se pudo guardar el enlace: ' + err.message);
    }
  }

  // Manejo eventos: formulario grande (si existe)
  if (linkForm) {
    linkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('title')?.value || '';
      const url = document.getElementById('url')?.value || '';
      const description = document.getElementById('description')?.value || '';
      if (!title || !url) return alert('Título y URL son requeridos');
      await createLink({ title, url, description });
      linkForm.reset();
    });
  }

  // Manejo eventos: formulario compacto en header (si existe)
  if (linkFormCompact) {
    linkFormCompact.addEventListener('submit', async (e) => {
      e.preventDefault();
      // inputs del compact usan los mismos ids "title" y "url" según tu HTML propuesto
      const title = document.getElementById('title')?.value || '';
      const url = document.getElementById('url')?.value || '';
      if (!title || !url) return alert('Título y URL son requeridos');
      await createLink({ title, url, description: '' }); // compact no tiene description
      // reset de los inputs compact
      linkFormCompact.reset();
    });
  }

  // Eliminar enlace (delegación)
  linksList.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.dataset.id;
      try {
        const res = await fetch(`/api/links/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo eliminar');
        await loadLinks();
      } catch (err) {
        console.error('Error borrando enlace:', err);
        alert('No se pudo eliminar el enlace');
      }
    }
  });

  // Inicial
  loadLinks();
}
