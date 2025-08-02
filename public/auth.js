document.addEventListener("DOMContentLoaded", () => {
  // === REGISTRO ===
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const data = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      const status = document.getElementById("registerStatus");

      if (res.ok) {
        status.textContent = "✅ Registro exitoso. Ahora inicia sesión.";
        registerForm.reset();
      } else {
        status.textContent = "❌ " + (result.message || "Error al registrar.");
      }
    });
  }

  // === LOGIN ===
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      const status = document.getElementById("loginStatus");

      if (res.ok && result.token) {
        // Guardar token en localStorage
        localStorage.setItem("token", result.token);
        localStorage.setItem("username", result.username);
        status.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";
        setTimeout(() => window.location.href = "index.html", 1000);
      } else {
        status.textContent = "❌ " + (result.message || "Error al iniciar sesión.");
      }
    });
  }
});
