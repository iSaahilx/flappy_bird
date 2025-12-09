
//board
let board;
let baseBoardWidth = 1050;
let baseBoardHeight = 600;
let boardWidth = 1050;
let boardHeight = 600;
let context;
let scaleFactor = 1;
let isFullscreen = false;
let gameContainer; // Container for fullscreen

//bird
let baseBirdWidth = 70; //increased size for landscape
let baseBirdHeight = 70; //square aspect ratio for bird.jpg
let birdWidth = 70;
let birdHeight = 70;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let basePipeWidth = 140; //increased for landscape
let basePipeHeight = 320; //adjusted for landscape height
let pipeWidth = 140;
let pipeHeight = 320;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let startBgImg;
let gamestartImg;
let gameoverImg;
let gamestartGifElement;
let gameoverGifElement;

//physics
let baseVelocityX = -5; //pipes moving left speed (slightly faster for landscape)
let velocityX = -5;
let velocityY = 0; //bird jump speed
let baseGravity = 0.3; //slightly increased for larger bird
let gravity = 0.3;
let baseJumpVelocity = -8; //bird jump velocity

let gameOver = false;
let gameStarted = false;
let gameStartTime = 0;
let elapsedTime = 0; // in milliseconds
let lastTimeUpdate = 0;
let timeIncrements = [
    {value: 1000, label: "1 second"},      // 1 second
    {value: 3000, label: "3 seconds"},     // 3 seconds
    {value: 15000, label: "15 seconds"},   // 15 seconds
    {value: 60000, label: "1 minute"},     // 1 minute
    {value: 600000, label: "10 minutes"},  // 10 minutes
    {value: 900000, label: "15 minutes"},   // 15 minutes
    {value: 86400000, label: "1 day"},     // 1 day
    {value: 259200000, label: "3 days"},    // 3 days
    {value: 604800000, label: "1 week"},    // 1 week
    {value: 2592000000, label: "1 month"},  // ~1 month
    {value: 31536000000, label: "1 year"}   // 1 year
];
let currentTimeIncrementIndex = 0;
let showBirthMessage = false;
let birthMessageTime = 0;

// Random fact pause system
let isPaused = false;
let blurAmount = 0;
let pauseStartTime = 0;
let lastPauseCheck = 0;
let currentRandomFact = "";
let offscreenCanvas = null;
let offscreenContext = null;
let spacebarPressCount = 0; // Track spacebar presses during pause

// End-game message system based on spacebar presses
let totalSpacebarPresses = 0; // Track total spacebar presses during gameplay
let showEndGameMessage = false; // Whether to show end-game message
let currentEndGameMessage = ""; // Current end-game message to display
let endGameMessagePressCount = 0; // Track spacebar presses on end-game message screen
let selectedPressThreshold = 0; // Randomly selected threshold for this game
let gameOverFactMessage = ""; // Fact to display on black screen
let gameOverTimeoutId = null; // Timeout to auto-return to start screen
let gameOverLocked = false; // Prevent input while game over screen is locked
let showBlackFactScreen = false; // Whether to show black screen with fact before game over
let pressThresholds = [
    {presses: 20, message: "A girl disappears from the statistics every few minutes; the numbers do not stop, even if the game does."},
    {presses: 30, message: "The country reports improvement, yet thousands of daughters remain missing from the count."},
    {presses: 40, message: "One more press, one more reminder: the girl-to-boy ratio still refuses to balance."},
    {presses: 45, message: "State records show silence, but unrecorded cases speak a louder truth."},
    {presses: 54, message: "Every hour, a daughter is denied her future; the file stays open, the report stays closed."},
    {presses: 67, message: "Some districts gain awards for growth, yet their girl population shrinks in the background."},
    {presses: 72, message: "The system claims progress; the missing daughters suggest otherwise."},
    {presses: 80, message: "Census charts rise and fall, but the number of lost girls stays steady."},
    {presses: 86, message: "One more press, one more reminder that many cases never reach any official record."},
    {presses: 94, message: "For every 10 boys, several states still count fewer girls; the gap continues quietly."},
    {presses: 99, message: "Reports say protection, tradition says otherwise; the daughters remain in between."},
    {presses: 102, message: "Another press, another girl lost in the shadow of preference."},
    {presses: 108, message: "The numbers improve on paper, but the ground reality stays unchanged."},
    {presses: 115, message: "Some families welcome sons with drums; daughters leave the records with silence."},
    {presses: 123, message: "Statistics glitch every year, not because of error, but because too many girls are missing."},
    {presses: 129, message: "The map shows development, yet several regions remain unsafe for newborn girls."},
    {presses: 135, message: "Every press counts; every missing girl does too — the system simply does not show it."},
    {presses: 150, message: "Game complete. Reality incomplete. The number of daughters still does not match the promise."}
];

