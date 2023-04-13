//Canvas Setup
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')  //canvas context

canvas.width = innerWidth
canvas.height = innerHeight

const scoreElement = document.querySelector('#scoreElement')
const modalElement = document.querySelector('#modalElement')
const modalScoreElement = document.querySelector('#modalScoreElement')
const buttonElement = document.querySelector('#buttonElement')
const startButtomElement = document.querySelector('#startButtonElement')
const startModalElement = document.querySelector('#startModalElement')
const volumeUpElement = document.querySelector('#volumeUpElement')
const volumeDownElement = document.querySelector('#volumeDownElement')


// Moving player to center, responsive

let player


let projectiles = []  //Array to hold all projectiles
let enemies = []  //Array for enemies
let particles = []  //Array for particles
let score = 0  //Score counter
let intervalId
let spawnPowerUpsId
let animationId  //Declared to be able to stop the game
let powerUps = []
let backgroundParticles = []
let game = false



function init() {
    const x = canvas.width / 2
    const y = canvas.height / 2
    player = new Player(x, y, 10, 'white')
    enemies = []
    projectiles = []
    particles = []
    powerUps = []
    animationId
    spawnPowerUpsId
    score = 0
    scoreElement.innerHTML = 0
    backgroundParticles = []
    game = true

    const spacing = 40

    for(let x = 0; x < canvas.width; x += spacing) {
        for(let y = 0; y < canvas.height; y += spacing) {
            backgroundParticles.push(new BackgroundParticle({
                position: {
                    x,
                    y
                },
                radius: 5
            }))
        }
    }
}

function spawnEnemies() {
    intervalId = setInterval(() => {
        const radius = ( Math.random() * (30 - 7) ) + 7 // prevents radius to be too small

        let x 
        let y 
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
       
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(
            canvas.height/2 - y, 
            canvas.width/2 - x
        )
    
        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 2000)
}

function spawnPowerUps() {
    spawnPowerUpsId = setInterval(() => {
        powerUps.push(new PowerUp({
            position: {
                x: -3,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 4,
                y: 0
            }
        }))
    }, 10000)
}

function createScoreLabel({position, score}) {
    const scoreLabel = document.createElement('label')
    scoreLabel.innerHTML = score
    scoreLabel.style.color = 'white'
    scoreLabel.style.position = 'absolute'
    scoreLabel.style.left = position.x + 'px'
    scoreLabel.style.top = position.y + 'px'
    scoreLabel.style.userSelect = 'none'
    document.body.appendChild(scoreLabel)

    gsap.to(scoreLabel, {
        opacity: 0,
        y: -30,
        duration: 0.75,
        onComplete: () => {
            scoreLabel.parentNode.removeChild(scoreLabel)
        }
    })
}


function animate () {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    backgroundParticles.forEach(backgroundParticle => {
        backgroundParticle.draw()

        const dist = Math.hypot(
            player.x - backgroundParticle.position.x, 
            player.y - backgroundParticle.position.y
        )
        if(dist < 150) {
            backgroundParticle.alpha = 0

            if(dist > 130) {
                backgroundParticle.alpha = 0.5
            }
        } else if (dist > 150 && backgroundParticle.alpha < 0.1) {
            backgroundParticle.alpha += 0.01
        } else if (dist > 150 && backgroundParticle.alpha > 0.1) {
            backgroundParticle.alpha -= 0.01
        }
    })

    updatePlayerVelocity()
    player.update() //drawing the player after every clear

    for (let i = powerUps.length -1; i >= 0; i--) {
        const powerUp = powerUps[i]
        if(powerUp.position.x > canvas.width) {
            powerUps.splice(i, 1)
        } else {
            powerUp.update()
        }
        
        const dist = Math.hypot(player.x - powerUp.position.x, player.y - powerUp.position.y)

        if(dist < (powerUp.image.height / 2 ) + player.radius) {
            powerUps.splice(i, 1)
            player.powerUp = 'MachineGun'
            audio.powerUpNoise.play()

            setTimeout(() => {
                player.color = 'white'
                player.bulletColor = 'white'
                shootingDelay = 180
                player.powerUp = null
            }, 6000)
        }
    }

    if(player.powerUp === 'MachineGun') {
        shootingDelay = 60
        player.bulletColor = 'yellow'
        player.color = 'yellow'
    }
    

    for(let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index]
        if(particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    }
    // removing projectiles that go off screen

    for(let index = projectiles.length - 1; index >= 0; index--) {
        const projectile = projectiles[index]
        projectile.update()

        //All screen paramenters
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y - projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) 
        {
            projectiles.splice(index, 1)
        }
    }

    for(let index = enemies.length - 1; index >= 0; index--) {
        const enemy = enemies[index]

        enemy.update()
        //ENERY HITTING PLAYER
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        //ENDING THE GAME   
        if(dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            clearInterval(intervalId)
            clearInterval(spawnPowerUpsId)

            audio.death.play()
            game = false
            modalElement.style.display = 'block'
            gsap.fromTo('#modalElement', {scale: 0.8, opacity: 0}, {
                scale: 1,
                opacity: 1,
                ease: 'expo'
            })
            
            modalScoreElement.innerHTML = score
        }
        //PROJECTILE HITTING ENEMY
        for(let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            projectile = projectiles[projectileIndex]

            //Calculate distance between projectile and enemy
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            //If projectile and enemy touch do: Explosions, Change Score, Remove enemy/Reduce Health, Remove projectile
            if(dist - enemy.radius - projectile.radius < 1) {
                //Creating Explosions 
                for(let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6), 
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }
                    ))
                }
                
                //Reduce enemy health/making enemy smaller
                if(enemy.radius - 10 > 10) {
                    audio.damage.play()
                    score += 10
                    scoreElement.innerHTML = score
                    gsap.to(enemy, {     //animating the shrink effect
                        radius: enemy.radius - 10
                    })
                    createScoreLabel({position: {
                        x: projectile.x,
                        y: projectile.y
                        }, score: 10
                    })
                    projectiles.splice(projectileIndex, 1)
    
                } else {     //removing enemy once too small
                    audio.explode.play()
                    score += 15
                    scoreElement.innerHTML = score
                    createScoreLabel({position: {
                        x: projectile.x,
                        y: projectile.y
                        }, score: 15
                    })

                    backgroundParticles.forEach(backgroundParticle=> {
                        gsap.set(backgroundParticle, {
                            color: 'white',
                            alpha: 1
                        })
                        gsap.to(backgroundParticle, {
                            color: enemy.color,
                            alpha: 0.1
                        })
                        // backgroundParticle.color = enemy.color
                    })

                    enemies.splice(index, 1) 
                    projectiles.splice(projectileIndex, 1)
                }
            }
        }
    }         
}


