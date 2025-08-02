document.getElementById("alertButton").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const now = new Date().toLocaleString();
  const nota = document.getElementById("nota").value;
  const alertLimitKey = "lastAlertTime";

  const lastAlert = localStorage.getItem(alertLimitKey);
  const nowTime = Date.now();

  if (lastAlert && nowTime - lastAlert < 3600000) {
    status.textContent = "⚠️ Solo puedes enviar una alerta cada hora.";
    return;
  }

  status.textContent = "🔄 Recolectando datos...";
  const ubicacion = await getUbicacion();
  const bateria = await getBateria();

  document.getElementById("hora").textContent = now;
  document.getElementById("ubicacion").textContent = ubicacion;
  document.getElementById("bateria").textContent = bateria;
  document.getElementById("notaOut").textContent = nota || "(Sin nota)";
  document.getElementById("alertData").classList.remove("hidden");

  const alerta = {
    hora: now,
    ubicacion,
    bateria,
    nota,
    id: crypto.randomUUID(),
  };

  localStorage.setItem("ultimaAlerta", JSON.stringify(alerta));
  localStorage.setItem(alertLimitKey, nowTime);
  status.textContent = "✅ Alerta guardada localmente.";
});

async function getBateria() {
  if ('getBattery' in navigator) {
    const battery = await navigator.getBattery();
    return `${Math.round(battery.level * 100)}%`;
  }
  return "Desconocida";
}

async function getUbicacion() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve("No disponible");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      () => resolve("No disponible"),
      { timeout: 5000 }
    );
  });
}
