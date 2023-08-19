import * as Phaser from 'phaser';
import Login from './scenes/login';
import Chooser from './scenes/chooser';
import Game from './scenes/game';

type scaleMode = 'FIT' | 'SMOOTH'

export const DEFAULT_WIDTH: number = 576
export const DEFAULT_HEIGHT: number = 576

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    backgroundColor: '#000000',
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    scene: [Login, Chooser, Game],
    scale: {
        mode: Phaser.Scale.FIT,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        },
    },
    pixelArt: true,
};