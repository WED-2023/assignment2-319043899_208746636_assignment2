// User db
const users = [
    { username: 'p', password: 'testuser' },
    { username: '1', password: '1' } //delete before applying 
];

// =========Main function ============
document.addEventListener('DOMContentLoaded', () => {
    showSection('welcome');

    populateDays();
    populateMonths();
    populateYears();

    const signupForm = document.getElementById("signupForm");
    signupForm.addEventListener('submit', handle_signup);

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener('submit', handle_login);

    const startButton = document.getElementById("startbutton");
    startButton.addEventListener('click', handle_config);

    // ========== Modal - About ==========
    const template = document.getElementById("aboutTemplate");
    const clone = template.content.cloneNode(true);
    document.body.appendChild(clone);

    const dialog = document.getElementById("aboutModal");
    const closeBtn = document.getElementById("closeDialog");

    const aboutButton = document.querySelector('button[onclick="showSection(\'about\')"]');
    if (aboutButton) {
        aboutButton.addEventListener("click", (e) => {
            e.preventDefault();
            dialog.showModal();
        });
    }

    closeBtn.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
        ) {
            dialog.close();
        }
    });

    // ========== Handle keys  ==========
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
        if (event.key === window.shootKey){
            // Handle shooting action
            playerShoot();
        }
        if (event.key === "Escape" && dialog.open) {
            dialog.close();
        }
        
    });
    document.addEventListener("keyup", e => delete keys[e.key]);

    document.getElementById('exitButton').addEventListener('click', function() {
        gameRunning = false;
        document.querySelector('header').style.display = 'block';
        document.querySelector('nav').style.display = 'flex';
        showSection('welcome');
    });

    document.getElementById('close').addEventListener('click', function() {
        document.getElementById('gameOverDialog').classList.add('hidden');
    });

    document.getElementById('playAgainButton').addEventListener('click', function () {
        // // Hide the Game Over dialog if it's visible
        // //document.getElementById('gameOverDialog').classList.add('hidden');
    
        // // Reset player state
        // player.points = 0;
        // player.lives = 3;
        // player.x = playerStartPositionX;
        // player.y = playerStartPositionY;
    
        // // Reset game objects
        // enemyShips = [];
        // playerBullets = [];
        // enemyBullets = [];
        // enemySpeed = 2; // Reset enemy speed
        // enemyDirection = 1; // Reset enemy movement direction
        // count_acc = 0;

        // ctx.clearRect(0, 0, canvas.width, canvas.height);

    
        // // Reset UI elements
        // document.getElementById('game_score').textContent = player.points;
        // document.getElementById('lives').textContent = player.lives;
    
        // // Recreate enemies
        // createEnemies();
    
        // // Restart the game timer (e.g., 2 minutes by default)
        // //const duration = 2 * 60; // 2 minutes in seconds
        // startGameTimer(duration);
    
        // // Restart the game loop
        // gameRunning = true;
        // gameLoop();
        gameRunning=false;
        cancelAnimationFrame(gameLoopId); // Cancel the animation frame
        score = 0;
        lives = 3;
        playerBullets = [];
        enemyBullets = [];
        enemyShips = [];
        enemyDirection = 1;
        enemySpeed = 2;
        count_acc = 0;
        playerCanShoot = true;
        enemyCanShoot = true;   
        //enemyBulletSpeed = enemySpeed;

        document.getElementById('game_score').textContent = player.points;
        document.getElementById('lives').textContent = player.lives;
    
        player.x = Math.random() * (canvas.width - player.width);
        player.y = canvas.height - player.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        gameSetUp();

    });


    
});

