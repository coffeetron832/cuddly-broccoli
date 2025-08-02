document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const verifyForm = document.getElementById("verifyForm");
  const verificationMessage = document.getElementById("verificationMessage");
  const registerStatus = document.getElementById("registerStatus");

  let tempEmail = "";
  let tempPassword = "";

  // === REGISTRO ===
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

      if (res.ok) {
        registerForm.style.display = "none";
        verificationMessage.style.display = "block";
        verifyForm.style.display = "block";
        tempEmail = data.email;
        tempPassword = data.password;
        registerStatus.textContent = "";
      } else {
        registerStatus.textContent = "❌ " + (result.message || "Error al registrar.");
      }
    });
  }

  // === VERIFICACIÓN DE CÓDIGO ===
  if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = verifyForm.code.value;

      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: tempEmail, code }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Iniciar sesión automáticamente
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: tempEmail, password: tempPassword }),
        });

        const loginResult = await loginRes.json();

        if (loginRes.ok && loginResult.token) {
          localStorage.setItem("token", loginResult.token);
          localStorage.setItem("username", loginResult.username);
          registerStatus.textContent = "✅ Verificado. Redirigiendo...";
          setTimeout(() => window.location.href = "index.html", 1000);
        } else {
          registerStatus.textContent = "⚠️ Verificado, pero ocurrió un error al iniciar sesión.";
        }
      } else {
        registerStatus.textContent = "❌ Código incorrecto o expirado.";
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
