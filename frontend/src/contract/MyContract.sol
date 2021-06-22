// pragma solidity ^0.4.18;

// contract MyContract {
//     uint256 public progress = 0;
//     address public reciver;
//     address public owner;
//     uint256 public balance = 0;
//     uint256 public startDate = 0;
    
//     constructor() public{
//         owner = msg.sender; 
//         startDate = block.timestamp;
//     }
    
//     modifier onlyOwner(){
//         require(msg.sender  == owner);
//         _;
//     }
    
//     function set(uint256 _progress) public onlyOwner {
//         progress = _progress;
//     }
    
//     function fund() public onlyOwner payable {
//         balance += msg.value;
//     }
    
//     function getFund1() public {
//         require(progress > 50);
//         reciver.transfer(balance / 2);
//         balance = balance / 2;
//     }
    
//     function getFund2() public{
//         require(progress == 100);
//         reciver.transfer(balance);
//         balance = 0;
//     }
    
//     function ownerGetBack() public onlyOwner {
//         require(block.timestamp > startDate + 108000);
//         require(progress < 100);
//         owner.transfer(balance);
//         balance = 0;
//     }
// }