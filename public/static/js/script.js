import { Car } from './classes/car.js';

let socket;
let isRunning = false;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 800;
const scale = canvasWidth / 500;

let cars = {};  
let carColors = {}; 
let bestLapTimes = {}; 
let circuit = null;
const colors = ['#d11c04', '#0957bd', '#24bf4e', '#f5e105', '#9318cc', '#eb860c','#ad0e68']; // Liste des couleurs possibles

// Initialiser le circuit
function initializeCircuit() {
    fetch("http://localhost:8080/circuit/points", { method: "GET" })
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
    fetch("http://localhost:8080/car/add", {
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
            if (data.lapTime !== undefined) { 
                console.log("temps actuel: "+data.lapTime)
                updateBestLapTime(data.carBrand, data.lapTime);
            }
            else{
                for (let carModel in data) {
                    const carData = data[carModel];
            
                    // Vérifiez si carData a des informations de position
                    if (carData.positionX !== undefined && carData.positionY !== undefined) {
                        if (!cars[carModel]) {
                            const color = colors[Object.keys(cars).length % colors.length];
                            carColors[carModel] = color;
                            cars[carModel] = new Car(carData.positionX, carData.positionY, color, carData.mass, carData.couple);
                        } else {
                            cars[carModel].positionX = carData.positionX;
                            cars[carModel].positionY = carData.positionY;
                            cars[carModel].mass = carData.mass; // Mettre à jour la masse
                            cars[carModel].couple = carData.couple; // Mettre à jour le couple
                            cars[carModel].heading = carData.heading; // Mettre à jour le heading
                        }
            
                        // Mettez à jour le vecteur de vitesse et le vecteur du prochain point
                        cars[carModel].speedVector = { x: carData.speedX, y: carData.speedY };
                        cars[carModel].nextPointVector = { x: carData.nextPointVectorX, y: carData.nextPointVectorY };
            
                        // Mettre à jour le tableau de bord pour les informations de position
                        updateDashboard(carModel, carData.speedX, carData.speedY, carData.mass, carData.couple);
                    }
            
                    // Vérifiez si carData a un temps de tour
                }
                draw();
            }
            
        
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
        fetch("http://localhost:8080/simulation/stop", { method: "POST" });
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

    // Réinitialiser le tableau des meilleurs temps
    bestLapTimes = {}; // Vider les meilleurs temps
    updateLeaderboard(); // Mettre à jour le leaderboard
});
function updateDashboard(carModel, speedX, speedY, mass, couple) {
    const speedNorm = Math.sqrt(speedX * speedX + speedY * speedY).toFixed(2);

    let carRow = document.getElementById(carModel);
    if (!carRow) {
        // Ligne principale contenant le modèle, la couleur et la vitesse
        carRow = document.createElement('tr');
        carRow.id = carModel;

        // Création de la cellule pour le cercle de couleur
        const colorCell = document.createElement('td');
        colorCell.style.width = '20px';  // Réduire la largeur de la cellule
        const colorCircle = document.createElement('div');
        colorCircle.style.width = '12px';
        colorCircle.style.height = '12px';
        colorCircle.style.borderRadius = '50%';
        colorCircle.style.backgroundColor = carColors[carModel];  // Utilise la couleur de la voiture
        colorCircle.style.margin = 'auto';  // Centrer le cercle dans la cellule
        colorCell.appendChild(colorCircle);
        carRow.appendChild(colorCell);

        // Cellule pour le modèle de voiture
        const modelCell = document.createElement('td');
        modelCell.textContent = carModel;
        carRow.appendChild(modelCell);

        // Cellule pour la barre de progression de la vitesse
        const speedCell = document.createElement('td');

        // Créer une barre de progression pour la vitesse
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%'; // Largeur initiale

        progressBarContainer.appendChild(progressBar);
        speedCell.appendChild(progressBarContainer);
        carRow.appendChild(speedCell);

        document.getElementById('carTable').querySelector('tbody').appendChild(carRow);

        // Ajouter une nouvelle ligne sous la voiture pour les informations de masse et couple
        const infoRow = document.createElement('tr');
        infoRow.id = carModel + '-info';
        const infoCell = document.createElement('td');
        infoCell.colSpan = 3; // Fusionner les colonnes pour les informations

        infoRow.appendChild(infoCell);
        document.getElementById('carTable').querySelector('tbody').appendChild(infoRow);
    }

    // Mettre à jour la barre de progression pour la vitesse
    const progressBar = carRow.querySelector('.progress-bar');

    // Définir la largeur et la couleur en fonction de la vitesse
    const maxSpeed = 100; // Vitesse maximale pour la visualisation
    const normalizedSpeed = Math.min(speedNorm, maxSpeed);
    progressBar.style.width = `${(normalizedSpeed / maxSpeed) * 100}%`;

    // Calculer la couleur en dégradé
    const speedRatio = normalizedSpeed / maxSpeed;
    const red = Math.floor(255 * speedRatio);
    const blue = Math.floor(255 * (1 - speedRatio));
    const color = `rgb(${red}, 0, ${blue})`;

    progressBar.style.backgroundColor = color; // Mettre à jour la couleur de la barre de progression

    // Mettre à jour les informations de masse et couple dans la ligne dédiée, en ligne
    const infoRow = document.getElementById(carModel + '-info');
    const infoCell = infoRow.querySelector('td');
    infoCell.innerHTML = `<span style="font-size: 0.8em;">${mass} kg | ${couple} Nm</span>`;
}



// Fonction pour mettre à jour les meilleurs temps
function updateBestLapTime(brand, lapTime) {
    // Si aucun temps n'existe encore ou si le nouveau temps est meilleur
    if (!bestLapTimes[brand] || lapTime/1000 < bestLapTimes[brand]) {
        bestLapTimes[brand] = lapTime/1000;
        console.log("nouveau meilleur temps :"+bestLapTimes[brand]) // Mettez à jour le meilleur temps
        updateLeaderboard(); // Mettez à jour le tableau de classement
    }
}

// Fonction pour mettre à jour le tableau de classement
function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardTable').querySelector('tbody');
    leaderboardBody.innerHTML = ''; // Vider le tableau avant de le remplir

    const entries = Object.entries(bestLapTimes);
    let sortedCars;

    // Vérifiez le nombre d'entrées
    if (entries.length <= 1) {
        sortedCars = entries; // Pas besoin de trier
    } else {
        sortedCars = entries.sort((a, b) => a[1] - b[1]); // Trier seulement si plus d'une voiture
    }

    // Ajouter les meilleures voitures au tableau
    sortedCars.forEach(([model, time], index) => {
        const row = document.createElement('tr');
        
        // Créer une cellule pour la position
        const positionCell = document.createElement('td');
        positionCell.textContent = index + 1; // La position est l'index + 1
        row.appendChild(positionCell);
        
        const modelCell = document.createElement('td');
        modelCell.textContent = model;
        row.appendChild(modelCell);
        
        const timeCell = document.createElement('td');
        timeCell.textContent = time.toFixed(2); // Affichez le temps avec deux décimales
        row.appendChild(timeCell);

        leaderboardBody.appendChild(row);
    });
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
