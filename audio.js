
const audio = {
    shoot: new Howl({
        src: './audio/Basic_shoot_noise.wav',
        volume: 0.15
    }),
    
    damage: new Howl({
        src: './audio/Damage_taken.wav',
        volume: 1
    }),

    explode: new Howl({
        src: './audio/Explode.wav',
        volume: 1
    }),

    death: new Howl({
        src: './audio/Death.wav',
        volume: 1
    }),

    powerUpNoise: new Howl({
        src: './audio/Powerup_noise.wav',
        volume: 0.2
    }),
    select: new Howl({
        src: './audio/Select.wav',
        volume: 0.2
    })

    // ,background: new Howl ({
    //     src : './audio/bkgdaudio.wav',
    //     volume: 1,
    //     loop: true
    // })

    // ,beat: new Howl ({
    //     src : './audio/drummoise.wav',
    //     volume: 0.1,
    //     loop: true
    // })
}