// ========= utilities ==========
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gameRunning = false;
let gameLoopId = null;
let timerInterval;
let count_acc=0
const upperLimit = canvas.height * 0.6;
let player = {
    x: 0, y: 0, width: 60, height: 60, speed: 5 ,points: 0, lives: 0
};
let playerStartPositionX = Math.random() * (canvas.width - player.width); 
let playerStartPositionY = canvas.height - player.height;
let gameTime;
let keys = {};
let enemyShips = [];
let enemyBullets = [];
let enemyCanShoot = true;
let playerBullets = [];
let playerCanShoot = true;
let enemyDirection = 1; // 1 for right, -1 for left
let enemySpeed = 2; // Speed of enemy movement
let playerImg = new Image();
let badShip1Img = new Image();
let badShip2Img = new Image();
let badShip3Img = new Image();
let badShip4Img = new Image();
let enemyBulletImg = new Image();
const enemyBulletLimit = 0.75 * canvas.height;
const endGameStatus = {
    no_more_enemies: 'Champion!',
    no_life: 'You Lost!',
    timer_less_100: 'You can do better!',
    timer_more_100: 'Winner!'

};
 
let scoreHistory = {}; 
let currentPlayer = null;

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

function displayMessage(message, type, elementId = 'signupMessage') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = type === 'success' ? 'green' : 'red';
    }
}

function clearFormFields(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset(); // Clears all inputs in the form
    }
}

 //========= Signup =========================
function handle_signup(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confpass = document.getElementById("confirmPassword").value;
    const firstname = document.getElementById("firstName").value;
    const lastname = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;

    if (!/^[A-Za-z0-9]{8,}$/.test(password)) {
        displayMessage('Password must be at least 8 characters long and contain only letters and digits.', 'error');
        return;
    }
    if (/\d/.test(firstname)) {
        displayMessage('First name cannot contain numbers.', 'error');
        return;
    }
    if (/\d/.test(lastname)) {
        displayMessage('Last name cannot contain numbers.', 'error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        displayMessage('Please enter a valid email address.', 'error');
        return;
    }
    if (password !== confpass) {
        displayMessage('Passwords do not match.', 'error');
        return;
    }
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        displayMessage('The user name already exists!', 'error');
        return;
    }

    users.push({ username, password });
    displayMessage('You have successfully signed up!', 'success');
    clearFormFields("signupForm")

    setTimeout(() => {
        showSection('login');
    }, 1000);
}

function populateDays() {
    const daySelect = document.getElementById('birthDay');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
}

function populateMonths() {
    const monthSelect = document.getElementById('birthMonth');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}

