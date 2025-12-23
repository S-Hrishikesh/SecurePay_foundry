import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0x0D4Ef814D925dea5425A7112ee997C910e1c85E7";
const contractABI = [ /* your SubscriptionManager ABI JSON here */ ];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  // Connect Metamask wallet
  async function connectWallet() {
    if(window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = prov.getSigner();
      setProvider(prov);
      setSigner(signer);
      const addr = await signer.getAddress();
      setAccount(addr);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);
    } else {
      alert("Please install Metamask");
    }
  }

  // Example: call a contract view function
  async function getPlans() {
    if(!contract) return;
    const plansCount = await contract.nextPlanId();
    console.log("Total plans:", plansCount.toString());
  }

  useEffect(() => {
    if(contract) {
      getPlans();
    }
  }, [contract]);

  return (
    <div>
      <h1>Subscription Manager</h1>
      {!account && <button onClick={connectWallet}>Connect Wallet</button>}
      {account && <p>Connected as: {account}</p>}
      {/* Add more UI here for createPlan, subscribe, renew, etc */}
    </div>
  );
}

export default App;
