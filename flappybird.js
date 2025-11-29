
//board
let board;
let boardWidth = 1050;
let boardHeight = 600;
let context;

//bird
let birdWidth = 70; //increased size for landscape
let birdHeight = 70; //square aspect ratio for bird.jpg
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
let pipeWidth = 140; //increased for landscape
let pipeHeight = 320; //adjusted for landscape height
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let startBgImg;

//physics
let velocityX = -5; //pipes moving left speed (slightly faster for landscape)
let velocityY = 0; //bird jump speed
let gravity = 0.3; //slightly increased for larger bird

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

const randomFacts = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!",
    "Octopuses have three hearts. Two pump blood to the gills, while the third pumps blood to the rest of the body.",
    "Bananas are berries, but strawberries aren't. Botanically speaking, berries have seeds inside their flesh.",
    "A day on Venus is longer than its year. Venus rotates so slowly that it takes 243 Earth days to complete one rotation, but only 225 Earth days to orbit the sun.",
    "Sharks have been around longer than trees. Sharks have existed for over 400 million years, while trees appeared around 350 million years ago.",
    "Wombat poop is cube-shaped. This unique shape helps prevent the droppings from rolling away on slopes.",
    "A group of flamingos is called a 'flamboyance'.",
    "Dolphins have names for each other. They use signature whistles to identify individual dolphins.",
    "The human brain uses about 20% of the body's total energy, even though it only makes up about 2% of body weight.",
    "There are more possible games of chess than atoms in the observable universe.",
    "A single cloud can weigh more than a million pounds.",
    "The shortest war in history lasted only 38-45 minutes. It was between Britain and Zanzibar in 1896.",
    "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.",
    "A group of owls is called a 'parliament'.",
    "The human nose can detect over 1 trillion different scents."
];

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

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
    startBgImg.onload = function() {
        drawStartScreen();
    }

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
    
    if (gameOver) {
        drawGameOverScreen();
        return;
    }
    
    // Update time
    let currentTime = Date.now();
    
    // Check for random pause (every 5-15 seconds of gameplay)
    if (!isPaused && gameStartTime > 0) {
        let timeSinceLastPause = currentTime - lastPauseCheck;
        if (timeSinceLastPause > 5000) { // Check every 5 seconds
            // 5% chance to pause each check
            if (Math.random() < 0.05) {
                isPaused = true;
                pauseStartTime = currentTime;
                blurAmount = 0;
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
        gameOver = true;
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
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //display time
    let timeString = formatTime(elapsedTime);
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(timeString, 5, 45);
    
    // Show birth message if needed
    if (showBirthMessage) {
        let messageTime = Date.now() - birthMessageTime;
        if (messageTime < 3000) { // Show for 3 seconds
            context.fillStyle = "yellow";
            context.font = "bold 40px sans-serif";
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
    let openingSpace = board.height/2.5; //larger gap for easier passage

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
    // Draw background if loaded
    if (startBgImg && startBgImg.complete) {
        context.drawImage(startBgImg, 0, 0, boardWidth, boardHeight);
    } else {
        // Fallback: clear with a color
        context.fillStyle = "#87CEEB";
        context.fillRect(0, 0, boardWidth, boardHeight);
    }
    
    // Draw title and instructions
    context.fillStyle = "white";
    context.font = "bold 60px sans-serif";
    context.textAlign = "center";
    context.fillText("FLAPPY BIRD", boardWidth/2, boardHeight/2 - 100);
    
    context.font = "30px sans-serif";
    context.fillText("Press SPACE to Start", boardWidth/2, boardHeight/2 + 50);
    context.textAlign = "left";
}

function drawGameOverScreen() {
    // Draw background if loaded
    if (startBgImg && startBgImg.complete) {
        context.drawImage(startBgImg, 0, 0, boardWidth, boardHeight);
    } else {
        // Fallback: clear with a color
        context.fillStyle = "#87CEEB";
        context.fillRect(0, 0, boardWidth, boardHeight);
    }
    
    context.fillStyle = "white";
    context.font = "bold 60px sans-serif";
    context.textAlign = "center";
    context.fillText("We lost a baby girl", boardWidth/2, boardHeight/2 - 50);
    
    let timeString = formatTime(elapsedTime);
    context.font = "40px sans-serif";
    context.fillText("Time: " + timeString, boardWidth/2, boardHeight/2 + 50);
    
    context.font = "30px sans-serif";
    context.fillText("Press SPACE to Restart", boardWidth/2, boardHeight/2 + 120);
    context.textAlign = "left";
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
    
    //bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    //display time
    let timeString = formatTime(elapsedTime);
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(timeString, 5, 45);
}

function drawPausedScreen() {
    // Gradually increase blur
    let pauseDuration = Date.now() - pauseStartTime;
    blurAmount = Math.min(pauseDuration / 20, 10); // Max blur of 10px, reached in 200ms
    
    // Apply blur effect using semi-transparent overlay
    context.fillStyle = `rgba(0, 0, 0, ${blurAmount * 0.05})`;
    context.fillRect(0, 0, board.width, board.height);
    
    // Draw "RANDOM FACT" title
    context.fillStyle = "white";
    context.font = "bold 50px sans-serif";
    context.textAlign = "center";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeText("RANDOM FACT", boardWidth/2, boardHeight/2 - 100);
    context.fillText("RANDOM FACT", boardWidth/2, boardHeight/2 - 100);
    
    // Draw the random fact (wrapped text)
    context.font = "30px sans-serif";
    context.fillStyle = "yellow";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    
    // Word wrap the fact text
    let words = currentRandomFact.split(' ');
    let line = '';
    let y = boardHeight/2;
    let maxWidth = boardWidth - 100;
    let lineHeight = 40;
    
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
    context.font = "25px sans-serif";
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.strokeText("Press SPACE to continue", boardWidth/2, boardHeight - 50);
    context.fillText("Press SPACE to continue", boardWidth/2, boardHeight - 50);
    
    context.textAlign = "left";
}

function handleKeyPress(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Resume from pause
        if (isPaused) {
            isPaused = false;
            blurAmount = 0;
            lastPauseCheck = Date.now();
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
            return;
        }
        
        // Jump during gameplay
        if (!gameOver && !isPaused) {
            velocityY = -8; //increased for larger bird
        }
        
        // Reset game from game over screen
        if (gameOver) {
            bird.y = birdY;
            bird.x = birdX;
            velocityY = 0; // Reset velocity to prevent immediate fall
            pipeArray = [];
            elapsedTime = 0;
            gameStartTime = Date.now();
            lastTimeUpdate = Date.now();
            lastPauseCheck = Date.now();
            currentTimeIncrementIndex = 0;
            gameOver = false;
            isPaused = false;
            showBirthMessage = true;
            birthMessageTime = Date.now();
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