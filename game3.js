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

// Update function
function update() {
    // Move the player based on keyboard input
    if (keys[37] || keys[65]) { // Left arrow key or 'A' key
        jugador.x -= playerSpeed;
    }
    if (keys[39] || keys[68]) { // Right arrow key or 'D' key
        jugador.x += playerSpeed;
    }

    // Jumping logic
    if (isJumping) {
        // Apply jump force
        jugador.y += jugador.jumpVelocity;
        jugador.jumpVelocity += gravity;

        // Check if the player has reached the ground
        if (jugador.y >= 550) { // Adjust this value based on the ground level
            jugador.y = 550; // Set the player back to the ground level
            isJumping = false; // Reset the jump flag
        }
    }
}

// Add the update function to the application's ticker
app.ticker.add(update);

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

// Example elements
const element1 = createElement(100, 500, 0x00FF00, 80, 50);
const element2 = createElement(300, 450, 0xFF0000, 100, 50);

// Add elements to the elements array
elements.push(element1);
elements.push(element2);

// Collision detection function
function checkCollision(spriteA, spriteB) {
    const ab = spriteA.getBounds();
    const bb = spriteB.getBounds();

    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width &&
        ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// Main loop for collision detection
app.ticker.add(() => {
    // Check collision with each element
    for (const element of elements) {
        if (element.collision && checkCollision(jugador, element)) {
            // Stop the player from falling and set the player's position to the top of the element
            jugador.y = element.y - jugador.height;
            isJumping = false;
            jugador.jumpVelocity = 0;
        }
    }
});
