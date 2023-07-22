// Global variables
const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.body.appendChild(app.view);
const frameWidth = 48;
const frameHeight = 48;
const playerSpeed = 4;
const friction = 0.15; // Friction factor to slow down the player
const gravity = 0.5;
let lives = 5;
const maxLives = 5; // Set the maximum number of lives
let livesText; // Variable to store the PIXI.Text object for lives counter

let arrivalPoint;
const arrivalX = 200; // Coordenada X del punto de llegada
const arrivalY = 500; // Coordenada Y del punto de llegada
let victoryScreen;

// Player velocity
let playerVelocity = {
    x: 0,
    y: 0
};
let onGround = false;
let groundY = app.screen.height + 50;
let jugador; // Define jugador as a global variable
let elements = []; // Initialize the array to store elements

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
        case 38: // Spacebar key
            if (onGround) {
                playerVelocity.y = -10; // Jump strength
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
    }
}

// Collision detection function
function checkCollision(spriteA, element) {
    const ab = spriteA.getBounds();
    const bb = element.getBounds();

    // Calculate the actual positions of spriteA and element
    const aX = spriteA.x + ab.x;
    const aY = spriteA.y + ab.y;
    const bX = element.x + bb.x;
    const bY = element.y + bb.y;

    // Check for collision
    const collision = (
        aX + ab.width > bX &&
        aX < bX + bb.width &&
        aY + ab.height > bY &&
        aY + ab.height < bY + bb.height
    );

    // If there is a collision, return the y property of spriteA
    if (collision) {
        return spriteA.y;
    } else {
        return undefined;
    }
}
function checkElementCollision(sprite, elements) {
    for (const element of elements) {
        const collisionY = checkCollision(sprite, element);
        if (collisionY !== undefined) {
            // Stop the player from falling
            sprite.velocity.y = 0;
            // Set the player's y position to the top of the element
            sprite.y = collisionY - sprite.height;
            return collisionY;
        }
    }

    return undefined;
}

function update() {
    // Check for collisions with elements
    const collisionY = checkElementCollision(player, elements);
    if (collisionY !== undefined) {
        // Stop the player from falling
        player.velocity.y = 0;
    }

    // Update the player's position
    player.x += player.velocity.x;
    player.y += player.velocity.y;
}

// Añadimos variables para rastrear el estado del movimiento y la dirección anterior
let isMoving = false;
let prevPlayerDirection = 0;
let isFirstDirectionChange = true;

function juegoLoop(delta) {
    // Update player position based on velocity
    jugador.x += playerVelocity.x;
    jugador.y += playerVelocity.y;

    // Apply gravity to the player (only if not on top of an element)
    if (!onGround) {
        playerVelocity.y += gravity;
    }

    // Check if the player is on an element that can be stood on
    let isOnElement = false;
    for (const element of elements) {
        if (
            element.canStandOn &&
            checkCollision(jugador, element.sprite, jugador.height) && // Adjust the offsetY to account for the player's feet
            jugador.y + jugador.height <= element.bounds.y + 2 // Adjust the margin to 2 pixels
        ) {
            // Update player position to be just on top of the element
            jugador.y = element.bounds.y - jugador.height;
            playerVelocity.y = 0; // Reset vertical velocity when on top of an element
            onGround = true;
            isOnElement = true;
            break;
        }
    }

    // If not on an element, set groundY based on the canvas bottom
    if (!isOnElement) {
        groundY = app.screen.height;
    }

    // Apply friction to slow down the player's horizontal movement when no arrow keys are pressed
    if (!playerVelocity.x && onGround) {
        playerVelocity.x *= 1 - friction;
        // If the velocity becomes very small, set it to zero to prevent tiny movements
        if (Math.abs(playerVelocity.x) < 0.1) {
            playerVelocity.x = 0;
        }
    }

    // Check player's movement direction and update sprite scale accordingly
    if (playerVelocity.x > 0) {
        jugador.scale.x = 1; // Mirando hacia la derecha
    } else if (playerVelocity.x < 0) {
        jugador.scale.x = -1; // Mirando hacia la izquierda
    }

    // Prevenimos que el jugador salga por los bordes izquierdo y derecho del canvas
    const canvasLeftEdge = 0;
    const canvasRightEdge = app.screen.width - jugador.width;
    if (jugador.x < canvasLeftEdge) {
        jugador.x = canvasLeftEdge;
    } else if (jugador.x > canvasRightEdge) {
        jugador.x = canvasRightEdge;
    }

    // Prevenimos que el jugador salga por debajo del borde inferior del canvas (groundY)
    if (jugador.y + jugador.height > groundY) {
        jugador.y = groundY - jugador.height;
        playerVelocity.y = 0;
        onGround = true;
    }

    // Check if the player falls below the bottom of the canvas (y = 550)
    if (jugador.y + jugador.height === 600) {
        // Player touches the bottom, lose a life
        loseLife();
    }

    // Aplicamos un pequeño movimiento hacia atrás cuando cambie la dirección
    if (playerVelocity.x !== 0 && Math.sign(playerVelocity.x) !== prevPlayerDirection) {
        if (isFirstDirectionChange) {
            jugador.x -= 10 * prevPlayerDirection; // Reducimos el movimiento hacia atrás a 10px
            isFirstDirectionChange = false;
        }
        isMoving = true;
    } else if (playerVelocity.x === 0) {
        isFirstDirectionChange = true;
        isMoving = false;
    }

    if (checkCollision(jugador, arrivalPoint)) {
        handleVictory(); // El jugador ha ganado, mostrar la pantalla de victoria
    }
}