//Shooting projectiles
// addEventListener('click', (event) => {
//     const angle = Math.atan2(
//         event.clientY - player.y, 
//         event.clientX - player.x
//     )

//     const velocity = {
//         x: Math.cos(angle) * 5,
//         y: Math.sin(angle) * 5
//     }

//     projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity))
// })

let isShooting = false;
let isShootingTimeout = null;
let shootingDelay = 180; // milliseconds

addEventListener('mousedown', (event) => {
    isShooting = true;
    shootProjectile(event);
})

addEventListener('mousemove', (event) => {
    if (isShootingTimeout === null && isShooting) {
        // If the function is not currently being executed, set a timeout to execute it
        isShootingTimeout = setTimeout(() => {  //throttling
            shootProjectile(event);
            isShootingTimeout = null;
        }, shootingDelay);
    }
})

addEventListener('mouseup', (event) => {
    isShooting = false;
    // Clear the timeout if there is one
    clearTimeout(isShootingTimeout);
    isShootingTimeout = null;
})



function shootProjectile(event) {
    if(game){   //Preventing shooting from start menu
        const angle = Math.atan2(
            event.clientY - player.y,
            event.clientX - player.x
        )

        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }

        projectiles.push(new Projectile(player.x, player.y, 5, player.bulletColor, velocity))
        audio.shoot.play()
    }
}



buttonElement.addEventListener('click', () => {

    buttonElement.disabled = true; //Disable the button once pressed

    audio.select.play()
    init() //Restart the game
    animate()
    spawnEnemies()
    spawnPowerUps()
    gsap.to('#modalElement', {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
            modalElement.style.display = "none"
            buttonElement.disabled = false; 
            //Enable the button once transition completes
        }
    })
})



startButtonElement.addEventListener('click', () => {
    // Disable the start button once pressed
    startButtonElement.disabled = true;

    if (!audio.background.playing()) {
        audio.background.play();
    }
    
    audio.select.play();
    init(); //Start the game
    animate();
    spawnEnemies();
    spawnPowerUps();
    
    gsap.to('#startModalElement', {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
            startModalElement.style.display = "none";
            // Enable the start button once transition completes
            startButtonElement.disabled = false;
        }
    });
});

//MUTING BUTTON
volumeUpElement.addEventListener('click', () => {
    audio.background.pause()
    volumeDownElement.style.display = 'block'
    volumeUpElement.style.display = 'none'

    for (let key in audio) {
        audio[key].mute(true)
    }
})

//UNMUTING BUTTON
volumeDownElement.addEventListener('click', () => {
    audio.background.play()
    volumeDownElement.style.display = 'none'
    volumeUpElement.style.display = 'block'

    for (let key in audio) {
        audio[key].mute(false)
    }
})

const keysPressed = {};

window.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});

function updatePlayerVelocity() {

    const SPEED = 0.1;
     // handle diagonal movement
     if (keysPressed['w'] && keysPressed['a']) {
        player.velocity.x -= SPEED - 0.05;
        player.velocity.y -= SPEED - 0.05;
    }

    if (keysPressed['w'] && keysPressed['d']) {
        player.velocity.x += SPEED - 0.05;
        player.velocity.y -= SPEED - 0.05;
    }

    if (keysPressed['s'] && keysPressed['a']) {
        player.velocity.x -= SPEED - 0.05;
        player.velocity.y += SPEED - 0.05;
    }

    if (keysPressed['s'] && keysPressed['d']) {
        player.velocity.x += SPEED - 0.05;
        player.velocity.y += SPEED - 0.05;
    }

    if (keysPressed['w']) {
        player.velocity.y -= SPEED;

    }

    if (keysPressed['s']) {
        player.velocity.y += SPEED;
    }

    if (keysPressed['a']) {
        player.velocity.x -= SPEED;
    }

    if (keysPressed['d']) {
        player.velocity.x += SPEED;
    }
}


window.addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})

document.addEventListener('visibilitychange', () => {
    if(document.hidden) {
        clearInterval(intervalId)
        clearInterval(spawnPowerUpsId)
    } else {
        spawnEnemies()
        spawnPowerUps()
    }
})
