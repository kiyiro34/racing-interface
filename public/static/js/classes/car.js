class Car {
    constructor(positionX, positionY, color, mass = 0, couple = 0) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.color = color;
        this.image = new Image();
        this.image.src = "static/img/done.webp";  // Met à jour cette source selon ton image
        this.heading = 0; // Initialiser la direction (heading)
        this.mass = mass; // Masse de la voiture
        this.couple = couple; // Couple de la voiture
    }

    draw(ctx, scale, canvasHeight, canvasWidth, circuitBoundingBox, speedVector, nextPointVector) {
        const { minX, maxX, minY, maxY } = circuitBoundingBox;

        const circuitWidth = (maxX - minX) * scale;
        const circuitHeight = (maxY - minY) * scale;

        const offsetX = (canvasWidth - circuitWidth) / 2 - minX * scale;
        const offsetY = (canvasHeight - circuitHeight) / 2 - minY * scale;

        const canvasX = this.positionX * scale + offsetX;
        const canvasY = canvasHeight - (this.positionY * scale + offsetY);

        const carWidth = 40;
        const carHeight = 40;

        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = carWidth;
        offCanvas.height = carHeight;

        offCtx.drawImage(this.image, 0, 0, carWidth, carHeight);

        offCtx.globalCompositeOperation = 'source-in';
        offCtx.fillStyle = this.color;
        offCtx.fillRect(0, 0, carWidth, carHeight);

        // Rotation de la voiture selon le heading
        ctx.save(); // Sauvegarde l'état du contexte
        ctx.translate(canvasX, canvasY); // Déplacement du contexte au centre de la voiture

        ctx.rotate(this.heading); // Rotation selon le heading
        ctx.drawImage(offCanvas, -carWidth / 2, -carHeight / 2); // Dessine l'image centrée sur le canvas
        ctx.restore(); // Restauration de l'état du contexte

        const centerX = canvasX;
        const centerY = canvasY;

        if (speedVector) {
            this.drawVector(ctx, centerX, centerY, speedVector.x, speedVector.y, '#680ecf', scale);
        }

        if (nextPointVector) {
            const scaledNextPointVectorX = nextPointVector.x * 30;
            const scaledNextPointVectorY = nextPointVector.y * 30;
            this.drawVector(ctx, centerX, centerY, scaledNextPointVectorX, scaledNextPointVectorY, '#0d8bd9', scale);
        }
    }

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

