// car.js

class Car {
    constructor(positionX, positionY, color) {
        this.positionX = positionX; // Position X en mètres
        this.positionY = positionY; // Position Y en mètres
        this.color = color; // Couleur de la voiture
    }

    draw(ctx, scale, canvasHeight) {
        // Calcule les coordonnées sur le canevas
        const canvasX = Math.min(this.positionX * scale, canvasWidth); // Limite la position X
        const canvasY = (canvasHeight / 2) - 15; // Position Y centrée sur le milieu du canevas

        // Dessine la carrosserie de la voiture
        ctx.fillStyle = this.color;
        ctx.fillRect(canvasX, canvasY, 60, 20); // Corps de la voiture

        // Dessine le toit de la voiture
        ctx.fillStyle = this.color === 'blue' ? 'darkblue' : this.color; // Exemple de couleur de toit
        ctx.fillRect(canvasX + 15, canvasY - 10, 30, 10); // Toit de la voiture

        // Dessine les fenêtres
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(canvasX + 17, canvasY - 8, 10, 6); // Fenêtre avant
        ctx.fillRect(canvasX + 33, canvasY - 8, 10, 6); // Fenêtre arrière

        // Dessine les roues
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(canvasX + 15, canvasY + 20, 5, 0, Math.PI * 2); // Roue gauche
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvasX + 45, canvasY + 20, 5, 0, Math.PI * 2); // Roue droite
        ctx.fill();
    }
}
