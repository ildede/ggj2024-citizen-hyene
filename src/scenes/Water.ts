import StateMachine from '../statemachine/StateMachine';
import Controller from '../Controller';

const WaterName = 'water';
class WaterController implements Controller {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private timeout?: NodeJS.Timeout;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene;
        this.sprite = sprite;

        this.createAnimations();

        this.stateMachine = new StateMachine(this, WaterName);

        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter,
            })
            .addState('on', {
                onEnter: this.onOnEnter,
            })
            .setState('idle');
    }

    idleOnEnter() {
        this.sprite.play('manhole-idle');
        this.sprite.setData('entropy', 0);
        this.timeout = setTimeout(() => {
            this.stateMachine.setState('on');
        }, 3000);
    }

    onOnEnter() {
        this.sprite.play('manhole-on');
        this.sprite.setData('entropy', 20);
        this.timeout = setTimeout(() => {
            this.stateMachine.setState('idle');
        }, 3000);
    }
    destroy() {
        clearTimeout(this.timeout);
    }

    update(dt: number) {
        this.stateMachine.update(dt);
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: 'manhole-idle',
            frames: [{ key: 'animations', frame: 'manhole/idle.png' }],
        });

        this.sprite.anims.create({
            key: 'manhole-on',
            frameRate: 5,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('animations', {
                start: 1,
                end: 2,
                prefix: 'manhole/water',
                suffix: '.png',
            }),
        });
    }
}

export { WaterController, WaterName };
