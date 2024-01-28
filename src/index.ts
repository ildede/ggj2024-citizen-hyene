import Phaser from 'phaser';

import Game from './scenes/Game';
import UI from './scenes/UI';
import GameEnd from './scenes/GameEnd';
import SplashScreen from './scenes/SplashScreen';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        parent: 'game',
        mode: Phaser.Scale.RESIZE,
    },
    physics: {
        default: 'matter',
        matter: {
            //debug: true,
        },
    },
    scene: [SplashScreen, Game, UI, GameEnd],
};

document.addEventListener('DOMContentLoaded', () => new Phaser.Game(config));
