let socket;
let isRunning = false;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 800;
const scale = canvasWidth / 500;

let drones = {};  
let droneColors = {}; 
let bestLapTimes = {}; 
let circuit = null;
const colors = ['#d11c04', '#0957bd', '#24bf4e', '#f5e105', '#9318cc', '#eb860c','#ad0e68']; 
let apiHost;

async function loadConfig() {
    try {
        const response = await fetch('/config');
        const config = await response.json();
        apiHost = config.apiHost;
    } catch (error) {
        console.error('Erreur lors de la récupération de la configuration:', error);
    }
}

// Initialize circuit
async function initializeCircuit() {
    if (!apiHost) {
        await loadConfig(); 
    }
    const url = `${apiHost}/circuit/points`;
    fetch(url, { method: "GET" })
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

// Add a car to the race
document.getElementById('addCarButton').addEventListener('click', function() {
    const droneBrand = document.getElementById('droneBrand').value;
    const power = document.getElementById('powerRange').value;
    const mass = document.getElementById('massRange').value;

    const droneData = {
        brand: droneBrand,
        power: power,
        mass: mass
    };
    addCar(droneData)
    
});

async function addCar(droneData) {
    if (!apiHost) {
        await loadConfig(); 
    }
    const url = `${apiHost}/drone/add`;
    // Send car data to the api
    fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(droneData)
    })
    .catch(error => console.error('Erreur lors de l\'ajout de la voiture:', error));
    
}

// Update slider data
document.getElementById('powerRange').addEventListener('input', function() {
    document.getElementById('powerValue').textContent = this.value;
});

document.getElementById('massRange').addEventListener('input', function() {
    document.getElementById('massValue').textContent = this.value;
});

document.getElementById('startButton').addEventListener('click', function() {
    socketInit()
});

async function socketInit() {
    if (!apiHost) {
        await loadConfig(); 
    }
    const socketUrl = `${apiHost}/positions`;
    if (!isRunning) {
        socket = new WebSocket(socketUrl);
        socket.onopen = function() {
            isRunning = true;
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
            document.getElementById('resetButton').disabled = false;
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.lapTime !== undefined) { 
                updateBestLapTime(data.carBrand, data.lapTime);
            }
            else{
                for (let droneModel in data) {
                    const droneData = data[droneModel];
                    if (droneData.positionX !== undefined && droneData.positionY !== undefined) {
                        if (!drones[droneModel]) {
                            const color = colors[Object.keys(drones).length % colors.length];
                            droneColors[droneModel] = color;
                            drones[droneModel] = new Drone(droneData.positionX, droneData.positionY, color, droneData.mass, droneData.couple);
                        } else {
                            drones[droneModel].positionX = droneData.positionX;
                            drones[droneModel].positionY = droneData.positionY;
                            drones[droneModel].mass = droneData.mass;
                            drones[droneModel].couple = droneData.couple;
                            drones[droneModel].heading = droneData.heading;
                        }
                        drones[droneModel].speedVector = { x: droneData.speedX, y: droneData.speedY };
                        drones[droneModel].nextPointVector = { x: droneData.nextPointVectorX, y: droneData.nextPointVectorY };
            
                        updateDashboard(droneModel, droneData.speedX, droneData.speedY, droneData.mass, droneData.couple);
                    }            
                }
                draw();
            }
            
        
        };
        socket.onclose = function() {
            isRunning = false;
            document.getElementById('startButton').disabled = false;
            document.getElementById('stopButton').disabled = true;
            document.getElementById('resetButton').disabled = true;
        };
    }
}


// Stop the simulation
document.getElementById('stopButton').addEventListener('click', function() {
    stopSimulation()
});

async function stopSimulation() {
    if (!apiHost) {
        await loadConfig(); 
    }
    const url = `${apiHost}/simulation/stop`;
    if (isRunning) {
        socket.close();
        fetch(url, { method: "POST" });
    }
}

async function resetSimulation() {
    if (!apiHost) {
        await loadConfig();
    }
    const url = `${apiHost}/simulation/reset`;
    if (isRunning) {
        socket.close();
        fetch(url, { method: "POST" });
    }
}

