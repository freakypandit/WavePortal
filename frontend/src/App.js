import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
import { Icon } from '@iconify/react';

const App = () => {

  const [ currentAccount, setCurrentAccount ] = React.useState("");
  const [ allWaves, setAllWaves ] = React.useState([]);
  const [ message, setMessage ] = React.useState("");

  //const contractAddress = "0x18b7FA42Ff583bfBe9A463D48406af21372dE4ad";
  const contractAddress = "0x5Ca1Fd32d4909a97BA2C7015614205474c17c9f6";
  const contractABI = abi.abi;

  const checkIfWalletIsConnect = async () => {
    // we have to check if we have access to window.ethereum

    try {
      const { ethereum } = window;
      if(!ethereum) {
        console.log("Make sure you have MetaMask!");
      } else {
        console.log("We have an ethereum Object", ethereum);
      }

      const accounts = await ethereum.request({method : "eth_accounts"});

      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized Account:", account);
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const{ ethereum } = window;

      if(!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const writeMessage = (_message) => {
    //console.log("the value of message is", {message}.message);
    setMessage(_message.target.value);
    console.log("the value of message is", message);
  }
  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const WavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let countOfWaves = await WavePortalContract.getTotalWaves();
        console.log("Retrived total wave count...", countOfWaves.toNumber());
        
        const waveTxn = await WavePortalContract.wave(message, { gasLimit: 3000000 });
        console.log("the value of message is", message);

        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();

        console.log("Mined...", waveTxn.hash);

        countOfWaves = await WavePortalContract.getTotalWaves();
        console.log("Retrived total wave count...", countOfWaves.toNumber());

      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const WavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await WavePortalContract.waveHistory();

        let wavesCleaned=[];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      }
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(() => {
    checkIfWalletIsConnect();
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
        I am Deepak and I am learning blockchain. 
        Find me on twitter: <a href='https://twitter.com/hey_deepak_'>@hey_deepak_</a>
        </div>

        <input className="waveInput" type="text" value={message} onChange={writeMessage} placeholder='say something and get a chance to win $ETH...'/>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
        <button className="connectWallet" onClick={connectWallet}>
          <Icon icon="logos:metamask-icon"/> Connect with MetaMask Wallet
        </button>
        )}
      </div>
      
      <div className="messageContainer">
      {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ background: "linear-gradient(154deg, #02c4fb, #826df3)", marginTop: "16px", padding: "8px"}}>
              <div style={{color: "#fff"}}>Address: {wave.address}</div>
              <div style={{color: "#fff"}}>Time: {wave.timestamp.toString()}</div>
              <div style={{color: "#fff"}}>Message: {wave.message}</div>
            </div>)
        })}
      </div>
      
    </div>
  );
}

export default App;

