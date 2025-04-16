// רשימת המשתמשים
const users = [
    { username: 'p', password: 'testuser' },
];

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

function handle_login(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const pass = document.getElementById("loginPassword").value;

    if (isValidUser(username, pass)) {
        alert("Login successful!");
        clearFormFields("loginForm")
        showSection('game');
    } else {
        displayMessage("Invalid username or password.", 'error', 'loginMessage');
    }
}

function isValidUser(username, password) {
    return users.some(user => user.username === username && user.password === password);
}

function displayMessage(message, type, elementId = 'signupMessage') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = type === 'success' ? 'green' : 'red';
    }
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

function clearFormFields(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset(); // Clears all inputs in the form
    }
}


const upperLimit = canvas.height * 0.6;
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let player = {
    x: 0, y: 0, width: 80, height: 80, speed: 5
};
let gameTime;
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => delete keys[e.key]);
document.addEventListener("keyleft", e => delete keys[e.key]);

function gameSetUp(){
    player.x = Math.random() * (canvas.width - player.width);
    player.y = canvas.height - player.height;

    playerImg = new Image();
    playerImg.src = 'assets/playerShip';
    
    badShip1Img = new Image();
    badShip1Img.src = 'assets/enemyShip1.png'; 

    badShip2Img = new Image();
    badShip2Img.src = 'assets/enemyShip2.png'; 

    badShip3Img = new Image();
    badShip3Img.src = 'assets/enemyShip3.png';
    
    startGameTimer();

};

function startGameTimer() {
    // Reset timer if it's already running
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    gameTime = 120;

    timerInterval = setInterval(function() {
        gameTime--;
        
        // Convert to minutes and seconds
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        
        // Display time in format MM:SS
        $('#gameTimer').text(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        
        // When time runs out
        if (gameTime <= 0) {
            clearInterval(timerInterval);
            // Add your game over logic here
            alert('Game Over!');
        }
    }, 1000);
}


function updateGame(){
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(upperLimit, Math.min(canvas.height - player.height, player.y));
}

function drwaGame(){

}

function gameLoop() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    gameLoopId = requestAnimationFrame(gameLoop);
  }



  document.addEventListener('DOMContentLoaded', () => {
    showSection('welcome');

    populateDays();
    populateMonths();
    populateYears();

    const signupForm = document.getElementById("signupForm");
    signupForm.addEventListener('submit', handle_signup);

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener('submit', handle_login);
});