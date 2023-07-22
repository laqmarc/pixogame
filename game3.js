// Create the PIXI application
const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0xCCCCCC, // Set background color to light gray
});
document.body.appendChild(app.view);

// Load the player texture and animation frames
const jugadorTexture = PIXI.Texture.from("/img/AssetPack-V1/Sprite Sheets/Character Idle 48x48.png");
const frameWidth = 48;
const frameHeight = 48;
const jugadorFrames = [];
for (let i = 0; i < jugadorTexture.width / frameWidth; i++) {
    const frameTexture = new PIXI.Texture(jugadorTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight));
    jugadorFrames.push(frameTexture);
}

// Create the player animated sprite
const jugador = new PIXI.AnimatedSprite(jugadorFrames);
jugador.position.set(200, 550); // Set the initial position of the player
jugador.animationSpeed = 0.1;
jugador.play();

// Add the player to the stage
app.stage.addChild(jugador);

// Define player's movement speed
const playerSpeed = 4;

// Define player's jump parameters
const jumpStrength = 10; // Jump force
let isJumping = false; // Flag to track if the player is jumping
const gravity = 0.5; // Gravity force

// timer
let isTimerRunning = false; // Flag to track if the timer is running
let startTime = 0; // Variable to store the starting time
let timerText; // PIXI.Text object to display the timer

// Keyboard events
const keys = {};
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

function onKeyDown(event) {
    keys[event.keyCode] = true;
    // Spacebar key
    if (event.keyCode === 32 && !isJumping) {
        isJumping = true;
        jugador.jumpVelocity = -jumpStrength; // Set the initial jump velocity
    }
}

function onKeyUp(event) {
    keys[event.keyCode] = false;
}

// Function to get the color of a pixel at a given position (x, y) in the canvas
function getPixelColor(x, y) {
    const context = app.view.getContext("2d");
    const pixel = context.getImageData(x, y, 1, 1);
    const data = pixel.data;
    const color = (data[0] << 16) | (data[1] << 8) | data[2];
    return color;
}


// Function to check if the player has won
function checkWinCondition() {
    // Define the X and Y coordinates for winning
    const winX = 196;
    const winY = 2;

    // Check if the player's position is within a range of the winning coordinates
    if (
        jugador.x >= winX - 5 && // Adjust the range as needed
        jugador.x <= winX + 5 &&
        jugador.y >= winY - 5 && // Adjust the range as needed
        jugador.y <= winY + 5
    ) {
        // Start the timer if it's not already running
        if (!isTimerRunning) {
            isTimerRunning = true;
            startTime = Date.now(); // Store the current timestamp as the starting time
        }
        // Create a "Has guanyat" text
        const winText = new PIXI.Text("Has guanyat!", {
            fontSize: 48,
            fill: 0xffffff, // White color
            fontWeight: 'bold',
            align: 'center',
        });
        winText.anchor.set(0.5);
        winText.x = app.screen.width / 2;
        winText.y = app.screen.height / 2;

        // Add the "You Win" text to the stage
        app.stage.addChild(winText);

        // Stop the game ticker to freeze the game
        app.ticker.stop();
    }
}



function initTimerText() {
    timerText = new PIXI.Text("Temps: 0 segons", {
        fontSize: 24,
        fill: 0xffffff,
        fontWeight: 'bold',
    });
    timerText.x = 600;
    timerText.y = 20;
    app.stage.addChild(timerText);

    // Start the timer by setting the flag to true and updating the start time
    isTimerRunning = true;
    startTime = Date.now();
}
 


function updateTimerText() {
    if (isTimerRunning) {
        const currentTime = Date.now();
        const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000); // Corrected calculation
        timerText.text = `Temps: ${elapsedTimeInSeconds} segons`;
    }
}


