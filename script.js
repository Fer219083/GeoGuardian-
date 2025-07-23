let port;
let reader;
let isConnected = false;
let alertaActiva = false;
const umbralAlerta = 800;

const statusEl = document.getElementById("status");
const alertOverlay = document.getElementById("alertOverlay");
const alertX = document.querySelector(".alert-x");
const beepSound = document.getElementById("beepSound");
const alertButton = document.getElementById("alertButton");
const verDetallesBtn = document.getElementById("verDetallesBtn");
const connectPrompt = document.getElementById("connectPrompt");
const connectBtn = document.getElementById("connectBtn");

function mostrarAlerta() {
  if (!alertaActiva) {
    alertaActiva = true;
    alertOverlay.style.display = "flex";
    beepSound.play();
    alertButton.textContent = "🚨 Alerta Activa";
    alertButton.classList.add("alerta-activa");
  }
}

function ocultarAlerta() {
  if (alertaActiva) {
    alertaActiva = false;
    alertOverlay.style.display = "none";
    alertButton.textContent = "Sin Alertas";
    alertButton.classList.remove("alerta-activa");
  }
}

verDetallesBtn?.addEventListener("click", () => {
  window.location.href = "detalles.html";
});

connectBtn?.addEventListener("click", async () => {
  await conectarMicrobit();
});

async function conectarMicrobit() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    statusEl.textContent = "✅ Conectado";
    connectPrompt.style.display = "none";
    isConnected = true;
    leerDatos();
  } catch (error) {
    console.error("Error al conectar con el micro:bit:", error);
  }
}

async function leerDatos() {
  const decoder = new TextDecoderStream();
  const inputDone = port.readable.pipeTo(decoder.writable);
  reader = decoder.readable.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const numero = parseInt(value.trim());
        if (!isNaN(numero)) {
          if (numero > umbralAlerta) {
            mostrarAlerta();
          } else {
            ocultarAlerta();
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al leer datos:", error);
  } finally {
    reader.releaseLock();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!isConnected && "serial" in navigator) {
    connectPrompt.style.display = "flex";
  }
});
