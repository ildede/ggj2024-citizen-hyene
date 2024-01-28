import Phaser from 'phaser';

const eventEmitter = new Phaser.Events.EventEmitter();

enum GameEvents {
    stomped = 'element-stomped',
    hit = 'element-hit',
    entropyUpdate = 'entropy-up',
    timerEnd = 'timer-end',
}

export { eventEmitter, GameEvents };