function populateYears() {
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// ======= login ========
function handle_login(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const pass = document.getElementById("loginPassword").value;

    if (isValidUser(username, pass)) {
        alert("Login successful!");
        clearFormFields("loginForm")
        showSection('config');

        // Set the current player and initialize their score history
        currentPlayer = username;
        if (!scoreHistory[currentPlayer]) {
            scoreHistory[currentPlayer] = [];
        }
        // Clear the scoreboard for the new player
        const scoreboard = document.getElementById('scoreboard');
        if (scoreboard) {
            scoreboard.remove();
        }

    } else {
        displayMessage("Invalid username or password.", 'error', 'loginMessage');
    }
}

function isValidUser(username, password) {
    return users.some(user => user.username === username && user.password === password);
}

// ======= Game Configuration ==========
function handle_config(event){
    //const errors = [];

    event.preventDefault();

    const play_button=document.getElementById("shootKey")
    const time_to_play=document.getElementById("gameDuration")
    const play_button_value=play_button.value;
    const validShootKey = /^[a-zA-Z]$/.test(play_button_value) || play_button_value === ' ';
    if (!validShootKey || !play_button_value) {
        alert("Key is not valid! Please enter a valid shooting key (A-Z or Space).");

        return;
    }

    const duration=parseInt(time_to_play.value);
    const duration_in_seconds=duration*60;
    window.shootKey = play_button_value
    document.getElementById('configMessage').textContent = "";
    clearFormFields("configForm")
    console.log('Switching to game section');
    showSection('game')
    console.log('Starting game setup');
    gameSetUp(duration_in_seconds);

}


// ========= Game ==========
function gameSetUp(duration){

    document.querySelector('header').style.display = 'none';
    document.querySelector('nav').style.display = 'none';
    //document.body.style.overflow = 'hidden';

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.x = playerStartPositionX;
    player.y = playerStartPositionY;
    player.lives = 3;

    playerImg.src = 'assets/playerShip.png';
    badShip1Img.src = 'assets/enemyShip1.png';
    badShip2Img.src = 'assets/enemyShip2.png';
    badShip3Img.src = 'assets/enemyShip3.png';
    badShip4Img.src = 'assets/enemyShip4.png';

    // Start background music
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.volume = 0.5; 
    backgroundMusic.play();
    
    gameRunning = true;
    createEnemies()
    startGameTimer(duration);
    updateEnemyPositions()
    gameLoop()
};



function startGameTimer(duration) {
    // Reset timer if it's already running
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    const timerDisplay = document.getElementById('timerDisplay');
    
    // Update timer display function
    const updateDisplay = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    updateDisplay(duration);

    timerInterval = setInterval(function() {
        duration--;
        if(duration%5==0 && count_acc<=4){
            updateEnemySpeed();
        }
        updateDisplay(duration);
        
        if (duration <= 0 && player.points<100) {
            endGame('timer_less_100');

        }
        else if(duration <= 0 && player.points>=100){endGame('timer_more_100')}
    }, 1000);
}


function updateGame(){
    if(!gameRunning) return;
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(upperLimit, Math.min(canvas.height - player.height, player.y));

    updatePlayerBullets();
    updateEnemyPositions()
    updateEnemyBulletPositions()

    // Update the game info bar
    document.getElementById("game_score").textContent = player.points;
    document.getElementById("lives").textContent = player.lives; 
}

function drawGame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    
    enemyShips.forEach(enemy => {
        ctx.drawImage( enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    if (enemyCanShoot){
        enemyShoot()
        enemyCanShoot = false;
    }
    enemyBullets.forEach(bullet => {
        ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw player bullets
    playerBullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function gameLoop() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function endGame(status) {
    clearInterval(timerInterval);
    gameRunning = false; 
    cancelAnimationFrame(gameLoopId); // Cancel the animation frame

    // Stop music
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    
    // Set lives to 0 explicitly
    player.lives = 0;
    document.getElementById('lives').textContent = player.lives;

    if (currentPlayer) {
        scoreHistory[currentPlayer].push(player.points);
    }

    // Show the game over dialog
    const message = endGameStatus[status] || 'Game Over!';

    document.querySelector('#gameOverDialog h2').textContent = message;
    document.getElementById('finalScore').textContent = `Your Score: ${player.points}`;
    document.getElementById('gameOverDialog').classList.remove('hidden');
    createScoreBoard()
}


// ====== Game Utils ======
function createEnemies(){
    const rows = 4;
    const cols = 5;
    const spacing = 8;
    const enemyWidth = 50;
    const enemyHeight = 50;
    let image; 
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * (enemyWidth + spacing); 
            const y = r * (enemyHeight + spacing) + 4; 

            switch(r) {
                case 0:
                    image = badShip1Img; 
                    break;
                case 1:
                    image = badShip2Img; 
                    break;
                case 2:
                    image = badShip3Img; 
                    break;
                case 3:
                    image = badShip4Img; 
                    break;
            }
            enemyShips.push({
                x: x,
                y: y,
                width: enemyWidth,
                height: enemyHeight,
                image: image,
                row: r
            });
        }
    }
}



function updateEnemyPositions() {
    let reachedBoundary = false;

    enemyShips.forEach(enemy => {
        enemy.x += enemySpeed * enemyDirection;
        if (enemy.x >= canvas.width - 50 || enemy.x <= 0) {
            reachedBoundary = true;
        }
    });

    // If a boundary is reached reverse direction and move enemies down
    if (reachedBoundary) {
        enemyDirection *= -1; // Reverse direction
        enemyShips.forEach(enemy => {
        });
    }
}


function playerShoot() {
    if (!playerCanShoot) return;
    const bullet = {
        x: player.x + player.width / 2 - 5, // Center the bullet horizontally
        y: player.y, 
        width: 10,
        height: 20,
        speed: 10 // Bullet speed
    };
    playerBullets.push(bullet);

    playerCanShoot = false; // Set cooldown
    setTimeout(() => {
        playerCanShoot = true; 
    }, 300);
}

function updateEnemySpeed(){
    enemySpeed+=2;
    count_acc+=1;
}

function enemyShoot() {
    enemyBulletImg.src = 'assets/enemyBullet.png'
    const randomEnemy = enemyShips[Math.floor(Math.random() * enemyShips.length)];
    // Create a bullet object
    const bullet = {
        x: randomEnemy.x + randomEnemy.width / 2 - enemySpeed, 
        y: randomEnemy.y + randomEnemy.height, 
        width: 25, 
        height: 25,
        image: enemyBulletImg, 
        speed: enemySpeed 
    };

    enemyBullets.push(bullet);
    
}

function updateEnemyBulletPositions() {
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (isColliding(bullet, player)) {
            // Play player hit sound
            const playerHitSound = new Audio('assets/player-hit.mp3'); 
            playerHitSound.volume = 0.7; 
            playerHitSound.play();

            player.lives--;
            if (player.lives <= 0) {
                endGame();
            }

            player.x = playerStartPositionX;
            player.y = playerStartPositionY;
            return false;
        }
        // Remove if it's off-screen
        return bullet.y < canvas.height;
    });

    if (enemyBullets.length === 0 || enemyBullets[enemyBullets.length - 1].y >= enemyBulletLimit) {
        enemyCanShoot = true;
    }
}

function updatePlayerBullets() {
    playerBullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed; // Move the bullet upward

        enemyShips.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                // Play enemy hit sound
                const enemyHitSound = new Audio('assets/enemy-hit.mp3'); 
                enemyHitSound.volume = 0.7; 
                enemyHitSound.play();

                // Remove the bullet and the enemy
                playerBullets.splice(index, 1);
                enemyShips.splice(enemyIndex, 1);

                // Update player points based on the enemy row
                switch (enemy.row) {
                    case 0:
                        player.points += 20; 
                        break;
                    case 1:
                        player.points += 15; 
                        break;
                    case 2:
                        player.points += 10; 
                        break;
                    case 3:
                        player.points += 5; 
                        break;
                }
            }
        });

        // End the game if all enemies are destroyed
        if (enemyShips.length === 0) {
            endGame("no_more_enemies");
        }

        // Update the score display
        document.getElementById('game_score').textContent = player.points;

        // Remove bullets that go off-screen
        if (bullet.y + bullet.height < 0) {
            playerBullets.splice(index, 1); 
        }
    });
}

function isColliding(bullet, ship) {
    return (
        bullet.x < ship.x + ship.width &&
        bullet.x + bullet.width > ship.x &&
        bullet.y < ship.y + ship.height &&
        bullet.y + bullet.height > ship.y
    );
}

function createScoreBoard() {
    const $scoreboard = $("<div>", { id: "scoreboard" });
    $scoreboard.append("<h3>Scoreboard</h3>");

    if (currentPlayer && scoreHistory[currentPlayer]) {
        const scores = [...scoreHistory[currentPlayer]].sort((a, b) => b - a); 
        const currentScore = player.points;
        const position = scores.indexOf(currentScore) + 1;

        const $scoreList = $("<ul>");
        scores.forEach((score, index) => {
            $scoreList.append(`<li>${index + 1}. ${score}</li>`);
        });

        $scoreboard.append(`<p>Current Position: ${position}</p>`);
        $scoreboard.append($scoreList);
    } else {
        $scoreboard.append("<p>No scores available.</p>");
    }

    $("#gameOverDialog").append($scoreboard);
}

