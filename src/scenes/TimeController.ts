import StateMachine from '../statemachine/StateMachine';
import { GameEvents, eventEmitter } from './EventCenter';
import Controller from '../Controller';

class TimeController implements Controller {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private objName: string;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, objName: string) {
        this.scene = scene;
        this.sprite = sprite;
        this.objName = objName;

        this.stateMachine = new StateMachine(this, objName);

        this.stateMachine.addState('idle').addState('dead').setState('idle');

        eventEmitter.on(`${this.objName}-${GameEvents.hit}`, this.handleHit, this);
    }

    destroy() {
        eventEmitter.off(`${this.objName}-${GameEvents.hit}`, this.handleHit, this);
    }

    update(dt: number) {
        this.stateMachine.update(dt);
    }

    private handleHit(sprite: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== sprite) {
            return;
        }
        eventEmitter.off(`${this.objName}-${GameEvents.hit}`, this.handleHit, this);

        this.sprite.setData('time', 0);
        this.stateMachine.setState('dead');
        this.sprite.destroy();
    }
}

export { TimeController };
