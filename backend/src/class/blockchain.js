const CryptoJS = require('crypto-js')
const transaction = require('./transaction');
const transactionPool = require('./transactionPool')
const wallet = require('./wallet')
const Web3 = require('web3')
const web3 = new Web3("http://localhost:8545")
let accounts = []
let genesisTransaction=[]
let genesisBlock=[]
let blockchain = []
let unspentTxOuts = []
let aTransaction =[] 
class Block{
    constructor(index,previousHash,timestamp,transactions,hash,difficulty,nonce){
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

web3.eth.getAccounts().then(result => {
    accounts = result
    genesisTransaction = accounts.map(account => {
        return {
            addressFrom: 'admin',
            addressTo: account,
            amount: 100,
            reward: 0
        }
    })
    genesisBlock = findBlock(0,'',new Date(),genesisTransaction,1)
    blockchain = [genesisBlock]
    
    aTransaction = genesisTransaction
    console.log(blockchain)
})

const calculateHash = (index, previousHash, timestamp, transactions,difficulty, nonce) => CryptoJS.SHA256(index + previousHash + timestamp + transactions + difficulty + nonce).toString();
const calculateHashForBlock = (block) => calculateHash(block.index, block.previousHash, block.timestamp, block.transactions,block.difficulty , block.nonce);
const hashMatchesDifficulty = (hash, difficulty) => {
    // const hashInBinary = hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    // return hashInBinary.startsWith(requiredPrefix);
    return hash.startsWith(requiredPrefix)
};

const findBlock = (index, previousHash, timestamp, transactions, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp.getTime(), transactions, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, previousHash, timestamp, transactions,hash , difficulty, nonce);
        }
        nonce++;
    }
};

const getLatestBlock = () => blockchain[blockchain.length - 1];
const getBlockchain = () => blockchain;
const getAllTransaction = () => aTransaction;

const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

const generateNextBlock = (transactions,miner) => {
    const previousBlock = getLatestBlock();
    const difficulty = getDifficulty(getBlockchain());
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date();
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, transactions, difficulty);
    if (addBlockToChain(newBlock)) {
        // update transaction pool
        transactionPool.clearTransactionPool()
        console.log(unspentTxOuts)
        return newBlock;
        }else {
        return null;
    }

};

const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
const BLOCK_GENERATION_INTERVAL = 1;

const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};

const addBlockToChain = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        // const retVal = transaction.processTransactions(newBlock.transactions, getUnspentTxOuts(), newBlock.index);
        // if (retVal === null) {
        //     console.log('block is not valid in terms of transactions');
        //     return false;
        // } else {
        //     blockchain.push(newBlock);
        //     setUnspentTxOuts(retVal);
        //     transactionPool.updateTransactionPool(unspentTxOuts);
        //     return true;
        // }
        blockchain.push(newBlock);
        transactionPool.updateTransactionPool(unspentTxOuts);
        return true;
    }
    return false;
};


const isValidBlockStructure = (block) => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.transactions === 'object';
};

const isValidTimestamp = (newBlock, previousBlock) => {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp )
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};

const hasValidHash = (block) => {

    // if (!hashMatchesBlockContent(block)) {
    //     console.log('invalid hash, got:' + block.hash);
    //     return false;
    // }

    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
    }
    return true;
};

const hashMatchesBlockContent = (block) => {
    const blockHash = calculateHashForBlock(block);
    // console.log(CryptoJS.SHA256(block.index + block.previousHash + block.timestamp + block.transactions +block.difficulty  + block.nonce).toString())
    // console.log('block hash ' + blockHash)
    console.log(block)
    return blockHash === block.hash;
};

const isValidNewBlock = (newBlock ,previousBlock) => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};

// create 3 transaction pool from transaction
const sendTransaction = (addressFrom,addressTo, amount,reward,currentAmount) => {
    const nTransaction = {addressFrom,addressTo,amount,reward}
    aTransaction.push(nTransaction)
    const txs= wallet.createTransaction(addressFrom, addressTo, amount, reward,currentAmount);
    console.log(txs)
    txs.forEach(tx => transactionPool.addToTransactionPool(tx))
    return txs;
};

module.exports ={
    Block,getLatestBlock,addBlockToChain,getBlockchain,sendTransaction,generateNextBlock,getAllTransaction
}