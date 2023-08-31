import * as Phaser from 'phaser';
import { BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
import axios from 'axios';

export default class Chooser extends Phaser.Scene {
    wallet: string;
    adapter: BaseMessageSignerWalletAdapter;
    constructor() {
        super('Bread Maze Chooser');
    }

    init(data: any) {
        this.wallet = data.wallet;
        this.adapter = data.adapter;
        nftFetch(this.wallet)
            .then((nfts: any[]) => {
                if (nfts === null || nfts.length === 0) {
                    this.add.text(32, 32, 'No Bread Mazes found', { fontSize: '64px', wordWrap: { width: 576 }, align: 'center' });
                } else {
                    // console.log("Fetched: ", nfts);
                    let xOff = 64;
                    let yOff = 64;
                    for (const nft of nfts) {
                        // console.log("Parsing: ", nft.mint, "from", nft.image_uri);
                        this.load.image(nft.mint, nft.image_uri);
                        this.load.on('filecomplete-image-' + nft.mint, (key: string, type: string, data: any) => {
                            let icon = this.add.image(xOff, yOff, key).setDisplaySize(64, 64);
                            checkForProof(this.wallet, nft.mint).then((result) => {
                                if (result) {
                                    let effect = icon.postFX.addColorMatrix();
                                    effect.grayscale();
                                    // icon.setTint(0x00ff00);
                                }
                            });
                            const name = (nft.name as string).replace("Gaming Challenge: ", "").replace(" ", "\n");
                            let text = this.add.text(xOff, yOff + 48, name, { fontSize: '12px', wordWrap: { width: 64 }, align: 'center' }).setOrigin(0.5, 0.5);
                            xOff += 96;
                            if ((xOff + 64) > 576) {
                                xOff = 64;
                                yOff += 128;
                            }
                            icon.setInteractive();
                            icon.on('pointerdown', () => {
                                this.load.json('level', nft.metadata_uri);
                                this.load.on('filecomplete-json-level', (key: string, type: string, data: any) => {
                                    this.scene.start('Bread Maze', { wallet: this.wallet, nft: nft, adapter: this.adapter });
                                });
                                this.load.start();
                            })
                        });
                    }
                    this.load.start();
                }
            });
    }

    preload() {
    }

    create() {
    }
}

async function nftFetch(wallet: string) {
    let url = "https://bread-maze-15a908bc4a02.herokuapp.com/";
    let response = await axios({
        // Endpoint to send files
        url: `${url}nfts/${wallet}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    // console.log(response);
    return response.data;
}

async function checkForProof(wallet: string, leafId: string) {
    let url = "https://bread-maze-15a908bc4a02.herokuapp.com/";
    // let url = "http://localhost:5000/"
    try {
        let response = await axios({
            // Endpoint to send files
            url: `${url}check/${leafId}/${wallet}`,
            method: "GET",
        });
        return true;
    } catch (e) {
        return false;
    }
}