import axios from 'axios'
import React,{useState,useEffect} from 'react'
import { useHistory } from "react-router-dom";
import {CONTRACTADDRESS,CONTRACTABI} from '../../env'
const Web3 = require('web3')

const URL = 'http://localhost:5000'

const Dashboard = (props) => {
    const web3 = new Web3("http://localhost:8545")
    let browserHistory = useHistory()
    const [address,setAddress] = useState(props.location.state.address)
    const [privateKey,setPrivateKey] = useState(props.location.state.privateKey)
    const [transactionPool,setTransactionPool] = useState([])
    const [blockchain,setBlockchain] = useState([])
    const [balance,setBalance] = useState(0)
    const [history,setHistory] = useState([])
    const [amount,setAmount] = useState(0)
    const [reciever,setReciever] = useState('')
    const [reward,setReward] = useState(2)
    const [send,setSend] = useState('Send')
    const [searchAddress,setSearchAddress] = useState('')
    const [searchHistory,setSearchHistory] = useState([])
    const [isSearch,setIsSearch] = useState(false)
    const [investAmount,setInvestAmount] = useState(0)
    const [contractBalance,setContractBalance] = useState(1)
    const [progress,setProgress] = useState(1)
    const [isInvestor,setIsinVestor] = useState(false)
    const [isStartUp,setIsStartUp] = useState(false)
    const contract = new web3.eth.Contract(CONTRACTABI,CONTRACTADDRESS)

    const getMoney = ()=>{
        web3.eth.getAccounts().then(result => {
            let account = result[0]
            console.log(account)
            contract.methods.getFund().send({from:account},async function(err,result){
                if(err) console.log(err)
                console.log('get Money')
                console.log(privateKey)
                await axios.post(`${URL}/sendTransaction`,{
                    addressFrom:CONTRACTADDRESS,
                    addressTo:address,
                    amount:contractBalance,
                    privateKey:privateKey
                }).then(result => {
                    console.log('11111')
                    console.log(result)
                })
                await axios.post(`${URL}/mineBlock`,{miner : address})
                .then(response => {
                    console.log(response)
                    fetchHistory()
                })
                fetchBalance()
                fetchContractBalance()
                alert('Get money success')
            })
           
        })      
    }

    const sendTransaction = () => {
        const check = transactionPool.filter(tx => tx.addressFrom === address)
        if(check.length > 0) {
            alert('Wating for transaction completed')
            return
        }
        if(amount === 0) {
            alert('Amount need to greater than 0')
            return
        }
        if(reciever === ''){
            alert('Select reciver')
            return
        }
        if(parseInt(balance) < parseInt(amount) + parseInt(reward)){
            alert('Not enough balance')
            return
        }

        setSend('Sending ...')
        console.log(typeof(amount))
        // web3.eth.sendTransaction({to:reciever,from:address,value:web3.utils.toWei(amount,"ether")}).then(result=>{
        //     fetchBalance()
        //     console.log(result)
        // })

        
        axios.post(`${URL}/sendTransaction`,{
            addressFrom:address,
            addressTo:reciever,
            amount,
            privateKey:privateKey
        }).then(response =>{
            console.log(response)
            fetchTransactionPool()
        })


    }
    
    const invest = ()=>{
        console.log('Investing ... ')
        console.log(address)
        web3.eth.sendTransaction({
                from:address,
                to:CONTRACTADDRESS,
                data: web3.eth.abi.encodeFunctionSignature('fund()'),
                value:web3.utils.toWei(investAmount, "ether")
            })
            .then((err,result) => {
            if(err) console.log(err)
            console.log("result: " + result)
            fetchBalance()
            fetchContractBalance()
            setInvestAmount(0)
        })
    }

    const update = () => {
        console.log('Update progress ...')

        contract.methods.set(parseInt(progress)).send({from:address},function(err,result){
            if(err) alert(err)
            else console.log('result: '+ result)
        })
        fetchBalance()
    }

    const mineBlock = () => {
        if(transactionPool.length === 0){
            alert('No transaction to mine')
            return
        }

        axios.post(`${URL}/mineBlock`,{miner : address})
        .then(response => {
            console.log(response)
            fetchBlocks()
            fetchHistory()
            fetchBalance()
            setTransactionPool([])
            setSend('Send')
        })
    }

    const fetchTransactionPool = () => {
        axios.get(`${URL}/transactionPool`)
        .then(response=>{
            setTransactionPool(response.data)
        })
    }

    const fetchBlocks = () => {
        axios.get(`${URL}/blocks`)
        .then(response=>{
            setBlockchain(response.data)
        })
    }

    const fetchBalance = () => {
        web3.eth.getBalance(address,(err,result) => {
            if(err){
                console.log('err: ' + err)
            }else{
                const eth = web3.utils.fromWei(result, "ether")
                setBalance(eth)
            }
        })
    }

    const fetchHistory = () => {
        axios.get(`${URL}/history/${address}`)
        .then(response => {
            console.log('history')
            console.log(response.data)
            setHistory(response.data)
        })
    }

    const fetchSearchHistory = (a) => {
        if(a == ''){
            alert('input search address')
            return
        }
        console.log(`${URL}/history/${a}`)
        axios.get(`${URL}/history/${a}`)
        .then(response => {
            setSearchHistory(response.data)
            setIsSearch(true)
            console.log(searchHistory)
        })
    }

    const fetchContractBalance = () =>{
        web3.eth.getBalance(CONTRACTADDRESS).then(res => {
            setContractBalance(web3.utils.fromWei(res,'ether'))
        })
    }

    const fetchProgress = () => {
        console.log('123')
        contract.methods.getProgress().call(function(err,res){
            if(err) console.log(err)
            console.log(res)
            setProgress(res)
        })
    }

    useEffect(async() =>{
        if(!address){
            browserHistory.push({pathname:'/'})
            return
        }
        web3.eth.getAccounts().then(result => {
            let accounts = result
            if(accounts[0] === address)
                setIsinVestor(true)
        })
        if(address === '0x6AAc7F545312d4202d72DAeA39daCF3f05aC3223') setIsStartUp(true)
        fetchBlocks()
        fetchBalance()
        fetchHistory()
        fetchTransactionPool()
        fetchContractBalance()
        fetchProgress()
        web3.eth.defaultAccount = address
        console.log(contract)        
    },[])


    return (
        <div className='container-fluid' style={{marginTop:'15px',marginLeft:'20px',marginRight:'50px'}}>
            <div className='row'>
                <div className='col-sm-8'>
                    <div className='row'>
                        <div className='col-sm-6'>
                            <div className="card">
                                <span className="text-center">
                                    <h2>Address</h2>
                                    <p>{address}</p>
                                </span>
                                <div className="card-body">
                                    <h5 className="card-title text-center">
                                        Balance: {balance}
                                    </h5>
                                    <div style={{textAlign:'center'}}>
                                        <button className='btn btn-primary' data-toggle='modal' data-target='#History' style={{margin:'10px'}}>Show history</button><br/>
                                        <button className='btn btn-primary' data-toggle='modal' data-target='#PrivateKey' >Export Key</button>
                                        {/* history modal */}
                                        <div class="modal fade" id="History" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div class="modal-dialog" role="document">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="exampleModalLabel">History</h5>
                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <div class="modal-body">
                                                        { history.map(item => (
                                                            item.addressFrom === address ? 
                                                            <p>Send {item.amount} coins to {item.addressTo} </p>:
                                                            <p>Recieve {item.amount} coins from {item.addressFrom}</p>
                                                        )) }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    
                                         {/* Private key */}
                                        <div class="modal fade " id="PrivateKey" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div class="modal-dialog" role="document">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="exampleModalLabel">PrivateKey</h5>
                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        {privateKey}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>   

                                </div>
                            </div>
                        </div>
                        <div className='col-sm-6'>
                            <div className="card">
                                <span className="text-center">
                                    <h2>Reciept</h2>
                                </span>
                                <div className="card-body">
                                    <p>Select user</p>
                                    <input style={{width:'100%' ,textAlign:'right'}} value={reciever} onChange={(e) => setReciever(e.target.value)}></input>
                                    <p>Amount</p>
                                    <input style={{width:'100%' ,textAlign:'right'}} value={amount} onChange={(e) => setAmount(e.target.value)}></input>
                                    <p>Gas</p>
                                    <input style={{width:'100%' ,textAlign:'right'}} value={reward} onChange={(e) => setReward(e.target.value)}></input><br/>
                                    <button className='btn btn-primary' style={{marginTop:'5px',float:'right'}} onClick={sendTransaction} >{send}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='row' style={{marginTop:'10px'}}>
                        <div className='col-sm-6'>
                            <div className="card">
                                <span className="text-center">
                                    <h2>History</h2>
                                </span>
                                <div className="card-body">
                                    {/* History here */}
                                    <p>Address :</p>
                                    <div>
                                        <input style={{width:'90%',textAlign:'right'}} value={searchAddress} onChange={(e)=> setSearchAddress(e.target.value)}></input>
                                        <button type="submit" style={{width:'10%'}} onClick={()=>fetchSearchHistory(searchAddress)}><i className="fa fa-search"></i></button>
                                    </div>
                                    {
                                        isSearch && searchHistory.length == 0 && <p style={{fontSize:'22px',fontWeight:'bold',textAlign:'center'}}>No history found</p>
                                    }
                                    {   searchHistory.length > 0 && 
                                        <div style={{margin:'20px',fontSize:'20px'}}>
                                            {searchHistory.map(item => (
                                                item.addressFrom === address ? 
                                                <p>Send {item.amount} coins to {item.addressTo} </p>:
                                                <p>Recieve {item.amount} coins from {item.addressFrom}</p>
                                            ))}
                                        </div>
                                    }
                                </div>
                            </div>
                            
                        </div>
                        <div className='col-sm-6'>
                            <div className="card">
                                <span className="text-center">
                                    <h2>Fund Contract</h2>
                                    <p>{CONTRACTADDRESS}</p>
                                </span>
                                <div className="card-body" style={{fontSize:'20px'}}>
                                    <p>Total Fund: {contractBalance} coins
                                    </p>
                                    <p>Progress: {progress}</p>
                                    {isInvestor && 
                                        <>
                                            <input style={{width:'72%',textAlign:'right'}} value={investAmount} onChange = {(e)=> setInvestAmount(e.target.value)}></input>
                                            <button className='btn btn-primary' style={{float:'right',width:'25%',marginLeft:'5px'}} onClick={()=>invest()}>Invest</button>
                                            <p>Set Progress: </p>
                                            <input style={{width:'72%',textAlign:'right'}} value={progress} onChange={(e)=>setProgress(e.target.value)}></input>
                                            <button className='btn btn-primary' style={{float:'right',width:'25%',marginLeft:'5px'}} onClick={()=>update()}>Update</button>
                                        </>
                                    }
                                    {
                                        isStartUp && contractBalance > 0 && progress >= 50 &&
                                        <>
                                            <button className='btn btn-primary' onClick={()=>getMoney()}>Get Money</button>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>   
                                                            
                    </div>
                </div>

                <div className='col-sm-4'>
                    <div className="card">
                        <span className="text-center">
                            <h2>Transaction pool</h2>
                        </span>
                        <div className="card-body">
                            {
                               transactionPool.map(item => (
                                <div className='border' style={{padding:'5px',width:'100%',marginBottom:'10px'}} >
                                    <p>From: {item.addressFrom}</p>
                                    <p>To: {item.addressTo}</p>
                                    <p>Amount: {item.amount}</p>
                                    <p>Gas used: {item.reward}</p>
                                </div>
                               ))
                            }
                            <button className='btn btn-primary' style={{float:'right'}} onClick={mineBlock}>Mine</button>
                        </div>
                    </div>
                </div>
            </div>
                   
        </div>
    )
}

export default Dashboard