// Update function
function update() {
    // Move the player based on keyboard input
    if (keys[37] || keys[65]) { // Left arrow key or 'A' key
        jugador.x -= playerSpeed;
    }
    if (keys[39] || keys[68]) { // Right arrow key or 'D' key
        jugador.x += playerSpeed;
    }

    // console.log(jugador.x + " " + jugador.y)
    // Jumping logic
    if (isJumping) {
        // Apply jump force
        jugador.y += jugador.jumpVelocity;
        jugador.jumpVelocity += gravity;

        // Check if the player has reached the ground
        if (jugador.y >= 550) { // Adjust this value based on the ground level
            jugador.y = 550; // Set the player back to the ground level
            isJumping = false; // Reset the jump flag
            jugador.jumpVelocity = 0; // Reset the jump velocity
        }
    } else {
        // Apply gravity when the player is not jumping
        jugador.y += gravity;

        // Check if the player has reached the ground
        if (jugador.y >= 550) { // Adjust this value based on the ground level
            jugador.y = 550; // Set the player back to the ground level
        }
    }

    // Check if the player is above any element
    let isAboveElement = false;
    for (const element of elements) {
        if (element.collision && checkCollision(jugador, element)) {
            isAboveElement = true;
            // Check if the player is below the element
            if (jugador.y + jugador.height <= element.y + 2) {
                jugador.y = element.y - jugador.height; // Prevent the player from moving upwards into the element
            }
            break;
        }
    }

    // Apply gravity when the player is not jumping and not above any element
    if (!isJumping && !isAboveElement) {
        isFalling = true;
        jugador.y += gravity * 2; // Multiply gravity by 2 to make the player fall faster
    }

    // Check if the player has reached the ground or is above an element
    if (jugador.y >= 600) { // Adjust this value based on the ground level
        jugador.y = 600; // Set the player back to the ground level
        isJumping = false; // Reset the jump flag
        jugador.jumpVelocity = 0; // Reset the jump velocity
        isFalling = false; // Reset the falling flag when reaching the ground
    }

    // Reset the falling flag when the player is above an element
    if (isAboveElement) {
        isFalling = false;
    }

    // Adjust the gravity when falling outside an element
    if (isFalling) {
        jugador.y += gravity * 5;
    }


    // New collision detection logic
    let isCollidingTop = false;
    let isCollidingBottom = false;
    let isCollidingLeft = false;
    let isCollidingRight = false;
    let collidingElement = null; // Variable to store the colliding element

    for (const element of elements) {
        if (element.collision && checkCollision(jugador, element)) {
            const ab = jugador.getBounds();
            const bb = element.getBounds();

            // Check collision from the top
            if (ab.y + ab.height >= bb.y && ab.y + ab.height - jugador.jumpVelocity <= bb.y) {
                isCollidingTop = true;
            }

            // Check collision from the bottom
            if (ab.y <= bb.y + bb.height && ab.y - jugador.jumpVelocity >= bb.y + bb.height) {
                isCollidingBottom = true;
            }

            // Check collision from the left
            if (ab.x + ab.width >= bb.x && ab.x + ab.width - jugador.jumpVelocity <= bb.x) {
                isCollidingLeft = true;
            }

            // Check collision from the right
            if (ab.x <= bb.x + bb.width && ab.x - jugador.jumpVelocity >= bb.x + bb.width) {
                isCollidingRight = true;
            }

            // Update the colliding element
            collidingElement = element;
        }
    }

    // Handle collisions
    if (isCollidingTop) {
        jugador.y = collidingElement.y - jugador.height; // Use collidingElement instead of element
        isJumping = false;
        jugador.jumpVelocity = 0;
    }

    if (isCollidingBottom) {
        jugador.y = collidingElement.y + collidingElement.height; // Use collidingElement instead of element
        isJumping = false;
        jugador.jumpVelocity = 0;
    }

    if (isCollidingLeft) {
        jugador.x = collidingElement.x - jugador.width; // Use collidingElement instead of element
    }

    if (isCollidingRight) {
        jugador.x = collidingElement.x + collidingElement.width; // Use collidingElement instead of element
    }
    // Additional code for preventing wrapping around to the top
    const stageWidth = app.screen.width;
    const playerWidth = jugador.width;

    // Check if the player is at the left edge of the screen
    if (jugador.x <= 0) {
        jugador.x = 0;
    }

    // Check if the player is at the right edge of the screen
    if (jugador.x >= stageWidth - playerWidth) {
        jugador.x = stageWidth - playerWidth;
    }

    // Check if the player is colliding with an element on the right side
    if (isCollidingRight && collidingElement) {
        jugador.x = collidingElement.x + collidingElement.width;
    }



    // Call the updateTimerText function
    updateTimerText();

    // Check collision with each element and handle collisions
    for (const element of elements) {
        if (element.collision && checkCollision(jugador, element)) {
            // Stop the player from falling and set the player's position to the top of the element
            jugador.y = element.y - jugador.height;
            isJumping = false;
            jugador.jumpVelocity = 0;
        }
    }

    // Call the checkWinCondition function
    checkWinCondition();
}

