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

    // Méthode pour dessiner le circuit sur le canvas avec centrage
    draw(ctx, scale, canvasHeight, canvasWidth) {
        const { minX, maxX, minY, maxY } = this.boundingBox;

        // Calculer la largeur et la hauteur du circuit
        const circuitWidth = (maxX - minX) * scale;
        const circuitHeight = (maxY - minY) * scale;

        // Calculer les décalages pour centrer le circuit
        const offsetX = (canvasWidth - circuitWidth) / 2 - minX * scale;
        const offsetY = (canvasHeight - circuitHeight) / 2 - minY * scale;

        ctx.fillStyle = '#242322'; // Couleur pour le remplissage des points
        ctx.strokeStyle = '#242322'; // Couleur pour le tracé des lignes
        ctx.lineWidth = 3;

        // Dessiner les lignes entre les points
        ctx.beginPath();
        this.points.forEach((point, index) => {
            const x = point.x * scale + offsetX;
            const y = canvasHeight - (point.y * scale + offsetY);
            if (index === 0) {
                ctx.moveTo(x, y); // Déplacer au premier point sans tracer
            } else {
                ctx.lineTo(x, y); // Tracer une ligne jusqu'au point suivant
            }
        });
        ctx.closePath(); // Fermer le chemin pour dessiner le circuit complet
        ctx.stroke(); // Dessiner les lignes

        // Optionnel: Dessiner les points
        this.points.forEach(point => {
            const x = point.x * scale + offsetX;
            const y = canvasHeight - (point.y * scale + offsetY);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2); // Dessiner un petit cercle au point
            ctx.fill(); // Remplir le cercle
        });
    }
}
