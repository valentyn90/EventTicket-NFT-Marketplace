import * as web3 from '@solana/web3.js';

function createConnection(url = web3.clusterApiUrl('devnet')) {
    if(url === 'devnet') {
        url = web3.clusterApiUrl('devnet');
    }
    return new web3.Connection(url);
  }

export async function getBalance(address: string){

    const connection = createConnection(process.env.NEXT_PUBLIC_SOL_ENV!)

    const balance = await connection.getBalance(new web3.PublicKey(address));
    
    return balance/1000000000;

}