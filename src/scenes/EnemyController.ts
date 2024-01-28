import StateMachine from '../statemachine/StateMachine';
import { GameEvents, eventEmitter as events } from './EventCenter';

class EnemyController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private enemyName: string;

    private moveTime = 0;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, enemyName: string) {
        this.scene = scene;
        this.sprite = sprite;
        this.enemyName = enemyName;

        this.createAnimations();

        this.stateMachine = new StateMachine(this, this.enemyName);

        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter,
            })
            .addState('move-left', {
                onEnter: this.moveLeftOnEnter,
                onUpdate: this.moveLeftOnUpdate,
            })
            .addState('move-right', {
                onEnter: this.moveRightOnEnter,
                onUpdate: this.moveRightOnUpdate,
            })
            .addState('dead')
            .setState('idle');

        events.on(GameEvents.stomped, this.handleStomped, this);
    }

    destroy() {
        events.off(GameEvents.stomped, this.handleStomped, this);
    }

    update(dt: number) {
        this.stateMachine.update(dt);
    }

    private createAnimations() {}

    private idleOnEnter() {
        // this.sprite.play('idle');
        const r = Phaser.Math.Between(1, 100);
        if (r < 50) {
            this.stateMachine.setState('move-left');
        } else {
            this.stateMachine.setState('move-right');
        }
    }

    private moveLeftOnEnter() {
        this.moveTime = 0;
        this.sprite.flipX = false;
        // this.sprite.play('move-left');
    }

    private moveLeftOnUpdate(dt: number) {
        this.moveTime += dt;
        this.sprite.setVelocityX(-3);

        if (this.moveTime > 2000) {
            this.stateMachine.setState('move-right');
        }
    }

    private moveRightOnEnter() {
        this.moveTime = 0;
        this.sprite.flipX = true;
        // this.sprite.play('move-right');
    }

    private moveRightOnUpdate(dt: number) {
        this.moveTime += dt;
        this.sprite.setVelocityX(3);

        if (this.moveTime > 2000) {
            this.stateMachine.setState('move-left');
        }
    }

    private handleStomped(sprite: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== sprite) {
            return;
        }

        events.off(GameEvents.stomped, this.handleStomped, this);

        this.scene.tweens.add({
            targets: this.sprite,
            displayHeight: 0,
            y: this.sprite.y + this.sprite.displayHeight * 0.5,
            duration: 200,
            onComplete: () => {
                this.sprite.destroy();
            },
        });

        this.stateMachine.setState('dead');
    }
}

export { EnemyController };
