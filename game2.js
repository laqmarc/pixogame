const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.body.appendChild(app.view);
const playerSpeed = 4;

let jugador; // Define jugador as a global variable
let playerVelocity = {
    x: 0,
    y: 0
};

let onGround = false;
const jumpStrength = 10; // Fuerza del salto
const maxJumpHeight = 100; // Altura máxima del salto
let isJumping = false; // Bandera para controlar el salto
const gravity = 0.5; // Aceleración hacia abajo durante el salto
const initialY = 500; // Posición inicial en Y del jugador

let elements = []; // Array para almacenar los elementos de las plataformas

// Keyboard events
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // Left arrow key
            playerVelocity.x = -playerSpeed;
            break;
        case 39: // Right arrow key
            playerVelocity.x = playerSpeed;
            break;
        case 32: // Spacebar key
            if (onGround && !isJumping) { // Start the jump only when on the ground and not already jumping
                playerVelocity.y = -jumpStrength;
                isJumping = true;
                onGround = false;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.keyCode) {
        case 37:
        case 39:
            playerVelocity.x = 0;
            break;
        case 32: // Spacebar key
            isJumping = false;
            break;
    }
}

function update() {
    // Update the player's position for left/right movement
    jugador.x += playerVelocity.x;

    // Check if the player is jumping
    if (isJumping) {
        if (playerVelocity.y > -jumpStrength) {
            playerVelocity.y -= gravity; // Apply jump strength
        } else {
            isJumping = false; // Stop jumping once the maximum jump height is reached
        }
    }

    // Apply gravity when the player is not jumping and not on the ground
    if (!isJumping && !onGround) {
        playerVelocity.y += gravity;
    }

    // Update the player's position in the Y axis
    jugador.y += playerVelocity.y;

    // Check if the player has touched the ground
    if (jugador.y >= initialY) {
        jugador.y = initialY;
        playerVelocity.y = 0;
        onGround = true;
    }

    // Check collisions with the elements of the platforms
    let collided = false;
    for (const element of elements) {
        const collisionY = checkCollision(jugador, element.sprite);
        if (collisionY !== undefined && jugador.y + jugador.height <= element.sprite.y + 2) {
            // Stop the player from falling
            playerVelocity.y = 0;
            // Set the player's y position to the top of the element
            jugador.y = collisionY - jugador.height;
            onGround = true;
            collided = true;
            break;
        }
    }

    // If there was no collision with any element, the player is not on the ground
    if (!collided) {
        onGround = false;
    }
}


function checkCollision(spriteA, spriteB) {
    const ab = spriteA.getBounds();
    const bb = spriteB.getBounds();

    const aX = spriteA.x + ab.x;
    const aY = spriteA.y + ab.y;
    const bX = spriteB.x + bb.x;
    const bY = spriteB.y + bb.y;

    // Check for collision on each axis
    const collisionX = aX + ab.width > bX && aX < bX + bb.width;
    const collisionY = aY + ab.height > bY && aY < bY + bb.height;

    // Check if the player is falling and there is a collision on the Y axis
    if (playerVelocity.y > 0 && collisionY) {
        return Math.min(aY + ab.height, bY + bb.height);
    } else {
        return undefined;
    }
}

function createElement(x, y, color, borderRadius, width, height) {
    const element = new PIXI.Graphics();
    element.beginFill(color);
    element.drawRoundedRect(0, 0, width, height, borderRadius);
    element.endFill();
    element.position.set(x, y);
    app.stage.addChild(element);

    return {
        x: x,
        y: y,
        sprite: element
    };
}

function iniciarJuego() {
    // Load the player texture and animation frames
    const jugadorTexture = PIXI.Loader.shared.resources["jugador"].texture;
    const frameWidth = 48;
    const frameHeight = 48;
    const jugadorFrames = [];

    for (let i = 0; i < jugadorTexture.width / frameWidth; i++) {
        const frameTexture = new PIXI.Texture(jugadorTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight));
        jugadorFrames.push(frameTexture);
    }

    // Create the player animated sprite
    jugador = new PIXI.AnimatedSprite(jugadorFrames);
    jugador.position.set(0, initialY); // Set the initial position of the player
    jugador.animationSpeed = 0.1;
    jugador.play();

    app.stage.addChild(jugador);

    // Create elements for the platforms (example elements)
    elements.push(createElement(200, 500, 0x00FF00, 10, 80, 50));
    elements.push(createElement(100, 400, 0xFF0000, 20, 100, 50));

    // Add the update function to the application's ticker
    app.ticker.add(update);

    // Add the keyboard event listeners after the update function is added to the ticker
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
}

// Load assets and start the game
PIXI.Loader.shared 
    .add("jugador", "/img/AssetPack-V1/Sprite Sheets/Character Idle 48x48.png")
    .load(iniciarJuego);
