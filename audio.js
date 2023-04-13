
const audio = {
    shoot: new Howl({
        src: './audio/Basic_shoot_noise.wav',
        volume: 0.03
    }),
    
    damage: new Howl({
        src: './audio/Damage_taken.wav',
        volume: 0.1
    }),

    explode: new Howl({
        src: './audio/Explode.wav',
        volume: 0.1
    }),

    death: new Howl({
        src: './audio/Death.wav',
        volume: 0.1
    }),

    powerUpNoise: new Howl({
        src: './audio/Death.wav',
        volume: 0.1
    }),
    select: new Howl({
        src: './audio/Select.wav',
        volume: 0.1
    }),

    background: new Howl ({
        src : './audio/bkgdaudio.wav',
        volume: 0.1,
        loop: true
    })
}

