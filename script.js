const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const gameOverDiv = document.getElementById('gameOver');
const videoModal = document.getElementById('videoModal');
const closeModalBtn = document.getElementById('closeModal');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

let gameRunning = false;
let gameStarted = false;
let score = 0;
let celebrationShown = false;

const soundFiles = [
    'sounds/WhatsApp Audio 2025-06-27 at 13.10.31_4d485596.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.10.41_92058efe.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.10.47_14e030e3.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.11.04_058258a3.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.11.07_0373c747.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.11.14_040c34fb.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.11.25_6c38ce10.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.11.36_1554c128.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.15.06_ada35558.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.15.17_a69b0bfe.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.17.36_ddd80a46.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.17.38_9d03a8f4.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.17.44_166f076a.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.17.47_7188ba7a.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.18.08_4540c08c.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.18.22_c023025b.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.18.30_f78ae590.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.18.34_2626d831.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.19.46_2159bfef.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.20.02_bbc9c9e6.waptt.opus',
    'sounds/WhatsApp Audio 2025-06-27 at 13.20.30_d5d8df06.waptt.opus'
];

let lastSoundIndex = -1;
let playedSounds = new Set();

const sounds = soundFiles.map(file => {
    const audio = new Audio(file);
    audio.preload = 'auto';
    return audio;
});

let currentlyPlayingSound = null;

const birdImage = new Image();
birdImage.src = 'flappy/mereltje.png';

function playRandomSound() {
    if (currentlyPlayingSound) {
        currentlyPlayingSound.pause();
        currentlyPlayingSound.currentTime = 0;
    }
    
    const availableIndices = [];
    for (let i = 0; i < sounds.length; i++) {
        if (!playedSounds.has(i)) {
            availableIndices.push(i);
        }
    }
    
    if (availableIndices.length === 0) {
        playedSounds.clear();
        for (let i = 0; i < sounds.length; i++) {
            if (i !== lastSoundIndex) {
                availableIndices.push(i);
            }
        }
    }
    
    if (availableIndices.length > 0) {
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const sound = sounds[randomIndex];
        
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.log('Could not play sound:', e);
        });
        
        currentlyPlayingSound = sound;
        lastSoundIndex = randomIndex;
        playedSounds.add(randomIndex);
    }
}

const bird = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.15,
    jumpForce: -6,
    maxVelocity: 5,
    color: '#FFD700'
};

let pipes = [];
const pipeWidth = 60;
const pipeGap = 230;
const pipeSpeed = 1;

function initGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    celebrationShown = false;
    gameStarted = false;
    gameRunning = false;
    lastSoundIndex = -1;
    playedSounds.clear();
    currentlyPlayingSound = null;
    updateScore();
    gameOverDiv.style.display = 'none';
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        gameLoop();
    }
}

function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverDiv.style.display = 'block';
}

function updateScore() {
    scoreElement.textContent = score + '/15';
    
    if (score >= 15 && !celebrationShown) {
        celebrationShown = true;
        showCelebration();
    }
}

function showCelebration() {
    gameRunning = false;
    
    if (currentlyPlayingSound) {
        currentlyPlayingSound.pause();
        currentlyPlayingSound.currentTime = 0;
        currentlyPlayingSound = null;
    }
    
    videoModal.style.display = 'block';
    
    const video = document.getElementById('celebrationVideo');
    const endMessage = document.getElementById('endMessage');
    
    endMessage.style.display = 'none';
    
    video.currentTime = 0;
    video.play();
    
    video.addEventListener('ended', () => {
        endMessage.style.display = 'block';
    });
}

function drawBird() {
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function updateBird() {
    bird.velocity += bird.gravity;
    
    if (bird.velocity > bird.maxVelocity) {
        bird.velocity = bird.maxVelocity;
    }
    
    bird.y += bird.velocity;
    
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    if (bird.y + bird.height > canvas.height) {
        endGame();
    }
}

function jump() {
    if (!gameStarted) {
        startGame();
    }
    if (gameRunning) {
        bird.velocity = bird.jumpForce;
    }
}

function createPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomY: pipeHeight + pipeGap,
        bottomHeight: canvas.height - (pipeHeight + pipeGap),
        passed: false
    });
}

function updatePipes() {
    if (!gameStarted) return;
    
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        createPipe();
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;
        
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            updateScore();
            if (score < 15) {
                playRandomSound();
            }
        }
        
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
        
        if (checkCollision(pipe)) {
            endGame();
        }
    }
}

function checkCollision(pipe) {
    if (bird.x < pipe.x + pipeWidth &&
        bird.x + bird.width > pipe.x) {
        if (bird.y < pipe.topHeight ||
            bird.y + bird.height > pipe.bottomY) {
            return true;
        }
    }
    return false;
}

function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
        
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
        ctx.fillStyle = '#228B22';
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 150 + Date.now() * 0.01) % (canvas.width + 100);
        const y = 50 + Math.sin(i) * 30;
        drawCloud(x, y);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.arc(x + 25, y, 25, 0, 2 * Math.PI);
    ctx.arc(x + 50, y, 20, 0, 2 * Math.PI);
    ctx.arc(x + 25, y - 15, 15, 0, 2 * Math.PI);
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    drawPipes();
    drawBird();
    
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TIK OM TE STARTEN', canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillStyle = '#ff6b9d';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Gefeliciteerd!', canvas.width / 2, canvas.height / 2 + 120);
    }
}

function gameLoop() {
    updateBird();
    updatePipes();
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}
playAgainBtn.addEventListener('click', () => {
    initGame();
    draw();
});

closeModalBtn.addEventListener('click', () => {
    videoModal.style.display = 'none';
    const endMessage = document.getElementById('endMessage');
    endMessage.style.display = 'none';
    initGame();
    draw();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

canvas.addEventListener('click', (e) => {
    e.preventDefault();
    jump();
});


document.addEventListener('touchstart', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
});

document.addEventListener('touchend', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
});

document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
});


document.getElementById('celebrationVideo').addEventListener('click', (e) => {
    e.stopPropagation();
});


videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        closeModalBtn.click();
    }
});


initGame();
draw();
