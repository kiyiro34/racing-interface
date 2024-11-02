// Récupération du canvas et du contexte
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Fonction pour dessiner la grille
function drawGrid() {
    const gridSpacing = 200; // Espace entre les lignes de la grille
    ctx.strokeStyle = '#ffffff'; // Couleur blanche pour les lignes
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.25; // Opacité des lignes de la grille (0.0 - 1.0)
    // Épaisseur des lignes augmentée

    // Dessiner les lignes verticales
    for (let x = -500; x <= canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Dessiner les lignes horizontales
    for (let y = -50; y <= canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// drawGrid()