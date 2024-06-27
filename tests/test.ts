import { ComputeBudgetProgram, Connection, Keypair, Transaction, TransactionInstruction, TransactionInstructionCtorFields } from "@solana/web3.js"
const signerSeed = JSON.parse(process.env.SIGNER)
import programSeed from "../deploy/noop_keypair.json"
import { assert } from "chai"
const programKeypair = Keypair.fromSecretKey(new Uint8Array(programSeed))

const program = programKeypair.publicKey

const connection = new Connection("http://127.0.0.1:8899", {
    commitment: "confirmed"
})

const signer = Keypair.fromSecretKey(new Uint8Array(signerSeed))

const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
        signature,
        ...block,
    })
    return signature
}

const log = async (signature: string): Promise<string> => {
    console.log(`Transaction successful! https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`)
    return signature
}

const signAndSend = async(tx: Transaction): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    tx.recentBlockhash = block.blockhash
    tx.lastValidBlockHeight = block.lastValidBlockHeight
    const signature = await connection.sendTransaction(tx, [signer])
    return signature
}

const noopTx = (data: Uint8Array): Transaction => {
    const tx = new Transaction()
    tx.instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 151 }),
        new TransactionInstruction({
        keys: [{
            pubkey: signer.publicKey,
            isSigner: true,
            isWritable: true
        }],
        programId: program,
        data,
    } as TransactionInstructionCtorFields))
    return tx
}

describe('noop tests', () => {
    it('Empty data', async () => {
        const logs = await signAndSend(noopTx(Buffer.alloc(0))).then(confirm).then(log);
    });

    it('Max data', async () => {
        const logs = await signAndSend(noopTx(Buffer.alloc(1021))).then(confirm).then(log)
    });
});