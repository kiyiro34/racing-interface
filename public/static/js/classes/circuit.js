class Circuit {
    constructor(points) {
        this.points = points; // Les points du circuit sont un tableau d'objets {x, y}
        this.boundingBox = this.calculateBoundingBox();
    }

    // Calculer la boîte englobante du circuit (minX, minY, maxX, maxY)
    calculateBoundingBox() {
        const minX = Math.min(...this.points.map(point => point.x));
        const maxX = Math.max(...this.points.map(point => point.x));
        const minY = Math.min(...this.points.map(point => point.y));
        const maxY = Math.max(...this.points.map(point => point.y));
        return { minX, maxX, minY, maxY };
    }

    // Méthode pour dessiner les points du circuit sur le canvas avec centrage
    draw(ctx, scale, canvasHeight, canvasWidth) {
        const { minX, maxX, minY, maxY } = this.boundingBox;

        // Calculer la largeur et la hauteur du circuit
        const circuitWidth = (maxX - minX) * scale;
        const circuitHeight = (maxY - minY) * scale;

        // Calculer les décalages pour centrer le circuit
        const offsetX = (canvasWidth - circuitWidth) / 2 - minX * scale;
        const offsetY = (canvasHeight - circuitHeight) / 2 - minY * scale;

        ctx.fillStyle = '#242322';
        ctx.strokeStyle = '#242322';
        ctx.lineWidth = 1;

        this.points.forEach(point => {
            ctx.beginPath();
            // Appliquer le décalage pour centrer les points
            ctx.arc(point.x * scale + offsetX, canvasHeight - (point.y * scale + offsetY), 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }
}
