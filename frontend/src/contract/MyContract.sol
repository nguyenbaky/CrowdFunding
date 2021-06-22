pragma solidity >=0.4.0 <0.7.0;

contract MyContract {
    uint256 public progress = 0;
    address payable public reciver = 0x6AAc7F545312d4202d72DAeA39daCF3f05aC3223;
    address payable public owner;
    uint256 public balance = 0;
    uint256 public startDate = 0;
    
    constructor() public{
        owner = msg.sender; 
        startDate = block.timestamp;
    }
    
    modifier onlyOwner(){
        require(msg.sender  == owner);
        _;
    }
    
    function set(uint256 _progress) public onlyOwner {
        progress = _progress;
    }
    
    function getProgress() public view returns(uint256){
        return progress;
    }
    
    function getBalance() public view returns(uint256){
        return balance;
    }
    
    function fund() public onlyOwner payable {
        balance += msg.value;
    }
    
    
    function getFund() public {
        require(progress == 100);
        reciver.transfer(balance);
        balance = 0;
    }
    
    function ownerGetBack() public onlyOwner {
        require(block.timestamp > startDate + 108000);
        require(progress < 100);
        owner.transfer(balance);
        balance = 0;
    }
}