// ===== SMART HOME SIMULATION =====

// Load currents same as ESP32 simulation
const loads = [
    { name: "Light", current: 0.5 },
    { name: "Fan", current: 1.0 },
    { name: "AC", current: 2.0 }
];

let voltage = 230;
let loadStates = [false, false, false];
let totalCurrent = 0;
let totalPower = 0;

// ===== Gauges =====
const voltageGauge = new JustGage({
    id: "voltageGauge",
    value: voltage,
    min: 180,
    max: 260,
    title: "Voltage",
    label: "V",
    pointer: true
});

const currentGauge = new JustGage({
    id: "currentGauge",
    value: 0,
    min: 0,
    max: 5,
    title: "Current",
    label: "A",
    pointer: true
});

const powerGauge = new JustGage({
    id: "powerGauge",
    value: 0,
    min: 0,
    max: 1500,
    title: "Power",
    label: "W",
    pointer: true
});

// ===== Chart =====
const ctx = document.getElementById('energyChart').getContext('2d');
const energyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Voltage', data: [], borderColor: 'blue', fill: false },
            { label: 'Current', data: [], borderColor: 'red', fill: false }
        ]
    },
    options: { responsive: true, animation: false }
});

// ===== Voltage Slider =====
const voltageSlider = document.getElementById('voltageSlider');
const sliderValue = document.getElementById('sliderValue');

voltageSlider.addEventListener('input', () => {
    voltage = parseFloat(voltageSlider.value);
    sliderValue.textContent = voltage + " V";
    updateDashboard();
});

// ===== Load Buttons =====
document.querySelectorAll('.load-switch').forEach(button => {

    button.addEventListener('click', () => {

        const idx = parseInt(button.dataset.load);

        loadStates[idx] = !loadStates[idx];

        button.classList.toggle('active');
        button.textContent = loadStates[idx] ? 'ON' : 'OFF';

        document.getElementById('load'+idx).style.backgroundColor =
            loadStates[idx] ? 'limegreen' : '#555';

        updateDashboard();
    });
});

// ===== Update Dashboard =====
function updateDashboard() {

    totalCurrent = loads.reduce((sum, load, i) =>
        sum + (loadStates[i] ? load.current : 0), 0);

    totalPower = voltage * totalCurrent;

    voltageGauge.refresh(voltage);
    currentGauge.refresh(totalCurrent.toFixed(2));
    powerGauge.refresh(totalPower.toFixed(0));

    document.getElementById("voltageValue").textContent = voltage + " V";
    document.getElementById("currentValue").textContent = totalCurrent.toFixed(2) + " A";
    document.getElementById("powerValue").textContent = totalPower.toFixed(0) + " W";

    // ===== Protection Logic =====
    const alertBox = document.getElementById('alertBox');

    if (voltage < 190) {
        alertBox.textContent = "LOW VOLTAGE!";
        alertBox.style.backgroundColor = "red";
        alertBox.classList.add("alert-blink");
    }
    else if (voltage > 250) {
        alertBox.textContent = "HIGH VOLTAGE!";
        alertBox.style.backgroundColor = "red";
        alertBox.classList.add("alert-blink");
    }
    else if (totalCurrent > 3.0) {
        alertBox.textContent = "OVERLOAD!";
        alertBox.style.backgroundColor = "red";
        alertBox.classList.add("alert-blink");
    }
    else {
        alertBox.textContent = "System Normal";
        alertBox.style.backgroundColor = "green";
        alertBox.classList.remove("alert-blink");
    }

    // ===== Update Graph =====
    const now = new Date().toLocaleTimeString();

    energyChart.data.labels.push(now);
    energyChart.data.datasets[0].data.push(voltage);
    energyChart.data.datasets[1].data.push(totalCurrent);

    if (energyChart.data.labels.length > 20) {
        energyChart.data.labels.shift();
        energyChart.data.datasets.forEach(ds => ds.data.shift());
    }

    energyChart.update();
}

// Initial Call
updateDashboard();
