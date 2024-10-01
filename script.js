let socket;
let isRunning = false;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800; // Largeur du canvas en pixels
const canvasHeight = 800; // Hauteur du canvas en pixels
const scale = canvasWidth / 200; // Échelle pour mapper 1000m à la largeur du canvas

let car = new Car(0, 0, 'blue'); // Crée une instance de la classe Car

// Dessine la voiture à la position de départ lors du chargement de la page
car.draw(ctx, scale, canvasHeight);

document.getElementById('startButton').addEventListener('click', function() {
    if (!isRunning) {
        socket = new WebSocket("ws://localhost:8080/positions");

        socket.onopen = function() {
            console.log("Connexion établie.");
            isRunning = true;
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            car.positionX = data.positionX; // Met à jour la position X
            car.positionY = data.positionY; // Met à jour la position Y (si nécessaire)
            draw(); // Redessine la voiture à la nouvelle position
        };
        
        socket.onclose = function() {
            console.log("Connexion fermée.");
            isRunning = false;
            document.getElementById('startButton').disabled = false;
            document.getElementById('stopButton').disabled = true;
        };
    }
});

document.getElementById('stopButton').addEventListener('click', function() {
    if (isRunning) {
        socket.close();  // Ferme la connexion WebSocket
        fetch("/stopSimulation", { method: "POST" });  // Envoie une requête pour arrêter la simulation
    }
});

// Fonction pour dessiner la voiture
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Efface le canevas avant de redessiner
    car.draw(ctx, scale, canvasHeight); // Dessine la voiture
}
