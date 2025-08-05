document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const videoInput = document.getElementById("videoInput");
  const videoGallery = document.getElementById("videoGallery");
  const uploadStatus = document.getElementById("uploadStatus");
  const uploadSection = document.getElementById("uploadSection");
  const userArea = document.getElementById("userArea");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Mostrar nombre de usuario y botón de logout
  if (token && username) {
    if (uploadSection) uploadSection.style.display = "block";

    userArea.innerHTML = `
      <a href="profile.html" title="Mi perfil" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.3rem;">
        <i data-lucide="user" class="icon"></i>
        <span><strong>${username}</strong></span>
      </a>
      <button id="logoutBtn" style="margin-left: 0.5rem;">Cerrar sesión</button>
    `;

    lucide.createIcons();

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.clear();
      window.location.reload();
    });
  } else {
    userArea.innerHTML = `
      <p><a href="login.html">Inicia sesión</a> para subir tus videos</p>
    `;
  }

  // SUBIR VIDEO (solo si estamos en upload.html)
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = videoInput.files[0];
      const title = document.getElementById("titleInput").value.trim();
      const description = document.getElementById("descriptionInput").value.trim();

      if (!file || !title || !description) {
        uploadStatus.textContent = "Por favor completa todos los campos.";
        return;
      }

      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);

      uploadStatus.textContent = "Subiendo...";

      try {
        const res = await fetch("/api/videos", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await res.json();

        if (res.ok) {
          uploadStatus.textContent = "¡Video subido con éxito!";
          addVideoToGallery(result.video); // Objeto completo
        } else {
          uploadStatus.textContent = "❌ Error: " + (result.message || "no se pudo subir.");
        }
      } catch (err) {
        uploadStatus.textContent = "❌ Error de red al subir el video.";
        console.error(err);
      }

      videoInput.value = "";
      document.getElementById("titleInput").value = "";
      document.getElementById("descriptionInput").value = "";
    });
  }

  // Cargar videos en index.html
  if (videoGallery) {
    fetch("/api/videos")
      .then(res => res.json())
      .then(data => {
        data.forEach(video => addVideoToGallery(video)); // ✅ usamos el objeto completo
      })
      .catch(err => {
        console.error("Error al cargar videos:", err);
      });
  }

  // Mostrar video con título y descripción
  function addVideoToGallery(video) {
    const div = document.createElement("div");
    div.className = "video-card";
    div.innerHTML = `
      <video src="${video.url}" controls></video>
      <div class="video-info">
        <div class="video-title">${video.title || "Sin título"}</div>
        <div class="video-description">${video.description || ""}</div>
      </div>
    `;
    videoGallery.prepend(div);
  }
});
