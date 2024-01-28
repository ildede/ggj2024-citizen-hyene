import StateMachine from '../statemachine/StateMachine';
import Controller from '../Controller';

const JackName = 'jack';
class JackController implements Controller {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private timeout?: NodeJS.Timeout;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene;
        this.sprite = sprite;

        this.createAnimations();

        this.stateMachine = new StateMachine(this, JackName);

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
        this.sprite.play('jack-off');
        this.sprite.setData('entropy', 0);
        this.timeout = setTimeout(() => {
            this.stateMachine.setState('on');
        }, 3000);
    }

    onOnEnter() {
        this.sprite.play('jack-on');
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
            key: 'jack-off',
            frames: [{ key: 'animations', frame: 'jack/jack_off.png' }],
        });

        this.sprite.anims.create({
            key: 'jack-on',
            frameRate: 5,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('animations', {
                start: 1,
                end: 2,
                prefix: 'jack/jack_on',
                suffix: '.png',
            }),
        });
    }
}

export { JackController, JackName };