// Reset the simulation
document.getElementById('resetButton').addEventListener('click', function() {
    if (isRunning && socket) {
        resetSimulation()
    }
    drones = {};  
    document.getElementById('droneTable').querySelector('tbody').innerHTML = '';
    draw();
    bestLapTimes = {}; 
    updateLeaderboard(); 
});
function updateDashboard(droneModel, speedX, speedY, mass, couple) {
    const speedNorm = Math.sqrt(speedX * speedX + speedY * speedY).toFixed(2);

    let droneRow = document.getElementById(droneModel);
    if (!droneRow) {
        // 
        droneRow = document.createElement('tr');
        droneRow.id = droneModel;

        const colorCell = document.createElement('td');
        colorCell.style.width = '20px';
        const colorCircle = document.createElement('div');
        colorCircle.style.width = '12px';
        colorCircle.style.height = '12px';
        colorCircle.style.borderRadius = '50%';
        colorCircle.style.backgroundColor = droneColors[droneModel];  
        colorCircle.style.margin = 'auto';
        colorCell.appendChild(colorCircle);
        droneRow.appendChild(colorCell);

        //
        const modelCell = document.createElement('td');
        modelCell.textContent = droneModel;
        droneRow.appendChild(modelCell);

        //
        const speedCell = document.createElement('td');

        //
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%';

        progressBarContainer.appendChild(progressBar);
        speedCell.appendChild(progressBarContainer);
        droneRow.appendChild(speedCell);

        document.getElementById('droneTable').querySelector('tbody').appendChild(droneRow);

        //
        const infoRow = document.createElement('tr');
        infoRow.id = droneModel + '-info';
        const infoCell = document.createElement('td');
        infoCell.colSpan = 3;

        infoRow.appendChild(infoCell);
        document.getElementById('droneTable').querySelector('tbody').appendChild(infoRow);
    }

    // Update speed progression bar
    const progressBar = droneRow.querySelector('.progress-bar');

    const maxSpeed = 100;
    const normalizedSpeed = Math.min(speedNorm, maxSpeed);
    progressBar.style.width = `${(normalizedSpeed / maxSpeed) * 100}%`;

    const speedRatio = normalizedSpeed / maxSpeed;
    const red = Math.floor(255 * speedRatio);
    const blue = Math.floor(255 * (1 - speedRatio));
    const color = `rgb(${red}, 0, ${blue})`;

    progressBar.style.backgroundColor = color;

    const infoRow = document.getElementById(droneModel + '-info');
    const infoCell = infoRow.querySelector('td');
    infoCell.innerHTML = `<span style="font-size: 0.8em;">${mass} kg | ${couple} Nm</span>`;
}



// Update the best times
function updateBestLapTime(brand, lapTime) {
    if (!bestLapTimes[brand] || lapTime/1000 < bestLapTimes[brand]) {
        bestLapTimes[brand] = lapTime/1000;
        updateLeaderboard();
    }
}

// Update the leaderboard
function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardTable').querySelector('tbody');
    leaderboardBody.innerHTML = ''; 

    const entries = Object.entries(bestLapTimes);
    let sortedDrones;

    if (entries.length <= 1) {
        sortedDrones = entries;
    } else {
        sortedDrones = entries.sort((a, b) => a[1] - b[1]); 
    }

    sortedDrones.forEach(([model, time], index) => {
        const row = document.createElement('tr');
        
        const positionCell = document.createElement('td');
        positionCell.textContent = index + 1; 
        row.appendChild(positionCell);
        
        const modelCell = document.createElement('td');
        modelCell.textContent = model;
        row.appendChild(modelCell);
        
        const timeCell = document.createElement('td');
        timeCell.textContent = time.toFixed(2); 
        row.appendChild(timeCell);

        leaderboardBody.appendChild(row);
    });
}


function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (circuit) {
        circuit.draw(ctx, scale, canvasHeight, canvasWidth);
    }

    for (let droneModel in drones) {
        const droneInd = drones[droneModel];
        droneInd.draw(ctx, scale, canvasHeight, canvasWidth, circuit.boundingBox, droneInd.speedVector, droneInd.nextPointVector);
    }
}