const randomFacts = [
    "Haryana continues to lead in the silent competition of missing daughters.",
    "Punjab grows crops well, but the number of girls keeps shrinking.",
    "Rajasthan protects its forts better than its newborn girls.",
    "Uttar Pradesh has a high population, but girl births remain strangely low.",
    "Gujarat manages business perfectly, except the business of giving girls a chance to live.",
    "Maharashtra is rich in finance, but poor in surviving daughters.",
    "Rural Rajasthan still treats sons like assets and daughters like liabilities.",
    "Bihar's culture is strong, yet girl children remain weak in safety.",
    "Jharkhand once respected mother figures, but the numbers now tell a harsher story.",
    "West Bengal speaks of progress, while its girl count quietly disagrees.",
    "Tamil Nadu developed fast, but daughter protection developed slowly.",
    "Karnataka builds modern cities, but rural areas still murder daughters before birth.",
    "Andhra and Telangana grow in technology, including silent misuse for sex selection.",
    "Madhya Pradesh is the heart of India, but its heartbeat for girls stays low.",
    "Chhattisgarh holds many resources, yet daughters remain the rarest one.",
    "Some tribal societies once valued girls, but modern influence changed the tradition.",
    "Upper caste families defend 'honor,' often at the cost of a newborn girl.",
    "Lower castes face blame, while upper castes hide their own numbers.",
    "In many villages, the well remembers more lost girls than the census.",
    "Some midwives still ask if the family 'wants the baby to live.'",
    "Old houses whisper stories of daughters who never got named.",
    "The silence around girl births speaks louder than reports.",
    "Some families keep traditions alive by keeping daughters silent.",
    "The country celebrates Girl Child Day, while reality stays unchanged the rest of the year.",
    "Schemes promise safety, but society promises preference.",
    "Bans exist on sex detection, but patriarchy finds its own method.",
    "The statistics show progress, but the ground shows hesitation.",
    "Saving daughters remains a slogan, not a daily practice."
];

function calculateCanvasSize() {
    const aspectRatio = baseBoardWidth / baseBoardHeight; // 1.75
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    
    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;
    
    // If height exceeds viewport, scale based on height instead
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }
    
    boardWidth = Math.floor(newWidth);
    boardHeight = Math.floor(newHeight);
    scaleFactor = boardWidth / baseBoardWidth;
    
    // Update canvas dimensions
    board.width = boardWidth;
    board.height = boardHeight;
    
    // Update scaled dimensions
    birdWidth = Math.floor(baseBirdWidth * scaleFactor);
    birdHeight = Math.floor(baseBirdHeight * scaleFactor);
    birdX = boardWidth / 8;
    birdY = boardHeight / 2;
    
    pipeWidth = Math.floor(basePipeWidth * scaleFactor);
    pipeHeight = Math.floor(basePipeHeight * scaleFactor);
    pipeX = boardWidth;
    
    // Update bird object
    bird.x = birdX;
    bird.y = birdY;
    bird.width = birdWidth;
    bird.height = birdHeight;
    
    // Update GIF elements
    if (gamestartGifElement) {
        gamestartGifElement.style.width = boardWidth + 'px';
        gamestartGifElement.style.height = boardHeight + 'px';
    }
    if (gameoverGifElement) {
        gameoverGifElement.style.width = boardWidth + 'px';
        gameoverGifElement.style.height = boardHeight + 'px';
    }
    
    // Update offscreen canvas
    if (offscreenCanvas) {
        offscreenCanvas.width = boardWidth;
        offscreenCanvas.height = boardHeight;
    }
    
    // Scale physics values
    velocityX = baseVelocityX * scaleFactor;
    gravity = baseGravity * scaleFactor;
}

