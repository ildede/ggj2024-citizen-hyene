import Phaser from 'phaser';
import PlayerController from './PlayerController';
import { GarbageController, GarbageName } from './GarbageController';
import { EnemyController } from './EnemyController';
import { EntropyController } from './EntropyController';
import Controller from '../Controller';
import { WaterController } from './Water';
import { JackController } from './Jack';
import { FallingObjController } from './FallingObjController';
import { TimeController } from './TimeController';

const SCENE_NAME = 'game';

export default class Game extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private player?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;
    private enemies: EnemyController[] = [];
    private elements: Controller[] = [];

    constructor() {
        super(SCENE_NAME);
    }

    init() {
        console.log(`[${SCENE_NAME}] init`);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enemies = [];

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }

    preload() {
        console.log(`[${SCENE_NAME}] preload`);

        this.load.atlas('animations', 'assets/animations.png', 'assets/animations.json');

        this.load.image('foreground_floor', 'assets/foreground_floor.png');
        this.load.image('Spritesheet', 'assets/Spritesheet.png');
        this.load.image('sptiyrshrry_hyrsy', 'assets/sptiyrshrry_hyrsy.png');
        this.load.image('start', 'assets/start.png');
        this.load.image('end', 'assets/end.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/level.json');

        this.load.image('oil', 'assets/oil.png');
        this.load.image('piano', 'assets/piano.png');
        this.load.image('iron', 'assets/iron.png');
        this.load.image('watch', 'assets/watch.png');
        this.load.image('the', 'assets/the.png');
        this.load.image('banana', 'assets/banana.png');
        this.load.image('coffee', 'assets/coffee.png');
        this.load.image('gas_green', 'assets/gas_green.png');
        this.load.image('gas_red', 'assets/gas_red.png');
        this.load.image('pill', 'assets/pill.png');
        this.load.image('roller', 'assets/roller.png');
        this.load.image('pig', 'assets/pig.png');
        this.load.image('possum', 'assets/possum.png');

        this.load.image(GarbageName, 'assets/trashcan_on.png');
        this.load.image(`${GarbageName}-off`, 'assets/trashcan_off.png');

        this.load.image('background', 'assets/background.png');
        [1, 2, 3, 4, 5, 6].forEach((n) => this.load.audio(`short-laugh-${n}`, `assets/sounds/sfx_laugh_short_${n}.wav`));
        [1, 2, 3].forEach((n) => this.load.audio(`long-laugh-${n}`, `assets/sounds/sfx_laugh_long_${n}.wav`));
    }
    create() {
        console.log(`[${SCENE_NAME}] create`);

        this.scene.launch('ui');

        const width = this.scale.width;
        const height = this.scale.height;
        this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0).setScrollFactor(0, 0);

        const map = this.make.tilemap({ key: 'tilemap' });

        const tilesetForeground_floor = map.addTilesetImage('foreground_floor', 'foreground_floor');
        const tilesetSpritesheet = map.addTilesetImage('Spritesheet', 'Spritesheet');
        const tilesetSptiyrshrry_hyrsy = map.addTilesetImage('sptiyrshrry hyrsy', 'sptiyrshrry_hyrsy');
        const tilesetStart = map.addTilesetImage('start', 'start');
        const tilesetEnd = map.addTilesetImage('end', 'end');
        if (!tilesetForeground_floor) throw new Error(`[${SCENE_NAME}] Tileset "foreground_floor" not found`);
        if (!tilesetSpritesheet) throw new Error(`[${SCENE_NAME}] Tileset "Spritesheet" not found`);
        if (!tilesetSptiyrshrry_hyrsy) throw new Error(`[${SCENE_NAME}] Tileset "sptiyrshrry_hyrsy" not found`);
        if (!tilesetStart) throw new Error(`[${SCENE_NAME}] Tileset "start" not found`);
        if (!tilesetEnd) throw new Error(`[${SCENE_NAME}] Tileset "end" not found`);

        const tileLayer1 = map.createLayer('Tile Layer 1', [tilesetForeground_floor, tilesetSpritesheet, tilesetSptiyrshrry_hyrsy, tilesetStart, tilesetEnd]);
        if (!tileLayer1) throw new Error(`[${SCENE_NAME}] Tilemap layer "Tile Layer 1" not found`);
        tileLayer1.setCollisionByProperty({ collides: true });

        const tileLayer2 = map.createLayer('Tile Layer 2', [tilesetForeground_floor, tilesetSpritesheet, tilesetSptiyrshrry_hyrsy, tilesetStart, tilesetEnd]);
        if (!tileLayer2) throw new Error(`[${SCENE_NAME}] Tilemap layer "Tile Layer 2" not found`);
        tileLayer2.setCollisionByProperty({ collides: true });

        const tileLayer3 = map.createLayer('Tile Layer 3', [tilesetForeground_floor, tilesetSpritesheet, tilesetSptiyrshrry_hyrsy, tilesetStart, tilesetEnd]);
        if (!tileLayer3) throw new Error(`[${SCENE_NAME}] Tilemap layer "Tile Layer 3" not found`);
        tileLayer3.setCollisionByProperty({ collides: true });

        const tileLayer4 = map.createLayer('Tile Layer 4', [tilesetForeground_floor, tilesetSpritesheet, tilesetSptiyrshrry_hyrsy, tilesetStart, tilesetEnd]);
        if (!tileLayer4) throw new Error(`[${SCENE_NAME}] Tilemap layer "Tile Layer 4" not found`);
        tileLayer4.setCollisionByProperty({ collides: true });

        const tileLayer5 = map.createLayer('Tile Layer 5', [tilesetForeground_floor, tilesetSpritesheet, tilesetSptiyrshrry_hyrsy, tilesetStart, tilesetEnd]);
        if (!tileLayer5) throw new Error(`[${SCENE_NAME}] Tilemap layer "Tile Layer 5" not found`);
        tileLayer5.setCollisionByProperty({ collides: true });

        const objectsLayer = map.getObjectLayer('objects');
        if (!objectsLayer) throw new Error(`[${SCENE_NAME}] Tilemap object layer "objects" not found`);

        objectsLayer.objects.forEach((objData) => {
            const { x = 0, y = 0, name } = objData;

            switch (name) {
                case 'spawn': {
                    this.player = this.matter.add.sprite(x, y, 'animations', 'hyena/idle1.png').setFixedRotation();
                    const head = this.add.sprite(x, y, 'animations', 'hyena/face1.png');

                    this.playerController = new PlayerController(this, this.player, head, this.cursors);

                    this.cameras.main.setBounds(0, 0, tileLayer1.width, tileLayer1.height);
                    this.cameras.main.startFollow(this.player, true);
                    break;
                }
                case 'pig': {
                    const pigPolice = this.matter.add.sprite(x, y, 'pig').setFixedRotation();
                    pigPolice.setData('type', 'enemy');
                    pigPolice.setData('entropy', 50);
                    pigPolice.setData('element', 'pig');
                    this.enemies.push(new EnemyController(this, pigPolice, 'pig'));
                    break;
                }
                case 'possum': {
                    const possum = this.matter.add.sprite(x, y, 'possum').setFixedRotation();
                    possum.setData('type', 'enemy');
                    possum.setData('entropy', 50);
                    possum.setData('element', 'possum');
                    this.enemies.push(new EnemyController(this, possum, 'possum'));
                    break;
                }
                case 'garbage': {
                    const garbage = this.createStaticElement(GarbageName, x, y, { entropy: 10 });
                    this.elements.push(new GarbageController(this, garbage));
                    break;
                }
                case 'oil': {
                    this.createStaticElement('oil', x, y, { entropy: 10 });
                    break;
                }
                case 'the': {
                    const food = this.createStaticElement('the', x, y, { entropy: -5 });
                    this.elements.push(new EntropyController(this, food, 'the'));
                    break;
                }
                case 'coffee': {
                    const food = this.createStaticElement('coffee', x, y, { entropy: 5 });
                    this.elements.push(new EntropyController(this, food, 'coffee'));
                    break;
                }
                case 'gas_green': {
                    const food = this.createStaticElement('gas_green', x, y, { entropy: -10 });
                    this.elements.push(new EntropyController(this, food, 'gas_green'));
                    break;
                }
                case 'gas_red': {
                    const food = this.createStaticElement('gas_red', x, y, { entropy: 10 });
                    this.elements.push(new EntropyController(this, food, 'gas_red'));
                    break;
                }
                case 'pill': {
                    const food = this.createStaticElement('pill', x, y, { entropy: 15 });
                    this.elements.push(new EntropyController(this, food, 'pill'));
                    break;
                }
                case 'banana': {
                    const food = this.createStaticElement('banana', x, y, { entropy: 10 });
                    this.elements.push(new EntropyController(this, food, 'banana'));
                    break;
                }
                case 'roller': {
                    const food = this.createStaticElement('roller', x, y, { entropy: 10 });
                    this.elements.push(new EntropyController(this, food, 'roller'));
                    break;
                }
                case 'water': {
                    const element = this.matter.add.sprite(x, y, 'animations', 'manhole/idle.png', {
                        isStatic: true,
                        isSensor: true,
                    });

                    element.setData('type', 'static');
                    element.setData('element', name);
                    element.setData('entropy', 10);
                    this.elements.push(new WaterController(this, element));
                    break;
                }
                case 'jack': {
                    const element = this.matter.add.sprite(x, y, 'animations', 'jack/jack_off.png', {
                        isStatic: true,
                        isSensor: true,
                    });

                    element.setData('type', 'static');
                    element.setData('element', name);
                    element.setData('entropy', 10);
                    this.elements.push(new JackController(this, element));
                    break;
                }
                case 'piano': {
                    const element = this.matter.add.sprite(x, y, 'piano', undefined, { isSensor: true }).setFixedRotation();
                    element.setData('type', 'enemy');
                    element.setData('entropy', 50);
                    element.setData('element', 'piano');

                    this.elements.push(new FallingObjController(this, element, 'piano'));
                    break;
                }
                case 'iron': {
                    const element = this.matter.add.sprite(x, y, 'iron', undefined, { isSensor: true }).setFixedRotation();
                    element.setData('type', 'enemy');
                    element.setData('entropy', 50);
                    element.setData('element', 'iron');

                    this.elements.push(new FallingObjController(this, element, 'iron'));
                    break;
                }
                case 'watch': {
                    const watch = this.createStaticElement('watch', x, y, { time: 10 });
                    this.elements.push(new TimeController(this, watch, 'watch'));
                    break;
                }
            }
        });

        this.matter.world.convertTilemapLayer(tileLayer1);
        this.matter.world.convertTilemapLayer(tileLayer2);
        this.matter.world.convertTilemapLayer(tileLayer3);
        this.matter.world.convertTilemapLayer(tileLayer4);
    }

    destroy() {
        console.log(`[${SCENE_NAME}] destroy`);

        this.scene.stop('ui');
        this.enemies.forEach((enemy) => enemy.destroy());
        this.elements.forEach((element) => element.destroy());
    }

    update(t: number, dt: number) {
        this.playerController?.update(dt);

        this.enemies.forEach((enemy) => enemy.update(dt));
        this.elements.forEach((element) => element.update(dt));
    }

    private createStaticElement(name: string, x: number, y: number, options?: { entropy?: number; time?: number }): Phaser.Physics.Matter.Sprite {
        const element = this.matter.add.sprite(x, y, name, undefined, {
            isStatic: true,
            isSensor: true,
        });

        element.setData('type', 'static');
        element.setData('element', name);
        element.setData('entropy', options?.entropy ?? 0);
        element.setData('time', options?.time ?? 0);
        return element;
    }
}
