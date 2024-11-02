class Circuit {
    constructor(points) {
        this.points = points;
        this.boundingBox = this.calculateBoundingBox();
    }

    calculateBoundingBox() {
        const minX = Math.min(...this.points.map(point => point.x));
        const maxX = Math.max(...this.points.map(point => point.x));
        const minY = Math.min(...this.points.map(point => point.y));
        const maxY = Math.max(...this.points.map(point => point.y));
        return { minX, maxX, minY, maxY };
    }

    draw(ctx, scale, canvasHeight, canvasWidth) {
        const { minX, maxX, minY, maxY } = this.boundingBox;
        const circuitWidth = (maxX - minX) * scale;
        const circuitHeight = (maxY - minY) * scale;

        const offsetX = (canvasWidth - circuitWidth) / 2 - minX * scale;
        const offsetY = (canvasHeight - circuitHeight) / 2 - minY * scale;

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;

        ctx.beginPath();
        this.points.forEach((point, index) => {
            const x = point.x * scale + offsetX;
            const y = canvasHeight - (point.y * scale + offsetY);
            if (index === 0) {
                ctx.moveTo(x, y); 
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath(); 
        ctx.stroke(); 

        this.points.forEach(point => {
            const x = point.x * scale + offsetX;
            const y = canvasHeight - (point.y * scale + offsetY);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2); 
            ctx.fill(); 
        });
    }
}