window.onload = function() {
    board = document.getElementById("board");
    context = board.getContext("2d"); //used for drawing on the board
    gameContainer = document.getElementById("game-container");
    
    // Get references to GIF elements
    gamestartGifElement = document.getElementById("gamestart-gif");
    gameoverGifElement = document.getElementById("gameover-gif");
    
    // Calculate initial canvas size
    calculateCanvasSize();
    
    // Create offscreen canvas for blur effect
    offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = boardWidth;
    offscreenCanvas.height = boardHeight;
    offscreenContext = offscreenCanvas.getContext("2d");
    
    // Handle window resize
    window.addEventListener('resize', function() {
        calculateCanvasSize();
    });
    
    // Handle fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./bird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./hand2.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./hand.png";

    // Load start screen background
    startBgImg = new Image();
    startBgImg.src = "./start.jpg";
    
    // Load game start GIF
    gamestartImg = new Image();
    gamestartImg.src = "./gamestart.gif";
    gamestartImg.onload = function() {
        drawStartScreen();
    }
    
    // Load game over GIF
    gameoverImg = new Image();
    gameoverImg.src = "./gameover.gif";

    requestAnimationFrame(update);
    setInterval(placePipes, 4000); //every 4 seconds - more space between pipe sets
    document.addEventListener("keydown", handleKeyPress);
}

