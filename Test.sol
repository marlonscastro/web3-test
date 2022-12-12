// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Test {
    uint public counter = 0;
    function count(uint inc) external returns(bool){
        counter = counter + inc;
        return true;
    }
    
    function getCount() public view returns(uint){
        return counter;
    }
}

// 0x406FF89AEEdb514c35161440Ab6760b14928F5F1