function loseLife() {
    lives--;
    updateLivesText(); // Update the displayed lives count

    if (lives <= 0) {
        // Game over logic
        handleGameOver();
    } else {
        // Reset player position and other necessary adjustments after losing a life
        jugador.x = 0;
        jugador.y = 500;
        playerVelocity.x = 0;
        playerVelocity.y = 0;
        onGround = false;
        groundY = app.screen.height;
    }
}



function handleGameOver() {
    // Perform actions when the game is over, such as showing a "Game Over" message or resetting the game.
    // For example, you can add a "Game Over" text to the stage.

    const gameOverText = new PIXI.Text('Has perdut', {
        fill: 'red',
        fontSize: 48,
        fontWeight: 'bold',
        align: 'center'
    });
    gameOverText.anchor.set(0.5);
    gameOverText.x = app.screen.width / 2;
    gameOverText.y = app.screen.height / 2;
    app.stage.addChild(gameOverText);

    // Optionally, you can reload the game after a few seconds or perform other actions.
    // For example, to restart the game after 3 seconds, you can use setTimeout:

    setTimeout(() => {
        app.stage.removeChild(gameOverText);
        lives = maxLives; // Reset lives to the maximum value
        iniciarJuego(); // Restart the game
    }, 3000);

    // Optionally, you can remove the livesText here or reset it to its original position.
    app.stage.removeChild(livesText);
}

function handleVictory() {
    // Mostrar la pantalla de victoria
    victoryScreen = new PIXI.Container();

    const victoryMessage = new PIXI.Text('¡Has ganado!', {
        fill: 'green',
        fontSize: 48,
        fontWeight: 'bold',
        align: 'center'
    });
    victoryMessage.anchor.set(0.5);
    victoryMessage.x = app.screen.width / 2;
    victoryMessage.y = app.screen.height / 2;
    victoryScreen.addChild(victoryMessage);

    const playAgainButton = new PIXI.Text('Volver a jugar', {
        fill: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    });

    playAgainButton.anchor.set(0.5);
    playAgainButton.x = app.screen.width / 2;
    playAgainButton.y = app.screen.height / 2 + 50;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on('pointerdown', () => {
        app.stage.removeChild(victoryScreen);
        lives = maxLives; // Resetear las vidas al valor máximo
        iniciarJuego(); // Reiniciar el juego
    });

    victoryScreen.addChild(playAgainButton);

    app.stage.addChild(victoryScreen);
}

function updateLivesText() {
    livesText.text = `Vides: ${lives}`;
}

function createElement(config) {
    const element = new PIXI.Graphics();
    element.beginFill(config.color);
    element.drawRoundedRect(0, 0, config.width, config.height, config.borderRadius);
    element.endFill();
    element.position.set(config.x, config.y);
    app.stage.addChild(element);

    const bounds = element.getBounds(); // Get the bounds of the element
    return {
        x: config.x,
        y: config.y,
        sprite: element, // Store the PIXI.Graphics object as the sprite property
        bounds: bounds, // Store the bounds of the element
        canStandOn: config.canStandOn // Indicates if the player can stand on this element
    };
}

function iniciarJuego() {
    // Load the player texture and animation frames
    const jugadorTexture = PIXI.Loader.shared.resources["jugador"].texture;
    const jugadorFrames = [];

    for (let i = 0; i < jugadorTexture.width / frameWidth; i++) {
        const frameTexture = new PIXI.Texture(jugadorTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight));
        jugadorFrames.push(frameTexture);
    }

    // Create the player animated sprite
    jugador = new PIXI.AnimatedSprite(jugadorFrames);
    jugador.position.set(0, app.screen.height + 200); // Adjust the y coordinate to 100 pixels less
    app.stage.addChild(jugador);

    jugador.animationSpeed = 0.1;
    jugador.play();

    // Add the juegoLoop function to the application's ticker
    app.ticker.add(juegoLoop);

    // Create and add the lives counter text
    livesText = new PIXI.Text(`Lives: ${lives}`, {
        fill: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    });

    livesText.anchor.set(1, 0); // Anchor point at the top-right corner
    livesText.position.set(app.screen.width - 10, 10); // Position at the top-right corner with a small margin
    app.stage.addChild(livesText);

    // Crear el punto de llegada (el punto verde) con el color tipo "neón"
    const neonColorTexture = createNeonGradientTexture(20, 20); // Tamaño del rectángulo de 50x50 píxeles
    arrivalPoint = new PIXI.Sprite(neonColorTexture);
    arrivalPoint.position.set(20, 20); // Posición del punto verde (ajusta las coordenadas según sea necesario)
    app.stage.addChild(arrivalPoint);

    // Example of creating multiple elements with rounded corners
    let groundY = app.screen.height; // Set the groundY value to the level of the ground (y = 600)

    const elementConfigs = [{
            x: 0,
            y: 550, // Adjust the y value so the element is above the ground
            color: 0x00FF00, // Green color
            width: 80,
            height: 50,
            borderRadius: 10,
            canStandOn: true
        },
        {
            x: 100,
            y: 500, // Adjust the y value so the element is above the ground
            color: 0x00FF00, // Green color
            width: 800,
            height: 50,
            borderRadius: 10,
            canStandOn: true
        },
        // Add more configuration objects as needed
    ];



    // Create and add the elements with rounded corners
    for (const config of elementConfigs) {
        elements.push(createElement(config));
    }
}

function createNeonGradientTexture(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Crear el gradiente
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "lime"); // Verde neón en el inicio del gradiente
    gradient.addColorStop(1, "yellow"); // Amarillo neón en el final del gradiente

    // Rellenar el gradiente en el lienzo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Crear una textura PIXI desde el lienzo y devolverla
    return PIXI.Texture.from(canvas);
}

// Load assets and start the game
PIXI.Loader.shared
    .add("jugador", "/img/AssetPack-V1/Sprite Sheets/Character Idle 48x48.png")
    .load(iniciarJuego);