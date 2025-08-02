document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const videoInput = document.getElementById("videoInput");
  const videoGallery = document.getElementById("videoGallery");
  const uploadStatus = document.getElementById("uploadStatus");

  // Cargar videos al iniciar
  fetch("/api/videos")
    .then(res => res.json())
    .then(data => {
      data.forEach(video => {
        addVideoToGallery(video.url);
      });
    });

  // Subida de video
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = videoInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    uploadStatus.textContent = "Subiendo...";

    const res = await fetch("/api/videos", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      uploadStatus.textContent = "¡Video subido con éxito!";
      addVideoToGallery(result.url);
    } else {
      uploadStatus.textContent = "Error al subir el video.";
    }

    videoInput.value = "";
  });

  function addVideoToGallery(videoUrl) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.controls = true;
    videoGallery.prepend(video);
  }
});
