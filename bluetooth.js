document.getElementById("enviarBluetooth").addEventListener("click", async () => {
  try {
    const alerta = localStorage.getItem("ultimaAlerta");
    if (!alerta) {
      alert("No hay alerta reciente para enviar.");
      return;
    }

    const options = {
      acceptAllDevices: true,
      optionalServices: ['generic_access']
    };

    const device = await navigator.bluetooth.requestDevice(options);
    const server = await device.gatt.connect();
    alert("✅ Dispositivo conectado (por ahora es solo una prueba de conexión).");

    // Aquí podríamos enviar info con características custom
    server.disconnect();
  } catch (e) {
    console.error(e);
    alert("❌ Falló la conexión Bluetooth o fue cancelada.");
  }
});
