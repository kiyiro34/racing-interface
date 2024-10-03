import { Car } from './car.js';  // Importer la classe Car depuis le fichier Car.js

let socket;
let isRunning = false;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 800;
const scale = canvasWidth / 500;

let cars = {};  // Un objet pour stocker toutes les voitures par modèle
let carColors = {};  // Un objet pour stocker les couleurs associées aux voitures
let circuit = null;
const colors = ['#a32615', '#0f4a96', '#32a852', '#eddb0e', '#862ab0', '#d46b15']; // Liste des couleurs possibles

// Initialiser le circuit
function initializeCircuit() {
    fetch("http://localhost:8080/circuitPoint", { method: "GET" })
    .then(response => response.json())
    .then(data => {
        circuit = new Circuit(data);
        if (circuit) {
            circuit.draw(ctx, scale, canvasHeight, canvasWidth);
        }
    })
    .catch(error => console.error('Erreur lors de la récupération des points du circuit:', error));
}

initializeCircuit();

// Ajouter une voiture via l'interface utilisateur
document.getElementById('addCarButton').addEventListener('click', function() {
    const carBrand = document.getElementById('carBrand').value;
    const power = document.getElementById('powerRange').value;
    const mass = document.getElementById('massRange').value;

    const carData = {
        brand: carBrand,
        power: power,
        mass: mass
    };

    // Envoie des données de la nouvelle voiture au serveur (adresse à compléter)
    fetch("http://localhost:8080/addCar", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Voiture ajoutée avec succès :", data);
    })
    .catch(error => console.error('Erreur lors de l\'ajout de la voiture:', error));
});

// Mettre à jour les valeurs des sliders
document.getElementById('powerRange').addEventListener('input', function() {
    document.getElementById('powerValue').textContent = this.value;
});

document.getElementById('massRange').addEventListener('input', function() {
    document.getElementById('massValue').textContent = this.value;
});

// WebSocket pour démarrer la simulation
document.getElementById('startButton').addEventListener('click', function() {
    if (!isRunning) {
        socket = new WebSocket("http://localhost:8080/positions");
        socket.onopen = function() {
            console.log("Connexion établie.");
            isRunning = true;
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
            document.getElementById('resetButton').disabled = false;
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            for (let carModel in data) {
                const carData = data[carModel];

                if (!cars[carModel]) {
                    const color = colors[Object.keys(cars).length % colors.length];
                    carColors[carModel] = color;
                    cars[carModel] = new Car(carData.positionX, carData.positionY, color);
                } else {
                    cars[carModel].positionX = carData.positionX;
                    cars[carModel].positionY = carData.positionY;
                }

                cars[carModel].speedVector = { x: carData.speedX, y: carData.speedY };
                cars[carModel].nextPointVector = { x: carData.nextPointVectorX, y: carData.nextPointVectorY };

                // Mettre à jour le tableau de bord
                updateDashboard(carModel, carData.speedX, carData.speedY);
            }

            draw();
        };

        socket.onclose = function() {
            console.log("Connexion fermée.");
            isRunning = false;
            document.getElementById('startButton').disabled = false;
            document.getElementById('stopButton').disabled = true;
            document.getElementById('resetButton').disabled = true;
        };
    }
});

// Stopper la simulation
document.getElementById('stopButton').addEventListener('click', function() {
    if (isRunning) {
        socket.close();
        fetch("http://localhost:8080/stopSimulation", { method: "POST" });
    }
});

// Réinitialiser la simulation
document.getElementById('resetButton').addEventListener('click', function() {
    if (isRunning && socket) {
        socket.send(JSON.stringify({ action: 'reset' }));
    }
    
    // Effacer les voitures et le tableau de bord
    cars = {};  // Vider l'objet des voitures
    document.getElementById('carTable').querySelector('tbody').innerHTML = ''; // Vider le tableau de bord
    draw(); // Redessiner le canvas
});

function updateDashboard(carModel, speedX, speedY) {
    const speedNorm = Math.sqrt(speedX * speedX + speedY * speedY).toFixed(2);

    let carRow = document.getElementById(carModel);
    if (!carRow) {
        carRow = document.createElement('tr');
        carRow.id = carModel;

        const modelCell = document.createElement('td');
        modelCell.textContent = carModel;
        carRow.appendChild(modelCell);

        const speedCell = document.createElement('td');

        // Create a progress bar for the speed
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%'; // Initial width

        progressBarContainer.appendChild(progressBar);
        speedCell.appendChild(progressBarContainer);

        carRow.appendChild(speedCell);

        document.getElementById('carTable').querySelector('tbody').appendChild(carRow);
    }

    // Update the progress bar for speed
    const progressBar = carRow.querySelector('.progress-bar');

    // Set width and color based on speed
    const maxSpeed = 100; // Assuming max speed for visualization
    const normalizedSpeed = Math.min(speedNorm, maxSpeed);
    progressBar.style.width = `${(normalizedSpeed / maxSpeed) * 100}%`;

    // Calculate gradient color
    const speedRatio = normalizedSpeed / maxSpeed;
    const red = Math.floor(255 * speedRatio);
    const blue = Math.floor(255 * (1 - speedRatio));
    const color = `rgb(${red}, 0, ${blue})`;

    progressBar.style.backgroundColor = color; // Update the color of the progress bar
}



// Fonction de dessin des voitures et du circuit
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (circuit) {
        circuit.draw(ctx, scale, canvasHeight, canvasWidth);
    }

    for (let carModel in cars) {
        const car = cars[carModel];
        car.draw(ctx, scale, canvasHeight, canvasWidth, circuit.boundingBox, car.speedVector, car.nextPointVector);
    }
}
