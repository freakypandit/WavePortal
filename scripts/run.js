const { messagePrefix } = require("@ethersproject/hash");
const { expect } = require("chai");
const { ethers } = require("hardhat")

const main = async() => {
   const [owner, randomAddr1, randomAddr2] = await ethers.getSigners();
   const WaveContractFactory = await ethers.getContractFactory("WavePortal");
   const WaveContract = await WaveContractFactory.deploy({
      value: ethers.utils.parseEther("0.1"),

   });

   await WaveContract.deployed();

   console.log("The smart contract is deployed on %s", WaveContract.address);
   console.log("The smart contract is deployed by %s", owner.address);

   let contractBalance = await ethers.provider.getBalance(WaveContract.address);
   console.log("Contract Balance", ethers.utils.formatEther(contractBalance));

   let randomNumber = await WaveContract.fulfillRandomness(await WaveContract.getRandomNumber());
   if(randomNumber % 20 == 0) console.log("Hey well Done!");

   let totalWaves=0;

   totalWaves = await WaveContract.getTotalWaves();

   console.log("The total number of waves are %s", totalWaves);
   
   let waveTxn =  await WaveContract.connect(randomAddr1).wave("Hey there !");
   let waveTxn2 =  await WaveContract.connect(randomAddr2).wave("hi there, how are you?");
   //let waveTxn =  await WaveContract.wave(10);
   
   //sanity check for self wave
   
   //expect(await waveTxn).to.be.revertedWith("Are you Nuts, stop waving at the mirror.");

   await waveTxn.wait();
   await waveTxn2.wait();

   totalWaves = await WaveContract.getTotalWaves();

   console.log("The total number of waves are %s, previous waves are listed below", totalWaves);
   
   contractBalance = await ethers.provider.getBalance(WaveContract.address);
   console.log("Contract Balance", ethers.utils.formatEther(contractBalance));


   let waveLogs = await WaveContract.waveHistory();
   console.log(waveLogs);

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