function update() {
    requestAnimationFrame(update);
    
    if (!gameStarted) {
        drawStartScreen();
        return;
    }
    
    if (showBlackFactScreen) {
        drawBlackFactScreen();
        return;
    }
    
    if (gameOver) {
        drawGameOverScreen();
        return;
    }
    
    // Hide GIFs during gameplay
    if (gamestartGifElement) {
        gamestartGifElement.style.display = "none";
    }
    if (gameoverGifElement) {
        gameoverGifElement.style.display = "none";
    }
    
    // Update time
    let currentTime = Date.now();
    
    // Check for random pause (every 15-20 seconds on average)
    // Don't pause if we're about to show end-game message
    if (!isPaused && gameStartTime > 0 && !showEndGameMessage) {
        let timeSinceLastPause = currentTime - lastPauseCheck;
        if (timeSinceLastPause > 7000) { // Check every 7 seconds
            // 25% chance to pause each check (averages to ~20 seconds between pauses)
            if (Math.random() < 0.30) {
                isPaused = true;
                pauseStartTime = currentTime;
                blurAmount = 0;
                spacebarPressCount = 0; // Reset spacebar press counter
                currentRandomFact = randomFacts[Math.floor(Math.random() * randomFacts.length)];
            }
            lastPauseCheck = currentTime;
        }
    }
    
    // Handle pause state
    if (isPaused) {
        // Draw game state first, then overlay pause screen
        drawGameState();
        drawPausedScreen();
        return;
    }
    
    context.clearRect(0, 0, board.width, board.height);
    
    if (gameStartTime === 0) {
        gameStartTime = currentTime;
        lastTimeUpdate = currentTime;
    }
    
    // Randomly increment time
    let timeSinceLastUpdate = currentTime - lastTimeUpdate;
    if (timeSinceLastUpdate >= 1000) { // Check every second
        // Randomly select an increment index, with bias towards higher values over time
        let random = Math.random();
        if (random < 0.4) {
            // 40% chance: stay at current or go back one
            currentTimeIncrementIndex = Math.max(0, currentTimeIncrementIndex - 1);
        } else if (random < 0.7) {
            // 30% chance: stay at current
            // currentTimeIncrementIndex stays the same
        } else {
            // 30% chance: advance to next increment
            if (currentTimeIncrementIndex < timeIncrements.length - 1) {
                currentTimeIncrementIndex++;
            }
        }
        
        let increment = timeIncrements[currentTimeIncrementIndex];
        elapsedTime += increment.value;
        lastTimeUpdate = currentTime;
    }

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        triggerNormalGameOver();
        return;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            triggerNormalGameOver();
            return;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //display time
    let timeString = formatTime(elapsedTime);
    context.fillStyle = "white";
    let fontSize = Math.floor(45 * scaleFactor);
    context.font = fontSize + "px sans-serif";
    context.fillText(timeString, 5 * scaleFactor, 45 * scaleFactor);
    
    // Show birth message if needed
    if (showBirthMessage) {
        let messageTime = Date.now() - birthMessageTime;
        if (messageTime < 3000) { // Show for 3 seconds
            context.fillStyle = "yellow";
            let fontSize = Math.floor(40 * scaleFactor);
            context.font = "bold " + fontSize + "px sans-serif";
            context.textAlign = "center";
            context.fillText("Congratulations! A baby girl is born", boardWidth/2, boardHeight/2);
            context.textAlign = "left";
        } else {
            showBirthMessage = false;
        }
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = boardHeight/2.5; //larger gap for easier passage

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function drawStartScreen() {
    // Hide game over GIF
    if (gameoverGifElement) {
        gameoverGifElement.style.display = "none";
    }
    
    // Show animated start GIF
    if (gamestartGifElement) {
        gamestartGifElement.style.display = "block";
    } else {
        // Fallback: draw static image to canvas
        context.clearRect(0, 0, boardWidth, boardHeight);
        if (startBgImg && startBgImg.complete) {
            context.drawImage(startBgImg, 0, 0, boardWidth, boardHeight);
        } else {
            context.fillStyle = "#87CEEB";
            context.fillRect(0, 0, boardWidth, boardHeight);
        }
    }
}

function drawGameOverScreen() {
    // Hide start GIF if visible
    if (gamestartGifElement) {
        gamestartGifElement.style.display = "none";
    }
    
    // Show animated game over GIF
    if (gameoverGifElement) {
        gameoverGifElement.style.display = "block";
    } else {
        // Fallback: draw static image to canvas
        context.clearRect(0, 0, boardWidth, boardHeight);
        if (startBgImg && startBgImg.complete) {
            context.drawImage(startBgImg, 0, 0, boardWidth, boardHeight);
        } else {
            context.fillStyle = "#87CEEB";
            context.fillRect(0, 0, boardWidth, boardHeight);
        }
    }
}

function drawBlackFactScreen() {
    // Hide all GIFs
    if (gamestartGifElement) {
        gamestartGifElement.style.display = "none";
    }
    if (gameoverGifElement) {
        gameoverGifElement.style.display = "none";
    }
    
    // Draw black background
    context.fillStyle = "black";
    context.fillRect(0, 0, boardWidth, boardHeight);
    
    // Draw the fact message (wrapped text)
    let factFontSize = Math.floor(32 * scaleFactor);
    context.font = factFontSize + "px sans-serif";
    context.fillStyle = "white";
    context.textAlign = "center";
    
    // Word wrap the fact text
    let words = gameOverFactMessage.split(' ');
    let line = '';
    let y = boardHeight/2 - (60 * scaleFactor);
    let maxWidth = boardWidth - (100 * scaleFactor);
    let lineHeight = 45 * scaleFactor;
    
    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            context.fillText(line, boardWidth/2, y);
            line = words[i] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, boardWidth/2, y);
    
    context.textAlign = "left";
}

function triggerGameOverWithFact(message) {
    // Set the fact message and show black screen first
    gameOverFactMessage = message || "";
    showBlackFactScreen = true;
    gameOver = false;
    gameOverLocked = true;
    
    // Clear any existing timeout
    if (gameOverTimeoutId) {
        clearTimeout(gameOverTimeoutId);
    }
    
    // After 3 seconds, show game over GIF
    gameOverTimeoutId = setTimeout(function() {
        showBlackFactScreen = false;
        gameOver = true;
        
        // After 2 more seconds, go to start screen
        gameOverTimeoutId = setTimeout(function() {
            resetToStartScreen();
        }, 2000);
    }, 3000);
}

function triggerNormalGameOver() {
    // Normal game over (collision or falling)
    gameOverFactMessage = ""; // No fact message
    gameOver = true;
    gameOverLocked = true;
    
    // Clear any existing timeout
    if (gameOverTimeoutId) {
        clearTimeout(gameOverTimeoutId);
    }
    
    // Auto-return to start screen after 2 seconds
    gameOverTimeoutId = setTimeout(function() {
        resetToStartScreen();
    }, 2000);
}

function resetToStartScreen() {
    // Clear timeout if exists
    if (gameOverTimeoutId) {
        clearTimeout(gameOverTimeoutId);
        gameOverTimeoutId = null;
    }
    
    // Reset all game state
    gameOver = false;
    gameStarted = false;
    gameOverLocked = false;
    gameOverFactMessage = "";
    showBlackFactScreen = false;
    isPaused = false;
    showBirthMessage = false;
    spacebarPressCount = 0;
    totalSpacebarPresses = 0;
    endGameMessagePressCount = 0;
    showEndGameMessage = false;
    currentEndGameMessage = "";
    
    // Reset bird and game values
    bird.x = birdX;
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    elapsedTime = 0;
    currentTimeIncrementIndex = 0;
    gameStartTime = 0;
    lastTimeUpdate = 0;
    lastPauseCheck = 0;
}

function formatTime(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let totalMinutes = Math.floor(totalSeconds / 60);
    let totalHours = Math.floor(totalMinutes / 60);
    let totalDays = Math.floor(totalHours / 24);
    let totalWeeks = Math.floor(totalDays / 7);
    let totalMonths = Math.floor(totalDays / 30);
    let totalYears = Math.floor(totalDays / 365);
    
    if (totalYears > 0) {
        return totalYears + (totalYears === 1 ? " year" : " years");
    } else if (totalMonths > 0) {
        return totalMonths + (totalMonths === 1 ? " month" : " months");
    } else if (totalWeeks > 0) {
        return totalWeeks + (totalWeeks === 1 ? " week" : " weeks");
    } else if (totalDays > 0) {
        return totalDays + (totalDays === 1 ? " day" : " days");
    } else if (totalHours > 0) {
        return totalHours + (totalHours === 1 ? " hour" : " hours");
    } else if (totalMinutes > 0) {
        return totalMinutes + (totalMinutes === 1 ? " minute" : " minutes");
    } else {
        return totalSeconds + (totalSeconds === 1 ? " second" : " seconds");
    }
}

function drawGameState() {
    // Draw the current game state (used for pause screen)
    context.clearRect(0, 0, board.width, board.height);
    drawGameStateToCanvas(context);
}

function drawGameStateToCanvas(ctx) {
    // Draw the current game state to any canvas context
    //bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    //display time
    let timeString = formatTime(elapsedTime);
    ctx.fillStyle = "white";
    let fontSize = Math.floor(45 * scaleFactor);
    ctx.font = fontSize + "px sans-serif";
    ctx.fillText(timeString, 5 * scaleFactor, 45 * scaleFactor);
}

function drawPausedScreen() {
    // Gradually increase blur
    let pauseDuration = Date.now() - pauseStartTime;
    blurAmount = Math.min(pauseDuration / 20, 8); // Max blur of 8px, reached in 160ms
    
    // Draw game state to offscreen canvas first
    offscreenContext.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    drawGameStateToCanvas(offscreenContext);
    
    // Clear main canvas
    context.clearRect(0, 0, board.width, board.height);
    
    // Save context state
    context.save();
    
    // Apply blur filter to the context (this will blur what we draw next)
    context.filter = `blur(${blurAmount}px)`;
    
    // Draw the blurred game state from offscreen canvas
    context.drawImage(offscreenCanvas, 0, 0);
    
    // Restore context (removes blur filter for text)
    context.restore();
    
    // Apply semi-transparent dark overlay for better text visibility
    context.fillStyle = `rgba(0, 0, 0, 0.5)`;
    context.fillRect(0, 0, board.width, board.height);
    
    // Draw the random fact (wrapped text)
    let factFontSize = Math.floor(30 * scaleFactor);
    context.font = factFontSize + "px sans-serif";
    context.fillStyle = "yellow";
    context.strokeStyle = "black";
    context.lineWidth = Math.max(1, Math.floor(2 * scaleFactor));
    context.textAlign = "center";
    
    // Word wrap the fact text
    let words = currentRandomFact.split(' ');
    let line = '';
    let y = boardHeight/2;
    let maxWidth = boardWidth - (100 * scaleFactor);
    let lineHeight = 40 * scaleFactor;
    
    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            context.strokeText(line, boardWidth/2, y);
            context.fillText(line, boardWidth/2, y);
            line = words[i] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.strokeText(line, boardWidth/2, y);
    context.fillText(line, boardWidth/2, y);
    
    // Instructions
    let instructionFontSize = Math.floor(25 * scaleFactor);
    context.font = instructionFontSize + "px sans-serif";
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = Math.max(1, Math.floor(2 * scaleFactor));
    let instructionText = "Press SPACE to continue";
    let instructionY = boardHeight - (50 * scaleFactor);
    context.strokeText(instructionText, boardWidth/2, instructionY);
    context.fillText(instructionText, boardWidth/2, instructionY);
    
    context.textAlign = "left";
}

function handleKeyPress(e) {
    // Toggle fullscreen with F key
    if (e.code == "KeyF") {
        toggleFullscreen();
        return;
    }
    
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Ignore all input when game over is locked (5 second wait)
        if (gameOverLocked) {
            return;
        }
        
        // Resume from pause (requires 3 spacebar presses)
        if (isPaused) {
            spacebarPressCount++;
            if (spacebarPressCount >= 3) {
                isPaused = false;
                blurAmount = 0;
                spacebarPressCount = 0; // Reset counter
                board.style.filter = 'none'; // Remove blur filter
                lastPauseCheck = Date.now();
            }
            return;
        }
        
        // Start game from start screen
        if (!gameStarted) {
            gameStarted = true;
            gameStartTime = Date.now();
            lastTimeUpdate = Date.now();
            lastPauseCheck = Date.now();
            elapsedTime = 0;
            currentTimeIncrementIndex = 0;
            bird.y = birdY;
            bird.x = birdX;
            velocityY = 0; // Reset velocity
            pipeArray = [];
            totalSpacebarPresses = 0; // Reset press counter
            gameOverFactMessage = ""; // Clear any previous fact message
            // Randomly select a threshold for this game
            selectedPressThreshold = pressThresholds[Math.floor(Math.random() * pressThresholds.length)];
            return;
        }
        
        // Jump during gameplay
        if (!gameOver && !isPaused) {
            velocityY = baseJumpVelocity * scaleFactor; //scaled jump velocity
            totalSpacebarPresses++; // Track total presses
            
            // Check if we've reached the selected threshold
            if (totalSpacebarPresses >= selectedPressThreshold.presses) {
                // Go directly to game over screen with fact overlay
                triggerGameOverWithFact(selectedPressThreshold.message);
            }
        }
        
        // Reset game from game over screen (only if not locked)
        if (gameOver && !gameOverLocked) {
            gameOver = false;
            gameStarted = true; // Ensure game is started
            isPaused = false;
            spacebarPressCount = 0;
            bird.y = birdY;
            bird.x = birdX;
            velocityY = 0; // Reset velocity to prevent immediate fall
            pipeArray = [];
            elapsedTime = 0;
            gameStartTime = Date.now();
            lastTimeUpdate = Date.now();
            lastPauseCheck = Date.now();
            currentTimeIncrementIndex = 0;
            showBirthMessage = true;
            birthMessageTime = Date.now();
            totalSpacebarPresses = 0; // Reset press counter
            gameOverFactMessage = ""; // Clear fact message
            showBlackFactScreen = false;
            // Randomly select a new threshold for the next game
            selectedPressThreshold = pressThresholds[Math.floor(Math.random() * pressThresholds.length)];
        }
    }
}

