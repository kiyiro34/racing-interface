let socket;
let isRunning = false;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 800;
const scale = canvasWidth / 500;

let car = null;
let circuit = null;
function initializeCircuit() {
    fetch("http://localhost:8080/circuitPoint", { method: "GET" })
    .then(response => response.json())
        .then(data => {
            // Crée une instance de Circuit avec les points reçus du backend
            circuit = new Circuit(data);
            if (circuit) {
                circuit.draw(ctx, scale, canvasHeight, canvasWidth);
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des points du circuit:', error));
}

initializeCircuit()


document.getElementById('startButton').addEventListener('click', function() {
    if (!isRunning) {
        
        
        socket = new WebSocket("http://localhost:8080/positions");
        socket.onopen = function() {
            console.log("Connexion établie.");
            isRunning = true;
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
            document.getElementById('resetButton').disabled = false; // Activer le bouton reset après démarrage
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const { positionX, positionY, speedX, speedY, nextPointVectorX, nextPointVectorY } = data;

            if (!car) {
                car = new Car(positionX, positionY, 'blue');
            } else {
                car.positionX = positionX;
                car.positionY = positionY;
            }

            // Mise à jour des vecteurs
            carSpeedVector = { x: speedX, y: speedY };
            carNextPointVector = { x: nextPointVectorX, y: nextPointVectorY };

            draw();
        };


        socket.onclose = function() {
            console.log("Connexion fermée.");
            isRunning = false;
            document.getElementById('startButton').disabled = false;
            document.getElementById('stopButton').disabled = true;
            document.getElementById('resetButton').disabled = true; // Désactiver reset quand c'est arrêté
        };
    }
});

document.getElementById('stopButton').addEventListener('click', function() {
    if (isRunning) {
        socket.close();
        fetch("http://localhost:8080/stopSimulation", { method: "POST" });
    }
});

document.getElementById('resetButton').addEventListener('click', function() {
    if (isRunning && socket) {
        socket.send(JSON.stringify({ action: 'reset' }));
    }
});

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Nettoyer le canvas


    if (car) {
        // Dessiner la voiture avec les vecteurs
        car.draw(ctx, scale, canvasHeight, canvasWidth, circuit.boundingBox, carSpeedVector, carNextPointVector);
    }
    if (circuit) {
        circuit.draw(ctx, scale, canvasHeight, canvasWidth);
    }
}


