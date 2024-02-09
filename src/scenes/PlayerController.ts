import Phaser from 'phaser';
import StateMachine from '../statemachine/StateMachine';
import { eventEmitter, GameEvents } from './EventCenter';
import { GarbageName } from './GarbageController';
import { WaterName } from './Water';
import { JackName } from './Jack';

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

const MAX_ENTROPY = 100;
export default class PlayerController {
    private scene: Phaser.Scene;
    private body: Phaser.Physics.Matter.Sprite;
    private head: Phaser.GameObjects.Sprite;
    private cursors: CursorKeys;

    private stateMachine: StateMachine;
    private entropy = 0;
    private laughs: Phaser.Sound.BaseSound[] = [];

    private lastEnemy?: Phaser.Physics.Matter.Sprite;
    private headTimeout?: NodeJS.Timeout;

    constructor(scene: Phaser.Scene, body: Phaser.Physics.Matter.Sprite, head: Phaser.GameObjects.Sprite, cursors: CursorKeys) {
        this.scene = scene;
        this.body = body;
        this.head = head;
        this.cursors = cursors;

        [1, 2, 3, 4, 5, 6].forEach((n) => {
            this.laughs.push(scene.sound.add(`short-laugh-${n}`, { loop: true }));
        });
        [1, 2, 3].forEach((n) => {
            this.laughs.push(scene.sound.add(`long-laugh-${n}`, { loop: true }));
        });
        this.createAnimations();

        this.stateMachine = new StateMachine(this, 'player');

        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter,
                onUpdate: this.idleOnUpdate,
            })
            .addState('walk', {
                onEnter: this.walkOnEnter,
                onUpdate: this.walkOnUpdate,
                onExit: this.walkOnExit,
            })
            .addState('jump', {
                onEnter: this.jumpOnEnter,
                onUpdate: this.jumpOnUpdate,
            })
            .addState(`${GarbageName}-${GameEvents.hit}`, {
                onEnter: this.objectHitOnEnter,
            })
            .addState(`${WaterName}-${GameEvents.hit}`, {
                onEnter: this.objectHitOnEnter,
            })
            .addState(`${JackName}-${GameEvents.hit}`, {
                onEnter: this.objectHitOnEnter,
            })
            .addState(`pig-${GameEvents.hit}`, {
                onEnter: this.enemyHitOnEnter,
            })
            .addState(`possum-${GameEvents.hit}`, {
                onEnter: this.enemyHitOnEnter,
            })
            .addState(GameEvents.stomped, {
                onEnter: this.enemyStompOnEnter,
            })
            .addState('game-over', {
                onEnter: () => this.gameEndOnEnter('lost'),
            })
            .addState('game-win', {
                onEnter: () => this.gameEndOnEnter('won'),
            })
            .addState('too-much-entropy', {
                onEnter: this.tooMuchEntropyOnEnter,
            })
            .setState('idle');

        this.body.setOnCollide((data: MatterJS.ICollisionPair) => {
            const body = data.bodyB as MatterJS.BodyType;

            const gameObject = body.gameObject;
            if (!gameObject) {
                return;
            }

            if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
                if (this.stateMachine.isCurrentState('jump')) {
                    this.stateMachine.setState('idle');
                }
                return;
            }

            const sprite = gameObject as Phaser.Physics.Matter.Sprite;
            const type = sprite.getData('type');

            console.log(`[PlayerController] collision on type ${type}`, sprite);
            // Su cosa può sbatttere la iena
            // nemici (oggetti in movimento)
            // - movimento orrizzontale
            //   - poliziotto
            //   - opossum
            // - cadono dal cielo
            //   - pianoforte
            //   - incudine
            // oggetti statici
            // - attiva una volta sola (scompaiono o hanno altro sprite per mostrare lo stato disattivo)
            //   - secchi -> si svuota/fa rumore al tocco
            //   - camomilla
            //   - caffe
            //   - pillola
            // - attivi ogni volta
            //   - banana, pattini, macchia olio
            // - stato on/off
            //   - tombino
            //   - pupazzo
            switch (type) {
                // possono essere uccisi e si muovono
                case 'enemy': {
                    this.lastEnemy = gameObject;
                    const { y } = this.body.getVelocity();
                    if (this.body.y < body.position.y && y && y > 0) {
                        this.stateMachine.setState(GameEvents.stomped);
                    } else {
                        const elementName = sprite.getData('element');
                        const elementEntropy: number = sprite.getData('entropy') ?? 0;
                        console.log(elementEntropy);
                        this.setEntropy(this.entropy + elementEntropy);
                        eventEmitter.emit(`${elementName}-${GameEvents.hit}`, sprite);
                        this.stateMachine.setState(`${elementName}-${GameEvents.hit}`);
                    }
                    break;
                }

                case 'static': {
                    const elementName = sprite.getData('element');
                    const elementEntropy: number = sprite.getData('entropy') ?? 0;
                    this.setEntropy(this.entropy + elementEntropy);
                    eventEmitter.emit(`${elementName}-${GameEvents.hit}`, sprite);
                    if (elementEntropy) {
                        this.stateMachine.setState(`${elementName}-${GameEvents.hit}`);
                    }
                    break;
                }
            }
        });

        eventEmitter.on(GameEvents.timerEnd, () => {
            this.stateMachine.setState('game-over');
        });
    }

    update(dt: number) {
        this.head.setX(this.body.x);
        this.head.setY(this.body.y);
        this.stateMachine.update(dt);
        if (this.body.x > 7600) {
            this.setEntropy(Math.max(this.entropy, 90));
            this.stateMachine.setState('game-win');
        }
    }

    private setEntropy(value: number) {
        const newEntropy: number = Phaser.Math.Clamp(value, 0, MAX_ENTROPY);
        const randomLaugh = this.laughs[Math.floor(Math.random() * this.laughs.length)];
        if (newEntropy > this.entropy) {
            if (!randomLaugh.isPlaying) randomLaugh.play();
        } else {
            if (randomLaugh.isPlaying) randomLaugh.stop();
        }
        this.entropy = newEntropy;
        eventEmitter.emit(GameEvents.entropyUpdate, newEntropy);

        if (this.entropy >= MAX_ENTROPY) {
            this.stateMachine.setState('too-much-entropy');
        }
    }

    private idleOnEnter() {}

    private idleOnUpdate() {
        if (this.entropy >= MAX_ENTROPY) return;

        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.stateMachine.setState('walk');
        }

        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
        if (spaceJustPressed) {
            this.stateMachine.setState('jump');
        }
    }

    private walkOnEnter() {
        if (this.entropy >= MAX_ENTROPY) return;
        this.body.play('player-walk');
    }

    private walkOnUpdate() {
        if (this.entropy >= MAX_ENTROPY) return;
        const speed = 5;

        if (this.cursors.left.isDown) {
            this.body.flipX = true;
            this.head.flipX = true;
            this.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.body.flipX = false;
            this.head.flipX = false;
            this.body.setVelocityX(speed);
        } else {
            this.body.setVelocityX(0);
            this.stateMachine.setState('idle');
        }

        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
        if (spaceJustPressed) {
            this.stateMachine.setState('jump');
        }
    }

    private walkOnExit() {
        this.body.stop();
    }

    private jumpOnEnter() {
        if (this.entropy >= MAX_ENTROPY) return;
        this.body.setVelocityY(-18);
    }

    private jumpOnUpdate() {
        if (this.entropy >= MAX_ENTROPY) return;
        const speed = 5;

        if (this.cursors.left.isDown) {
            this.body.flipX = true;
            this.head.flipX = true;
            this.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.body.flipX = false;
            this.head.flipX = false;
            this.body.setVelocityX(speed);
        }
    }

    private objectHitOnEnter() {
        this.body.setVelocityY(-12);

        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween) => {
                const value = tween.getValue();
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, 100, value);

                const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);

                this.body.setTint(color);
                this.head.setTint(color);
            },
        });

        this.stateMachine.setState('idle');
    }

    private enemyHitOnEnter() {
        if (this.lastEnemy) {
            if (this.body.x < this.lastEnemy.x) {
                this.body.setVelocityX(-20);
            } else {
                this.body.setVelocityX(20);
            }
        } else {
            this.body.setVelocityY(-20);
        }
        this.body.setVelocityY(-10);

        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0x0000ff);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween) => {
                const value = tween.getValue();
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, 100, value);

                const color = Phaser.Display.Color.GetColor(colorObject.r, colorObject.g, colorObject.b);

                this.body.setTint(color);
                this.head.setTint(color);
            },
        });

        this.stateMachine.setState('idle');
    }

    private enemyStompOnEnter() {
        this.body.setVelocityY(-10);

        eventEmitter.emit(GameEvents.stomped, this.lastEnemy);

        this.stateMachine.setState('idle');
    }

    private gameEndOnEnter(result: 'won' | 'lost') {
        this.body?.setOnCollide(() => {});
        clearTimeout(this.headTimeout);

        this.scene.time.delayedCall(1200, () => {
            this.scene.scene.start('game-end', { result });
        });
    }

    private tooMuchEntropyOnEnter() {
        this.head.visible = false;
        this.body.play('player-too-much-laugh');
        setTimeout(() => {
            this.head.visible = true;
            this.setEntropy(this.entropy - 20);
            this.stateMachine.setState('idle');
            this.body.play('player-idle');
        }, 3000);
    }

    private createAnimations() {
        this.body.anims.create({
            key: 'player-walk',
            frameRate: 5,
            frames: this.body.anims.generateFrameNames('animations', {
                start: 1,
                end: 2,
                prefix: 'hyena/walk',
                suffix: '.png',
            }),
            repeat: -1,
        });

        this.body.anims.create({
            key: 'player-idle',
            frames: [{ key: 'animations', frame: 'hyena/idle1.png' }],
        });

        this.body.anims.create({
            key: 'player-too-much-laugh',
            frameRate: 7,
            repeat: -1,
            frames: this.body.anims.generateFrameNames('animations', {
                start: 1,
                end: 4,
                prefix: 'hyena/laugh',
                suffix: '.png',
            }),
        });

        this.headAnimation();
    }

    private headAnimation() {
        console.log('headAnimation', this.entropy);
        if (this.entropy === 0) {
            this.head.setTexture('animations', 'hyena/face1.png');
            this.head.setOrigin(0.5, 0.5);
            setTimeout(() => this.headAnimation(), 200);
        } else if (this.entropy < 33) {
            this.head.setTexture('animations', 'hyena/face1.png');
            this.head.setOrigin(0.5, generateRandom(0.49, 0.51));
            setTimeout(() => this.headAnimation(), 100);
        } else if (this.entropy < 66) {
            this.head.setTexture('animations', 'hyena/face2.png');
            this.head.setOrigin(0.5, generateRandom(0.48, 0.52));
            setTimeout(() => this.headAnimation(), 90);
        } else {
            this.head.setTexture('animations', 'hyena/face3.png');
            this.head.setOrigin(0.5, generateRandom(0.47, 0.53));
            setTimeout(() => this.headAnimation(), 80);
        }
    }
}

function generateRandom(min: number = 0, max: number = 1): number {
    const difference = max - min;
    return Math.random() * difference + min;
}
