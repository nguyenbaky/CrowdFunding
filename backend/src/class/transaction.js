const Web3 = require('web3')
const web3 = new Web3("http://localhost:8545")

class Transaction{
    constructor(addressFrom, addressTo, amount,signature) {
        this.addressFrom = addressFrom;
        this.addressTo = addressTo;
        this.amount = amount;
        this.signature=signature
    }
}


module.exports = {
    Transaction
}