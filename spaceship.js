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
            createPlayerBullet();
        }
        if (event.key === "Escape" && dialog.open) {
            dialog.close();
        }
        
    });
    document.addEventListener("keyup", e => delete keys[e.key]);

    document.getElementById('exitButton').addEventListener('click', function() {
        document.getElementById('gameOverDialog').classList.add('hidden');
        gameRunning = false;
    
        // Add logic here to go back to welcome mode
        // For example:
        document.querySelector('header').style.display = 'block';
        document.querySelector('nav').style.display = 'flex';
        // document.querySelector('.canvas-container').style.display = 'none';
        showSection('welcome');
    
        // Optionally reset game state here
    });
});

// ========= utilities ==========
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gameRunning = false;
let gameLoopId = null;
const upperLimit = canvas.height * 0.6;
let player = {
    x: 0, y: 0, width: 60, height: 60, speed: 5
};
let gameTime;
let keys = {};
let enemyShips = [];
let enemyBullets = [];
let enemyCanShoot = true;
let playerImg = new Image();
let badShip1Img = new Image();
let badShip2Img = new Image();
let badShip3Img = new Image();
let badShip4Img = new Image();
let enemyBulletImg = new Image();
const enemyBulletLimit = 0.75 * canvas.height;
 

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
        //errors.push("Please enter a valid shooting key (A-Z or Space).");
        //displayMessage("Key is not valid!.", 'error', 'configMessage');
        alert("Key is not valid! Please enter a valid shooting key (A-Z or Space).");

        return;
    }

    const duration=parseInt(time_to_play.value);
    const duration_in_seconds=duration*60;
    // if(duration_in_seconds<120){
    //     alert("Duration time is not valid! Please enter a duration of at least 2 minutes.");
    //     return;
    // }

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

    player.x = Math.random() * (canvas.width - player.width);
    player.y = canvas.height - player.height;

    playerImg.src = 'assets/playerShip.png';
    badShip1Img.src = 'assets/enemyShip1.png';
    badShip2Img.src = 'assets/enemyShip2.png';
    badShip3Img.src = 'assets/enemyShip3.png';
    badShip4Img.src = 'assets/enemyShip4.png';
    
    gameRunning = true;
    createEnemies()
    startGameTimer(duration);
    updateEnemyPositions()
    gameLoop()
};


let timerInterval;
let count_acc=0
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
            count_acc+=1;
        }
        updateDisplay(duration);
        
        if (duration <= 0) {
            clearInterval(timerInterval);
            gameRunning = false; 
            cancelAnimationFrame(gameLoopId); // Cancel the animation frame
            //alert('Game Over!');
            // Show the game over dialog
            document.getElementById('finalScore').textContent = `Your Score: ${player.points}`;
            document.getElementById('gameOverDialog').classList.remove('hidden');

        }
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

    updateEnemyPositions()
    updateEnemyBulletPositions()
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
}

function gameLoop() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    gameLoopId = requestAnimationFrame(gameLoop);
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


let enemyDirection = 1; // 1 for right, -1 for left
let enemySpeed = 2; // Speed of enemy movement

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

function playerShoot(){

}

function updateEnemySpeed(){
    enemySpeed+=3;
}

function enemyShoot() {
    enemyBulletImg.src = 'assets/enemyBullet.png'
    const randomEnemy = enemyShips[Math.floor(Math.random() * enemyShips.length)];
    // Create a bullet object
    const bullet = {
        x: randomEnemy.x + randomEnemy.width / 2 - 2, //needs to change by the speed of the enemy
        y: randomEnemy.y + randomEnemy.height, 
        width: 25, 
        height: 25,
        image: enemyBulletImg, 
        speed: enemySpeed // Bullet speed matches enemySpeed need to be change 
    };

    enemyBullets.push(bullet);
    
}

function updateEnemyBulletPositions(){
    enemyBullets.forEach(bullet => {
        bullet.y += bullet.speed; 
    });
    enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height);
    if (enemyBullets.length === 0 || enemyBullets[enemyBullets.length -1].y >= enemyBulletLimit){
        enemyCanShoot = true;
    }
}

