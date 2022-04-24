// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

   //randomness
   uint256 private seed;

   uint256 totalWaves;
   address public owner;

   event NewWave(address indexed from, uint256 timestamp, string message);

   struct Wave {
      address waver;
      string message;
      uint256 timestamp;
   }

   Wave[] waves;

   mapping(address => uint256) public lastWavedAt;


   constructor() payable{
      console.log("Yo yo, I am a contract and I am smart");
      owner = msg.sender;

      seed = (block.timestamp + block.difficulty) % 100;
   }

   function wave(string memory _message)  public {
      require(msg.sender != owner, "Are you Nuts, stop waving at the mirror.");
      
      /*
      * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
      */
      require(
         lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
         "Wait 15m"
      );

      /*
      * Update the current timestamp we have for the user
      */
      lastWavedAt[msg.sender] = block.timestamp;

      totalWaves += 1;
      console.log("Congratulations you just received a wave from %s with message %s", msg.sender, _message);

      //push to the array of structs
      waves.push(Wave(msg.sender, _message, block.timestamp));

      seed = (block.difficulty + block.timestamp + seed) % 100;

      console.log("Random # generated: %d", seed);

      /*
       * Give a 50% chance that the user wins the prize.
      */
      if (seed <= 50) {
         console.log("%s won!", msg.sender);

         uint256 prizeAmount = 0.0001 ether;
         require(
            prizeAmount <= address(this).balance, "Trying to withdraw more money then the contract has"
         );

         (bool success, ) = (msg.sender).call{value: prizeAmount}("");
         console.log(success);
         require(success, "Failed to withdraw the money");
      }

      //emit
      emit NewWave(msg.sender, block.timestamp, _message);

   }

   function getTotalWaves() public view returns(uint256) {
      return totalWaves;
   }

   function waveHistory() public view returns(Wave[] memory){
      return waves;
   }
}