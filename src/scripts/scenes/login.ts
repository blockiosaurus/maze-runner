import * as Phaser from 'phaser';
import { getWallets, Wallet } from '@wallet-standard/core';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

export default class Login extends Phaser.Scene {
    wallets: Wallet[] = [];
    constructor() {
        super('Bread Maze Login');
    }

    preload() {
        this.load.image('Phantom', 'assets/phantom.jpg');
        this.load.image('Solflare', 'assets/solflare.jpg');
        this.load.image('Backpack', 'assets/backpack.jpg');
        this.load.image('BagelTiles', 'assets/BagelTiles.png');
        this.load.image('CrossedTiles', 'assets/CrossedTiles.png');
        this.load.image('FocacciaTiles', 'assets/FocacciaTiles.png');
        this.load.image('SourdoughTiles', 'assets/SourdoughTiles.png');
        this.load.image('controls', 'assets/Controls.png')
        this.load.spritesheet('BreadPlayer', 'assets/Bread.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('CaptainGrainbeardPlayer', 'assets/CaptainGrainbeard.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('ElPanDegenerarPlayer', 'assets/ElPanDegenerar.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('NootPlayer', 'assets/Noot.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('MonkePlayer', 'assets/Monke.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('RejectPlayer', 'assets/Reject.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('ChickenPlayer', 'assets/Chicken.png', { frameWidth: 32, frameHeight: 32 });
        // const { get: getAllWallets, on: onWallets } = getWallets();
        // console.log(getAllWallets());
        // console.log(getAllWallets()[0].features['standard:connect']['connect']());
        // getAllWallets().forEach((wallet: Wallet) => {
        //     this.textures.addBase64(wallet.name, wallet.icon);
        //     this.wallets.push(wallet);
        // });
    }

    create() {
        const width = this.sys.canvas.width;
        const height = this.sys.canvas.height;
        // console.log(width, height);
        this.add.text(width / 2, 32, 'Login:', { fontSize: '64px' }).setOrigin(0.5);
        // this.wallets.forEach((wallet: Wallet, index: number) => {
        //     let icon = this.add.image(width/2, 128 * (index+1), this.wallets[index].name).setDisplaySize(64, 64);
        //     // console.log(icon);
        //     icon.setInteractive();
        //     icon.on('pointerdown', () => {
        //         // @ts-ignore
        //         console.log(wallet.features);
        //         // @ts-ignore
        //         wallet.features['standard:connect']['connect']().then((res: any) => {
        //             // console.log(res);
        //             console.log(wallet);
        //             this.scene.start('Bread Maze Chooser', {
        //                 wallet: wallet.accounts[0].address,
        //                 // @ts-ignore
        //                 sns: wallet.features["solana:signAndSendTransaction"]["signAndSendTransaction"]
        //             });
        //         })
        //     })
        // });
        // this.scene.start('Bread Maze');

        let phantomIcon = this.add.image(width / 3, 128, "Phantom")
            .setDisplaySize(64, 64)
            .setInteractive()
            .on('pointerdown', () => {
                let adapter = new PhantomWalletAdapter();
                adapter.connect().then(() => {
                    this.scene.start('Bread Maze Chooser', {
                        wallet: adapter.publicKey,
                        adapter: adapter
                    });
                });
            });

        let solflareIcon = this.add.image(width / 2, 128, "Solflare")
            .setDisplaySize(64, 64)
            .setInteractive()
            .on('pointerdown', () => {
                let adapter = new SolflareWalletAdapter();
                adapter.connect().then(() => {
                    this.scene.start('Bread Maze Chooser', {
                        wallet: adapter.publicKey,
                        adapter: adapter
                    });
                });
            });

        let backpackIcon = this.add.image(2 * width / 3, 128, "Backpack")
            .setDisplaySize(64, 64)
            .setInteractive()
            .on('pointerdown', () => {
                let adapter = new BackpackWalletAdapter();
                adapter.connect().then(() => {
                    this.scene.start('Bread Maze Chooser', {
                        wallet: adapter.publicKey,
                        adapter: adapter
                    });
                });
            });
    }
}