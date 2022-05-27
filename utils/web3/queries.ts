import * as web3 from '@solana/web3.js';
import { Connection, programs } from '@metaplex/js';

const { metadata: { Metadata } } = programs;

export function createConnection(url = web3.clusterApiUrl('devnet')) {
    if (url === 'devnet') {
        url = web3.clusterApiUrl('devnet');
    }
    return new web3.Connection(url, "confirmed");
}


export async function getBalance(address: string) {

    const connection = createConnection(process.env.NEXT_PUBLIC_SOL_ENV!)

    const balance = await connection.getBalance(new web3.PublicKey(address));

    return balance / 1000000000;

}

export async function fetchNFTMetadata(mint: string) {

    const connection = createConnection(process.env.NEXT_PUBLIC_SOL_ENV!)

    const pda = await Metadata.getPDA(mint);

   
    const onchain = await Metadata.load(connection, pda);

    const metadataExternal = await fetch(onchain.data.data.uri).then((res) => res.json())
    
    return metadataExternal;

}