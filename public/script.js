document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const videoInput = document.getElementById("videoInput");
  const videoGallery = document.getElementById("videoGallery");
  const uploadStatus = document.getElementById("uploadStatus");
  const uploadSection = document.getElementById("uploadSection");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Mostrar nombre en el header
  const usernameDisplay = document.getElementById("usernameDisplay");
  if (username && usernameDisplay) {
    usernameDisplay.textContent = username;
  }

  // Agregar botón de logout si está logueado
  const userArea = document.getElementById("userArea");
  if (token && username && userArea) {
    // Solo si no existe ya el botón
    if (!document.getElementById("logoutBtn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logoutBtn";
      logoutBtn.textContent = "Cerrar sesión";
      logoutBtn.style.marginLeft = "0.5rem";
      logoutBtn.style.fontSize = "0.8rem";
      logoutBtn.style.cursor = "pointer";
      userArea.appendChild(logoutBtn);

      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
      });
    }
  }

  // Mostrar formulario de subida si estamos en upload.html y logueado
  if (uploadSection && token) {
    uploadSection.style.display = "block";
  }

  // SUBIDA DE VIDEO (solo si estamos en upload.html)
  if (uploadForm && videoInput) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("titleInput").value.trim();
      const description = document.getElementById("descriptionInput").value.trim();
      const file = videoInput.files[0];

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
          addVideoToGallery(result.video);
        } else {
          uploadStatus.textContent = "❌ Error: " + (result.message || "No se pudo subir.");
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
      .then((res) => res.json())
      .then((data) => {
        data.forEach((video) => addVideoToGallery(video));
      })
      .catch((err) => {
        console.error("Error al cargar videos:", err);
      });
  }

  // Función para mostrar video en la galería con título y descripción
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
