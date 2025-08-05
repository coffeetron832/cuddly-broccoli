document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const videoInput = document.getElementById("videoInput");
  const videoGallery = document.getElementById("videoGallery");
  const uploadStatus = document.getElementById("uploadStatus");
  const uploadSection = document.getElementById("uploadSection");
  const userArea = document.getElementById("userArea");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Mostrar nombre y botón de logout si está logueado
  if (token && username) {
    uploadSection.style.display = "block";

    userArea.innerHTML = `
  <a href="profile.html" title="Mi perfil" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.3rem;">
    <i data-lucide="user" class="icon"></i>
    <span><strong>${username}</strong></span>
  </a>
  <button id="logoutBtn" style="margin-left: 0.5rem;">Cerrar sesión</button>
`;
lucide.createIcons();


    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.reload();
    });
  } else {
    userArea.innerHTML = `
      <p><a href="login.html">Inicia sesión</a> para subir tus videos</p>
    `;
  }

  // Cargar videos
  fetch("/api/videos")
    .then(res => res.json())
    .then(data => {
      data.forEach(video => {
        addVideoToGallery(video.url);
      });
    });

  // Subida de video protegida
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = videoInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("video", file);

      uploadStatus.textContent = "Subiendo...";

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          Authorization: token
        },
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        uploadStatus.textContent = "¡Video subido con éxito!";
        addVideoToGallery(result.url);
      } else {
        uploadStatus.textContent = "❌ Error: " + (result.message || "no se pudo subir.");
      }

      videoInput.value = "";
    });
  }

  function addVideoToGallery(videoUrl) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.controls = true;
    videoGallery.prepend(video);
  }
});
