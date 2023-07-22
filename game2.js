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
console.log("Valor de initialY:", initialY);

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
            if (onGround) {
                playerVelocity.y = -jumpStrength;
                isJumping = true;
                onGround = false; // Permitir que el jugador salte solo una vez en el aire
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

function canJumpFromElement() {
    for (const element of elements) {
        if (element.canStandOn) {
            const collisionY = checkCollision(jugador, element.sprite);
            if (collisionY !== undefined && jugador.y + jugador.height <= element.sprite.y + 2) {
                return true;
            }
        }
    }
    return false;
}

function update() {
    // Lógica del salto
    if (isJumping) {
        if (jugador.y > initialY - maxJumpHeight) {
            playerVelocity.y -= gravity; // Aplicamos la fuerza de salto hacia arriba
        } else {
            isJumping = false;
        }
    }

    console.log("Valor update initialY:", initialY);


    // Aplicamos la gravedad en todo momento para que el jugador siempre caiga hacia abajo
    playerVelocity.y += gravity;

    // Update the player's position
    jugador.x += playerVelocity.x;
    jugador.y += playerVelocity.y;

    // Comprobamos si el jugador ha vuelto a tocar el suelo
    if (jugador.y >= initialY) {
        jugador.y = initialY;
        playerVelocity.y = 0;
        onGround = true;
    }

    // Comprobamos las colisiones con los elementos de las plataformas
    for (const element of elements) {
        if (element.canStandOn) {
            const collisionY = checkCollision(jugador, element.sprite);
            if (collisionY !== undefined && jugador.y + jugador.height <= element.sprite.y + 2) {
                // Stop the player from falling
                playerVelocity.y = 0;
                // Set the player's y position to the top of the element
                jugador.y = collisionY - jugador.height;
                onGround = true;
                break; // Salimos del bucle una vez que detectamos una colisión para evitar problemas de saltos múltiples
            }
        }
    }
}



function checkElementCollision(sprite, elements) {
    for (const element of elements) {
        if (element.canStandOn) {
            const collisionY = checkCollision(sprite, element.sprite);
            if (collisionY !== undefined) {
                // Stop the player from falling
                playerVelocity.y = 0;
                // Set the player's y position to the top of the element
                jugador.y = collisionY - jugador.height;
                return true;
            }
        }
    }
    return false;
}

function checkCollision(spriteA, spriteB) {
    const ab = spriteA.getBounds();
    const bb = spriteB.getBounds();

    // Calculate the actual positions of spriteA and spriteB
    const aX = spriteA.x + ab.x;
    const aY = spriteA.y + ab.y;
    const bX = spriteB.x + bb.x;
    const bY = spriteB.y + bb.y;

    // Check for collision on each axis
    const collisionX = aX + ab.width > bX && aX < bX + bb.width;
    const collisionY = aY + ab.height > bY && aY < bY + bb.height;

    // If there is a collision on both axes, return the collision point's Y position
    if (collisionX && collisionY) {
        return Math.min(aY + ab.height, bY + bb.height);
    } else {
        return undefined;
    }
}


function createElement(x, y, color, borderRadius, canStandOn, width, height) {
    const element = new PIXI.Graphics();
    element.beginFill(color);
    element.drawRoundedRect(0, 0, width, height, borderRadius);
    element.endFill();
    element.position.set(x, y);
    app.stage.addChild(element);

    return {
        x: x,
        y: y,
        sprite: element,
        canStandOn: canStandOn
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
    elements.push(createElement(200, 500, 0x00FF00, 10, true, 80, 50));
    elements.push(createElement(100, 400, 0xFF0000, 20, true, 100, 50));

    // Add the juegoLoop function to the application's ticker
    app.ticker.add(update);
}

// Load assets and start the game
PIXI.Loader.shared
    .add("jugador", "/img/AssetPack-V1/Sprite Sheets/Character Idle 48x48.png")
    .load(iniciarJuego);
 