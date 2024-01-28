import Phaser from 'phaser';

const SCENE_NAME = 'splash-screen';

export default class SplashScreen extends Phaser.Scene {
    constructor() {
        super(SCENE_NAME);
    }

    init() {
        console.log(`[${SCENE_NAME}] init`);
    }

    preload() {
        console.log(`[${SCENE_NAME}] preload`);

        this.load.atlas('start_screen', 'assets/start_screen.png', 'assets/start_screen.json');

        this.load.image('background', 'assets/background.png');
    }
    create() {
        console.log(`[${SCENE_NAME}] create`);

        const width = this.scale.width;
        const height = this.scale.height;
        this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0).setScrollFactor(0, 0);
        const sprite = this.add.sprite(width / 2, height / 2, 'start_screen', 'title');
        sprite.anims.create({
            key: 'neon',
            frameRate: 1,
            repeat: -1,
            frames: sprite.anims.generateFrameNames('start_screen', {
                start: 1,
                end: 2,
                prefix: 'title',
                suffix: '.png',
            }),
        });
        sprite.play('neon');

        const button = this.add.image(width / 3 + sprite.width / 1.15, height / 2 + sprite.height / 6, 'start_screen', 'button.png');
        button.setInteractive();
        button.on('pointerdown', () => this.scene.start('game'));
    }

    destroy() {
        console.log(`[${SCENE_NAME}] destroy`);
    }
}