// Call initTimerText to add the timer text to the stage
initTimerText();

// Add the update function and updateTimerText function to the application's ticker
app.ticker.add(() => {
    update();
    updateTimerText(); // Move the updateTimerText function call here to update the timer continuously
});

// Create elements array to store platforms
const elements = [];

function createElement(x, y, color, width, height) {
    const element = new PIXI.Graphics();
    element.beginFill(color);
    element.drawRect(0, 0, width, height);
    element.endFill();
    element.position.set(x, y);
    app.stage.addChild(element);

    // Set collision property to true for solid elements
    element.collision = true;

    return element;
}

// Create elements array to store platforms


// Platform data objects with position and size information
const platformData = [{
        x: 100,
        y: 500,
        color: 0x00FF00,
        width: 80,
        height: 50
    },
    {
        x: 300,
        y: 450,
        color: 0xFF0000,
        width: 100,
        height: 50
    },
    {
        x: 400,
        y: 330,
        color: 0xFF00FF,
        width: 80,
        height: 50
    },
    {
        x: 550,
        y: 250,
        color: 0xFF0000,
        width: 150,
        height: 30
    },
    {
        x: 350,
        y: 150,
        color: 0xFF0000,
        width: 50,
        height: 30
    },
    {
        x: 150,
        y: 50,
        color: 0x000000,
        width: 80,
        height: 30
    },

    // Add more platform data objects here as needed
];

// Create platforms using a for loop
for (const data of platformData) {
    const element = createElement(data.x, data.y, data.color, data.width, data.height);
    elements.push(element);
}

// Collision detection function
function checkCollision(spriteA, spriteB) {
    const ab = spriteA.getBounds();
    const bb = spriteB.getBounds();

    const playerBottom = ab.y + ab.height;
    const playerTop = ab.y;
    const playerRight = ab.x + ab.width;
    const playerLeft = ab.x;

    const elementTop = bb.y;
    const elementBottom = bb.y + bb.height;
    const elementRight = bb.x + bb.width;
    const elementLeft = bb.x;

    const isCollidingFromTop = playerBottom > elementTop && playerTop < elementTop && playerRight > elementLeft && playerLeft < elementRight;
    const isCollidingFromBottom = playerTop < elementBottom && playerBottom > elementBottom && playerRight > elementLeft && playerLeft < elementRight;
    const isCollidingFromLeft = playerRight > elementLeft && playerLeft < elementLeft && playerBottom > elementTop && playerTop < elementBottom;
    const isCollidingFromRight = playerLeft < elementRight && playerRight > elementRight && playerBottom > elementTop && playerTop < elementBottom;

    return isCollidingFromTop || isCollidingFromBottom || isCollidingFromLeft || isCollidingFromRight;
}
