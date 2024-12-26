import React, { useState, useEffect } from "react";
import { ethers } from "ethers"; // Import ethers directly
import "./App.css";

// Placeholder for your smart contract's ABI and address
const CONTRACT_ADDRESS = "0xYourSmartContractAddress";
const CONTRACT_ABI = [
  // Add your smart contract ABI here
];

function App() {
  const [account, setAccount] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [contract, setContract] = useState(null);

  // Load the blockchain provider and contract
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        try {
          // Set up the provider using Web3Provider for MetaMask
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner(); // Get the signer (user's wallet)
          const userAccount = await signer.getAddress(); // Get the user's account address
          setAccount(userAccount);

          // Set up the contract instance
          const blockchainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          setContract(blockchainContract);
        } catch (err) {
          console.log("Error connecting to the blockchain: ", err);
        }
      } else {
        alert("Please install MetaMask or another Ethereum wallet extension.");
      }
    };
    loadBlockchainData();
  }, []);

  // Handle donation
  const handleDonation = async () => {
    if (!donationAmount || !contract) return;
    try {
      const transaction = await contract.donate({
        value: ethers.utils.parseEther(donationAmount), // Using parseEther directly from ethers.utils
      });
      await transaction.wait(); // Wait for the transaction to be mined
      alert("Donation successful!");
      setDonationAmount(""); // Clear the input field after donation
    } catch (err) {
      console.log("Error making donation: ", err);
      alert("Donation failed.");
    }
  };

  // Fetch transaction history
  const fetchDonations = async () => {
    if (contract) {
      try {
        const donationHistory = await contract.getDonationHistory();
        setDonations(donationHistory);
      } catch (err) {
        console.log("Error fetching donation history: ", err);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain-Based Disaster Relief Fund</h1>
        {account && <p>Connected as: {account}</p>}
      </header>

      <section className="donate-section">
        <h2>Make a Donation</h2>
        <input
          type="number"
          placeholder="Enter donation amount (ETH)"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
        />
        <button onClick={handleDonation}>Donate</button>
      </section>

      <section className="donations-history">
        <h2>Donation History</h2>
        <button onClick={fetchDonations}>Fetch Donations</button>
        <ul>
          {donations.length > 0 ? (
            donations.map((donation, index) => (
              <li key={index}>
                Donor: {donation.donor}, Amount: {ethers.utils.formatEther(donation.amount)} ETH {/* Using formatEther directly from ethers.utils */}
              </li>
            ))
          ) : (
            <li>No donations yet</li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default App;
