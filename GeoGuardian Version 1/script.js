// Alertas en tiempo real
function actualizarAlertas() {
    const deslizamiento = document.getElementById("deslizamiento-alert");
    const aire = document.getElementById("aire-alert");
    const fecha = new Date().toLocaleString();

    if (Math.random() < 0.07) {
        deslizamiento.textContent = "⚠️ Deslizamiento detectado";
        deslizamiento.style.backgroundColor = "#ff4e4e";
        agregarAlHistorial(fecha, "Deslizamiento", "Detectado");
    } else {
        deslizamiento.textContent = "📡 Estado del Terreno: Normal";
        deslizamiento.style.backgroundColor = "#38b000";
    }

    if (Math.random() < 0.05) {
        aire.textContent = "⚠️ Calidad del Aire: Mala";
        aire.style.backgroundColor = "#ff4e4e";
        agregarAlHistorial(fecha, "Calidad del Aire", "Mala");
    } else {
        aire.textContent = "🌫️ Calidad del Aire: Buena";
        aire.style.backgroundColor = "#38b000";
    }
}
setInterval(actualizarAlertas, 4000);

// Historial de alertas
function agregarAlHistorial(fecha, tipo, estado) {
    const tabla = document.getElementById("alertTable").querySelector("tbody");
    const fila = document.createElement("tr");
    fila.innerHTML = `<td>${fecha}</td><td>${tipo}</td><td>${estado}</td>`;
    tabla.prepend(fila);
}

// Gráfica de registros ambientales
const ctx = document.getElementById("graficaCanvas").getContext("2d");
const grafica = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array.from({length: 20}, (_, i) => i),
        datasets: [{
            label: 'Niveles ambientales',
            data: Array(20).fill(20),
            borderColor: '#00c897',
            borderWidth: 2,
            fill: false,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        scales: { 
            y: { beginAtZero: true, max: 100 },
            x: { display: false }
        },
        plugins: {
            legend: {
                labels: { color: '#e0e0e0' }
            }
        }
    }
});
setInterval(() => {
    grafica.data.datasets[0].data.shift();
    grafica.data.datasets[0].data.push(Math.floor(Math.random() * 100));
    grafica.update();
}, 1500);

// Medidores de Dashboard Ambiental
const aireCtx = document.getElementById('aireGauge').getContext('2d');
const terrenoCtx = document.getElementById('terrenoGauge').getContext('2d');

const aireGauge = new Chart(aireCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [70, 30],
            backgroundColor: ['#00b4d8', '#2e2e2e'],
            borderWidth: 0
        }]
    },
    options: {
        cutout: '80%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        }
    }
});

const terrenoGauge = new Chart(terrenoCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [50, 50],
            backgroundColor: ['#38b000', '#2e2e2e'],
            borderWidth: 0
        }]
    },
    options: {
        cutout: '80%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        }
    }
});

// Actualizar valores de medidores dinámicamente
setInterval(() => {
    aireGauge.data.datasets[0].data[0] = Math.floor(Math.random() * 100);
    aireGauge.data.datasets[0].data[1] = 100 - aireGauge.data.datasets[0].data[0];
    aireGauge.update();

    terrenoGauge.data.datasets[0].data[0] = Math.floor(Math.random() * 100);
    terrenoGauge.data.datasets[0].data[1] = 100 - terrenoGauge.data.datasets[0].data[0];
    terrenoGauge.update();
}, 3000);

// Exportar historial a CSV
function exportarHistorial() {
    const filas = document.querySelectorAll("#alertTable tr");
    let csv = "";
    filas.forEach(fila => {
        const cols = fila.querySelectorAll("td,th");
        const datos = Array.from(cols).map(col => col.innerText);
        csv += datos.join(",") + "\n";
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historial_alertas.csv";
    link.click();
}
