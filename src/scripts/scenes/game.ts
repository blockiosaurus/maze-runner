import * as Phaser from 'phaser';
import Player from '../components/player';
import Controls from '../components/controls/controls';
import Login from './login';
import Chooser from './chooser';
import { sendTransaction } from '../utils/programs';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base';

const TILE_SIZE = 64;

class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export default class Game extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    controls: Controls;
    player: Player;
    map: Phaser.Tilemaps.Tilemap;
    entrance: Phaser.Tilemaps.Tile[];
    exit: Phaser.Tilemaps.Tile[];
    won: boolean = false;
    // level: number[][];
    path: Array<Position> = new Array<Position>();
    level: any;
    tilesSprite: string;
    playerSprite: string;
    wallet: string;
    nft: any;
    adapter: BaseMessageSignerWalletAdapter;

    constructor() {
        super('Bread Maze');
    }

    preload() {
    }

    init(data: any) {
        this.wallet = data.wallet;
        console.log(this.wallet);
        this.nft = data.nft;
        console.log(this.nft);
        this.adapter = data.adapter;
        console.log(this.adapter);
    }

    create() {
        const metadata = this.cache.json.get('level');
        // console.log(metadata);
        this.populate(metadata);
        // const level = JSON.parse(metadata.attributes[3].value);
        this.map = this.make.tilemap({ data: this.level, tileWidth: 64, tileHeight: 64 });
        const tiles = this.map.addTilesetImage(this.tilesSprite);
        const layer = this.map.createLayer(0, tiles!, 0, 0);

        this.cameras.main.setBackgroundColor('#000000')
        this.cameras.main.fadeIn()

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // this.input.addPointer(1);
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.controls = new Controls(this);

        // const [x, y] = find_tile(layer.layer.data, 2);
        this.entrance = this.map.filterTiles((tile) => tile.index === 2)!;
        this.player = new Player(
            this,
            layer!.tileToWorldX(this.entrance[0].x) + TILE_SIZE / 2,
            layer!.tileToWorldY(this.entrance[0].y) + TILE_SIZE / 2,
            this.playerSprite
        );
        this.exit = this.map.filterTiles((tile) => tile.index === 3)!;

        this.map.setCollision(0);
        this.physics.add.collider(this.player, layer!);

        this.cameras.main.startFollow(this.player);
    }

    update() {
        this.player.update(this.cursors, this.controls);
        this.controls.update();

        const playerTile = this.map.getTileAtWorldXY(this.player.x, this.player.y);
        const playerPosition = new Position(playerTile!.x, playerTile!.y);
        if (this.path.length === 0 || this.path[this.path.length - 1].x !== playerPosition.x || this.path[this.path.length - 1].y !== playerPosition.y) {
            const index = contains(this.path, playerPosition);
            if (index !== -1) {
                // console.log("backtrack");
                this.path.splice(index + 1);
            } else {
                this.path.push(playerPosition);
            }
            // console.log(this.path);
        }

        if (!this.won) {
            this.physics.world.overlapTiles(this.player, this.exit, (_tile: any) => {
                console.log('win');
                const x = Math.max(100, this.player.x);
                const y = Math.max(10, this.player.y);
                const text = this.add.text(x, y, 'You win!', { fontSize: '64px', color: '#F00', strokeThickness: 10 });
                text.setOrigin(0.5, 0.5);
                this.won = true;

                let proof_path: number[] = [];
                for (const pos of this.path) {
                    proof_path.push(pos.x);
                    proof_path.push(pos.y);
                }
                sendTransaction(this.adapter, proof_path, this.nft.mint, this.wallet).then((tx) => {
                    
                });
            }, undefined, this);
        }
    }

    populate(metadata: any) {
        for (let attribute of metadata.attributes) {
            switch (attribute.trait_type) {
                case 'Maze':
                    this.tilesSprite = (attribute.value as string).replace(/\s/g, '') + 'Tiles';
                    break;
                case 'Player':
                    this.playerSprite = (attribute.value as string).replace(/\s/g, '') + 'Player';
                    break;
                case 'Size':
                    break;
                case 'Map':
                    this.level = JSON.parse(attribute.value);
                    break;
            }
        }
    }
}

function contains(array: Array<Position>, position: Position) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x === position.x && array[i].y === position.y) {
            return i;
        }
    }
    return -1;
}
