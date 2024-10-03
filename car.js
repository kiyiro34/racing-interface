class Car {
    constructor(positionX, positionY, color) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.color = color;
        this.image = new Image();
        this.image.src = "done.webp";
    }

    draw(ctx, scale, canvasHeight, canvasWidth, circuitBoundingBox, droneSpeedVector, droneNextPointVector) {
        const { minX, maxX, minY, maxY } = circuitBoundingBox;

        // Calculer la largeur et la hauteur du circuit
        const circuitWidth = (maxX - minX) * scale;
        const circuitHeight = (maxY - minY) * scale;

        // Calculer les décalages pour centrer le drone
        const offsetX = (canvasWidth - circuitWidth) / 2 - minX * scale;
        const offsetY = (canvasHeight - circuitHeight) / 2 - minY * scale;

        // Position du drone sur le canvas
        const canvasX = this.positionX * scale + offsetX;
        const canvasY = canvasHeight - (this.positionY * scale + offsetY);

        // Dimensions du drone
        const droneWidth = 40;  
        const droneHeight = 40;

        // Dessiner l'image du drone temporairement sur un canvas invisible pour la recolorer
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = droneWidth;
        offCanvas.height = droneHeight;

        // Dessiner l'image du drone sur ce canvas temporaire
        offCtx.drawImage(this.image, 0, 0, droneWidth, droneHeight);

        // Appliquer la couleur au drone
        offCtx.globalCompositeOperation = 'source-in';
        offCtx.fillStyle = this.color;
        offCtx.fillRect(0, 0, droneWidth, droneHeight);

        // Dessiner le canvas temporaire sur le canvas principal
        ctx.drawImage(offCanvas, canvasX - droneWidth / 2, canvasY - droneHeight / 2);

        // Calculer le centre du drone
        const centerX = canvasX;
        const centerY = canvasY;

        // Dessiner les vecteurs de vitesse et direction à partir du centre du drone
        if (droneSpeedVector) {
            this.drawVector(ctx, centerX, centerY, droneSpeedVector.x, droneSpeedVector.y, 'red', scale);
        }

        if (droneNextPointVector) {
            const scaledNextPointVectorX = droneNextPointVector.x * 30;  
            const scaledNextPointVectorY = droneNextPointVector.y * 30;
            this.drawVector(ctx, centerX, centerY, scaledNextPointVectorX, scaledNextPointVectorY, '#5bff19', scale);
        }
    }

    // Méthode pour dessiner un vecteur depuis la position du drone
    drawVector(ctx, startX, startY, vectorX, vectorY, color, scale) {
        const vectorEndX = startX + vectorX * scale;
        const vectorEndY = startY - vectorY * scale;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(vectorEndX, vectorEndY);
        ctx.stroke();

        this.drawArrowHead(ctx, startX, startY, vectorEndX, vectorEndY);
    }

    // Méthode pour dessiner la tête de flèche à la fin d'un vecteur
    drawArrowHead(ctx, fromX, fromY, toX, toY) {
        const headLength = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(toX, toY);
        ctx.fill();
    }
}

// Utilisation de l'image du drone avec la couleur appliquée
const drone = new Drone(50, 50, 'blue', '/mnt/data/copter-2025680_960_720.webp');
