import StateMachine from '../statemachine/StateMachine';
import { GameEvents, eventEmitter as events } from './EventCenter';
import Controller from '../Controller';

const GarbageName = 'garbage';
class GarbageController implements Controller {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene;
        this.sprite = sprite;

        this.stateMachine = new StateMachine(this, GarbageName);

        this.stateMachine.addState('idle').addState('dead').setState('idle');

        events.on(`${GarbageName}-${GameEvents.hit}`, this.handleHit, this);
    }

    destroy() {
        events.off(`${GarbageName}-${GameEvents.hit}`, this.handleHit, this);
    }

    update(dt: number) {
        this.stateMachine.update(dt);
    }

    private handleHit(sprite: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== sprite) {
            return;
        }
        events.off(`${GarbageName}-${GameEvents.hit}`, this.handleHit, this);

        this.sprite = sprite.setTexture(`${GarbageName}-off`);
        this.sprite.setY(this.sprite.y + 35);
        this.sprite.setData('entropy', 0);
        this.stateMachine.setState('dead');
    }
}

export { GarbageController, GarbageName };
