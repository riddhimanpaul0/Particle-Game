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

class Player {
    constructor (x, y, radius, color) {
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()

        const friction = 0.98

        this.velocity.x *= friction
        this.velocity.y *= friction

        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}


class Projectile {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.95
class Particle {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.02
    }
}

// Moving player to center, responsive
const x = canvas.width / 2
const y = canvas.height / 2
let player = new Player(x, y, 10, 'white')


let projectiles = []  //Array to hold all projectiles
let enemies = []  //Array for enemies
let particles = []  //Array for particles
let score = 0  //Score counter
let intervalId
let animationId  //Declared to be able to stop the game


function init() {
    player = new Player(x, y, 10, 'white')
    enemies = []
    projectiles = []
    particles = []
    animationId
    score = 0
    scoreElement.innerHTML = 0
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
    }, 1500)
}



function animate () {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update() //drawing the player after every clear

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
                if(enemy.radius -10 > 10) {
                    score += 10
                    scoreElement.innerHTML = score
                    gsap.to(enemy, {     //animating the shrink effect
                        radius: enemy.radius - 10
                    })
                
                    projectiles.splice(projectileIndex, 1)
    
                } else {     //removing enemy once too small
                    score += 15
                    scoreElement.innerHTML = score

                    enemies.splice(index, 1) 
                    projectiles.splice(projectileIndex, 1)
                }
            }
        }
    }
           
}


// Shooting projectiles
addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height/2, 
        event.clientX - canvas.width/2
    )

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'white', velocity))
})


buttonElement.addEventListener('click', () => {
    init() //Restart the game
    animate()
    spawnEnemies()
    gsap.to('#modalElement', {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
            modalElement.style.display = "none"
        }
    })
})



startButtonElement.addEventListener('click', () => {
    init() //Restart the game
    animate()
    spawnEnemies()
    
    gsap.to('#startModalElement', {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
            startModalElement.style.display = "none"
        }
    })
})


window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w' : 
            player.velocity.y -= 1
            break;
        case 's' : 
            player.velocity.y += 1
            break;
        case 'a' : 
            player.velocity.x -= 1
            break;
        case 'd' : 
            player.velocity.x += 1
            break;
    }

})

