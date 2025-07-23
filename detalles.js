let port;
let reader;
let chart;
let vibrationData = [];
let chartLabels = [];
const maxDataPoints = 10;

document.getElementById("connectButton").addEventListener("click", conectarMicrobit);
document.getElementById("testAlertButton").addEventListener("click", () => {
  alert("¡Alerta manual activada! Prueba completada.");
});

async function conectarMicrobit() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;

    reader = inputStream.getReader();
    readLoop();

    document.getElementById("vibrationValue").textContent = "Conectado";
  } catch (error) {
    console.error("Error al conectar:", error);
    document.getElementById("vibrationValue").textContent = "Error al conectar";
  }
}

async function readLoop() {
  while (true) {
    try {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const vibracion = parseInt(value.trim());
        if (!isNaN(vibracion)) {
          actualizarDatos(vibracion);
        }
      }
    } catch (error) {
      console.error("Error de lectura:", error);
      break;
    }
  }
}

function actualizarDatos(vibracion) {
  const ahora = new Date().toLocaleTimeString();
  document.getElementById("vibrationValue").textContent = vibracion;

  const fila = document.createElement("tr");
  fila.innerHTML = `<td>${ahora}</td><td>${vibracion}</td>`;
  const cuerpoTabla = document.getElementById("vibrationTableBody");
  cuerpoTabla.appendChild(fila);
  if (cuerpoTabla.rows.length > maxDataPoints) {
    cuerpoTabla.removeChild(cuerpoTabla.firstChild);
  }

  vibrationData.push(vibracion);
  chartLabels.push(ahora);
  if (vibrationData.length > maxDataPoints) {
    vibrationData.shift();
    chartLabels.shift();
  }

  chart.data.labels = chartLabels;
  chart.data.datasets[0].data = vibrationData;
  chart.update();
}

function inicializarGrafica() {
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Vibración en tiempo real",
        data: [],
        borderColor: "blue",
        fill: false
      }]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function inicializarMapa() {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      document.getElementById("lat").textContent = lat.toFixed(5);
      document.getElementById("lon").textContent = lon.toFixed(5);
      document.getElementById("hora").textContent = new Date().toLocaleTimeString();

      const map = L.map("map").setView([lat, lon], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      L.marker([lat, lon]).addTo(map)
        .bindPopup("Ubicación actual")
        .openPopup();
    },
    (error) => {
      console.error("No se pudo obtener la ubicación:", error);
      alert("No se pudo obtener la ubicación.");
    }
  );
}

window.addEventListener("DOMContentLoaded", () => {
  inicializarGrafica();
  inicializarMapa();

  navigator.serial.getPorts().then(ports => {
    if (ports.length > 0) {
      port = ports[0];
      conectarMicrobit();
    }
  });
});
