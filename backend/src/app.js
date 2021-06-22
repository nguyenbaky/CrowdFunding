const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const transactionPool = require('./class/transactionPool')
const blockchain =  require('./class/blockchain');
const transaction = require('./class/transaction')

const app = express()
const PORT = process.env.PORT || 5000

const Web3 = require('web3')
const web3 = new Web3("http://localhost:8545")

app.use(express.json())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
app.use(cors())

//get blockchain
app.get('/blocks',(req,res)=>{
    res.send(blockchain.getBlockchain())
})

app.get('/history/:address',(req,res)=>{
    const blocks = blockchain.getBlockchain()
    console.log('history')
    console.log(blocks)
    let result = []
    const {address} = req.params
    // all transaction
    blocks.forEach(element => {
        let result1 = element.transactions.filter(item => {
            return (item.addressFrom === address || item.addressTo === address)
        })
        result1.forEach(item => result.push(item))
    });
    console.log(result)
    res.send(result)
})

// mine block with transaction in pool
app.post('/mineBlock', (req, res) => {
    const {miner} = req.body
    const transactions = transactionPool.getTransactionPool()
    const newBlock = blockchain.generateNextBlock(transactions,miner);
    if (newBlock === null) {
        res.status(400).send('could not generate block');
    } else {
        res.send(newBlock);
    }
});

// send transaction to pool
app.post('/sendTransaction', async(req,res) => {
    try {
        const {addressFrom, addressTo, amount,privateKey} = req.body
        if (addressFrom === undefined || amount === undefined || addressTo === undefined) {
            throw Error('invalid information');
        }
        // web3.eth.getBalance(addressFrom,(err,result) => {
        //     if(err){
        //         console.log('err:' + err)
        //     }else{
        //         eth = web3.utils.fromWei(result, "ether")
        //         console.log(eth)
        //     }
        // })
        console.log(privateKey)
        const tx = {
            from: addressFrom,
            to: addressTo,
            value: amount,
            gas: 21000,
            gasPrice: 20000000000,
            data: ''
        }
        let signobj =  web3.eth.accounts.sign(tx.toString(), privateKey)
        console.log('result '+signobj.signature)
        const Tx = new transaction.Transaction(addressFrom,addressTo,amount,signobj.signature)
        console.log(Tx)
        transactionPool.addToTransactionPool(Tx)
        console.log(transactionPool.getTransactionPool())
        res.send('Add transaction to pool')
    } catch (e) {
        console.log(e.message);
        res.status(400).send(e.message);
    }
})

// get transaction pool
app.get('/transactionPool', (req,res) => {
    res.send(transactionPool.getTransactionPool())
})

app.listen(PORT, () => {
    console.log('Listenning on port: '+ PORT)
})