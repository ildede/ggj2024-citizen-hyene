import StateMachine from '../statemachine/StateMachine';
import Controller from '../Controller';

const INITIAL_VELOCITY = 15;

class FallingObjController implements Controller {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, objName: string) {
        this.scene = scene;
        this.sprite = sprite;

        this.stateMachine = new StateMachine(this, objName);

        this.stateMachine
            .addState('fall', {
                onEnter: this.fallOnEnter,
                onUpdate: this.fallOnUpdate,
            })
            .setState('fall');
    }

    destroy(): void {}

    update(dt: number) {
        this.stateMachine.update(dt);
    }

    private fallOnEnter() {
        this.sprite.setVelocityY(INITIAL_VELOCITY);
    }

    private fallOnUpdate() {
        if (this.sprite.y > this.scene.scale.height * 2) {
            this.sprite.setY(-(200 + Math.floor(500 * Math.random())));
            this.sprite.setVelocityY(INITIAL_VELOCITY);
        }
    }
}

export { FallingObjController };
