import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { keccak_256 } from "@noble/hashes/sha3";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { BaseMessageSignerWalletAdapter } from "@solana/wallet-adapter-base";
import axios from "axios";
const path_idl = require("../../assets/bgl_path_validator.json");
const track_idl = require("../../assets/wallet_tracker.json");

const TREASURY = new PublicKey("patht4uEaSDieLqjU4EZ8PZRWs2dPCQMqorCTZhVPMB");

async function submitProof(connection: Connection, authority: Keypair, path: number[]) {
    const programID = new PublicKey('PATHrLe2WkDq1WS9df5dSuZ5MhnZZzGZmXcj4wGFCys');
    const provider = new AnchorProvider(connection, new NodeWallet(authority), { skipPreflight: true, commitment: 'finalized', maxRetries: 100 });
    const program = new Program(path_idl, programID, provider);

    //TODO remove
    const proof = hashPath(path);

    let ix = await program.methods
        .validateU8({ proof: Array.from(proof!), path: Buffer.from(path) })
        .accounts({
            payer: authority.publicKey,
            treasury: TREASURY,
        })
        .instruction();
    // tx.partialSign(authority);

    return ix;
}

async function claimProof(connection: Connection, authority: Keypair, leaf_id: string, wallet: string) {
    const programID = new PublicKey('TRCKTiWtWCzCopm4mnR47n4v2vEvjRQ1q6rsDxRUbVR');

    const provider = new AnchorProvider(connection, new NodeWallet(authority), { skipPreflight: true, commitment: 'finalized', maxRetries: 100 });
    const program = new Program(track_idl, programID, provider);

    const walletPubkey = new PublicKey(wallet);
    const leafKey = new PublicKey(leaf_id);

    console.log(leaf_id);

    let winProofPDA = PublicKey.findProgramAddressSync(
        [Buffer.from("proof"), authority.publicKey.toBuffer(), walletPubkey.toBuffer(), (leafKey).toBuffer()],
        program.programId
    );

    let walletRecordPDA = PublicKey.findProgramAddressSync(
        [Buffer.from("record"), authority.publicKey.toBuffer(), walletPubkey.toBuffer()],
        program.programId
    );

    let leafRecordPDA = PublicKey.findProgramAddressSync(
        [Buffer.from("record"), authority.publicKey.toBuffer(), (leafKey).toBuffer()],
        program.programId
    );

    // Add your test here.
    let ix = await program.methods
        .claimWinProof(leafKey.toBytes())
        .accounts({
            winProof: winProofPDA[0],
            walletRecord: walletRecordPDA[0],
            leafRecord: leafRecordPDA[0],
            authority: authority.publicKey,
            wallet: wallet,
        })
        .instruction();

    // ix.partialSign(authority);
    return ix;


    // const winProofAccount = await program.account.winProof.fetch(winProofPDA[0]);
    // console.log(winProofAccount);

    // const walletRecordAccount = await program.account.record.fetch(walletRecordPDA[0]);
    // console.log(walletRecordAccount);

    // const leafRecordAccount = await program.account.record.fetch(leafRecordPDA[0]);
    // console.log(leafRecordAccount);
}

export async function sendTransaction(adapter: BaseMessageSignerWalletAdapter, path: number[], leaf_id: string, wallet: string) {
    
    // console.log(result.tx);
    const connection = new Connection(process.env.RPC_URL!, 'confirmed');
    // const secret = JSON.parse(process.env.AUTH_KEY!);
    // const secretKey = Uint8Array.from(secret);
    // const authority = Keypair.fromSecretKey(secretKey);

    // console.log("Proof: ", hashPath(path), ":", path);
    // let tx = new Transaction();
    // tx = tx.add(await submitProof(
    //     connection,
    //     authority,
    //     path
    // ));
    // tx = tx.add(await claimProof(
    //     connection,
    //     authority,
    //     leaf_id,
    //     wallet
    // ));

    // console.log(JSON.stringify(tx, null, 2));

    // tx.feePayer = new PublicKey(wallet);
    // tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    // tx.partialSign(authority);
    let result = await proofFetch(path, leaf_id, wallet);
    let tx = Transaction.from(
        Buffer.from(result.tx, "base64")
    );;

    if (!adapter.connected) {
        await adapter.connect();
    }
    await adapter.sendTransaction(tx, connection, { skipPreflight: true });

    // return tx;
}

function hashPath(path: number[]) {
    let computedHash: Uint8Array | null = null;
    for (let i = 0; i < path.length; i += 32) {
        const chunk = path.slice(i, i + 32);
        // console.log(chunk);
        if (computedHash == null) {
            computedHash = keccak_256(Uint8Array.from([1].concat(chunk)))
        } else {
            computedHash = keccak_256(Uint8Array.from([1].concat(Array.from(computedHash)).concat(chunk)))
        }
        // console.log(computedHash);
    }
    return computedHash;
}

async function proofFetch(path: number[], leaf_id: string, wallet: string) {
    let proof = hashPath(path);
    // let hash = "";
    // proof?.forEach((byte) => { hash = hash + byte.toString(16) });
    console.log(process.env);
    let url = process.env.SERVER_URL;
    // console.log(path);
    let pathBytes = Buffer.from(new Uint8Array(path)).toString('base64');
    // console.log(`${url}proof/${pathBytes}/${leaf_id}/${wallet}`);
    let response = await axios({
        // Endpoint to send files
        url: `${url}proof/${pathBytes}/${leaf_id}/${wallet}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });


    console.log(response);
    return response.data;
}