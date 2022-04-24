const { expect } = require("chai");
const { ethers } = require("hardhat")

const main = async() => {
   const [deployer] = await ethers.getSigners();
   const accountBalance = await deployer.getBalance();

   console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

   const WaveContractFactory = await ethers.getContractFactory("WavePortal");
   const WaveContract = await WaveContractFactory.deploy({
      value: ethers.utils.parseEther("0.001"),
   });

   await WaveContract.deployed();

   console.log("The smart contract is deployed on %s", WaveContract.address);
   //let randomNumber = await WaveContract.fulfillRandomness(await WaveContract.getRandomNumber());
   //if(randomNumber % 20 == 0) console.log("Hey well Done!");

};

const runMain = async() => {
   try {
      await main();
      process.exit(0);
   } catch (error) {
      console.log(error);
      process.exit(1);
   } 
};

runMain();