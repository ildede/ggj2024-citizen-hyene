import Phaser from 'phaser';
import { eventEmitter, GameEvents } from './EventCenter';
import CountdownController from './CountdownController';
const SCENE_NAME = 'ui';

export default class UI extends Phaser.Scene {
    private timerLabel!: Phaser.GameObjects.Text;
    private graphics!: Phaser.GameObjects.Graphics;
    private previousEntropy = 0;
    private contdown?: CountdownController;

    constructor() {
        super(SCENE_NAME);
    }

    init() {
        console.log(`[${SCENE_NAME}] init`);
    }

    create() {
        console.log(`[${SCENE_NAME}] create`);
        this.graphics = this.add.graphics();
        this.setEntropyBar(0);

        this.timerLabel = this.add.text(10, 35, 'xx.xx', {
            fontSize: '32px',
        });
        this.contdown = new CountdownController(this, this.timerLabel);
        this.contdown.start(() => {
            eventEmitter.emit(GameEvents.timerEnd);
        }, 45000);

        eventEmitter.on(GameEvents.entropyUpdate, this.handleEntropyChanged, this);
    }

    update() {
        this.contdown?.update();
    }

    private setEntropyBar(value: number) {
        const width = 500;
        const percent = Phaser.Math.Clamp(value, 0, 100) / 100;

        this.graphics.clear();
        this.graphics.fillStyle(0x808080);
        this.graphics.fillRoundedRect(10, 10, width, 20, 5);
        if (percent > 0) {
            this.graphics.fillStyle(0x00ff00);
            this.graphics.fillRoundedRect(10, 10, width * percent, 20, 5);
        }
    }

    private handleEntropyChanged(value: number) {
        this.tweens.addCounter({
            from: this.previousEntropy,
            to: value,
            duration: 200,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween) => {
                const value = tween.getValue();
                this.setEntropyBar(value);
            },
        });

        this.previousEntropy = value;
    }
}
