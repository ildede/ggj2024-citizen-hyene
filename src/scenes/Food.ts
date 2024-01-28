import StateMachine from '../statemachine/StateMachine';
import { GameEvents, eventEmitter } from './EventCenter';
import Controller from '../Controller';

class FoodController implements Controller {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private foodName: string;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, foodName: string) {
        this.scene = scene;
        this.sprite = sprite;
        this.foodName = foodName;

        this.stateMachine = new StateMachine(this, foodName);

        this.stateMachine.addState('idle').addState('dead').setState('idle');

        eventEmitter.on(`${this.foodName}-${GameEvents.hit}`, this.handleHit, this);
    }

    destroy() {
        eventEmitter.off(`${this.foodName}-${GameEvents.hit}`, this.handleHit, this);
    }

    update(dt: number) {
        this.stateMachine.update(dt);
    }

    private handleHit(sprite: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== sprite) {
            return;
        }
        eventEmitter.off(`${this.foodName}-${GameEvents.hit}`, this.handleHit, this);

        this.sprite.setData('entropy', 0);
        this.stateMachine.setState('dead');
        this.sprite.destroy();
    }
}

export { FoodController };
