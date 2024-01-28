import Phaser from 'phaser';
const SCENE_NAME = 'game-end';

export default class GameEnd extends Phaser.Scene {
    constructor() {
        super(SCENE_NAME);
    }
    init() {
        console.log(`[${SCENE_NAME}] init`);
    }

    preload() {
        this.load.image('won', 'assets/win_screen.png');
        this.load.image('lost', 'assets/gameover_screen.png');
    }

    create(input: { result: string }) {
        console.log(`[${SCENE_NAME}] create`, input);
        const { width, height } = this.scale;

        this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0).setScrollFactor(0, 0);

        const image = this.add.image(width / 2, height / 2, input.result ?? 'lost');

        const buttonX = input.result === 'won' ? width / 3 + image.width / 1.15 : width / 2 - image.width / 2;
        const buttonY = input.result === 'won' ? height / 2 + image.height / 6 : height / 2 + image.height / 6;
        const button = this.add.image(buttonX, buttonY, 'start_screen', 'button.png');
        button.setInteractive();
        button.on('pointerdown', () => this.scene.start('game'));
    }
}