function detectCollision(a, b) {
    // Add padding to make collision detection more forgiving
    // This accounts for transparent areas in the hand images
    // Using larger padding (25%) to make it more forgiving
    let paddingX = b.width * 0.15; // 15% padding on left and right
    let paddingY = b.height * 0.15; // 15% padding on top and bottom
    
    // Adjust collision box with padding (smaller effective collision area)
    let adjustedB = {
        x: b.x + paddingX,
        y: b.y + paddingY,
        width: b.width - (paddingX * 2),
        height: b.height - (paddingY * 2)
    };
    
    // Also add small padding to bird for more forgiving collision
    let birdPadding = 5;
    let adjustedA = {
        x: a.x + birdPadding,
        y: a.y + birdPadding,
        width: a.width - (birdPadding * 2),
        height: a.height - (birdPadding * 2)
    };
    
    return adjustedA.x < adjustedB.x + adjustedB.width &&   //a's top left corner doesn't reach b's top right corner
           adjustedA.x + adjustedA.width > adjustedB.x &&   //a's top right corner passes b's top left corner
           adjustedA.y < adjustedB.y + adjustedB.height &&  //a's top left corner doesn't reach b's bottom left corner
           adjustedA.y + adjustedA.height > adjustedB.y;    //a's bottom left corner passes b's top left corner
}

// Fullscreen functions
function toggleFullscreen() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        // Enter fullscreen
        let element = gameContainer || document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function handleFullscreenChange() {
    isFullscreen = !!(document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.mozFullScreenElement || 
                      document.msFullscreenElement);
    
    // Recalculate canvas size after fullscreen change
    setTimeout(function() {
        calculateCanvasSize();
    }, 100);
}