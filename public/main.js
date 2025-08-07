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

  const linkForm = document.getElementById('linkForm');
  const linksList = document.getElementById('linksList');
  const logoutBtn = document.getElementById('logoutBtn');

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Cargar enlaces
  async function loadLinks() {
    const res = await fetch('/api/links', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    linksList.innerHTML = '';
    data.forEach(link => {
      const card = document.createElement('div');
      card.className = 'link-card';
      card.innerHTML = `
        <h3>${link.title}</h3>
        <p>${link.description || ''}</p>
        <a href="${link.url}" target="_blank">${link.url}</a>
        <button data-id="${link._id}">Eliminar</button>
      `;
      linksList.appendChild(card);
    });
  }

  // Agregar nuevo enlace
  linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const description = document.getElementById('description').value;

    const res = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, url, description })
    });

    if (res.ok) {
      linkForm.reset();
      loadLinks();
    }
  });

  // Eliminar enlace
  linksList.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.dataset.id;
      await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadLinks();
    }
  });

  loadLinks();
}
