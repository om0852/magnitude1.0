'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';

export default function WalletSection() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        // Create a Web3 instance
        const web3 = new Web3(window.ethereum);
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
        
        // Fetch balance
        fetchBalance(account, web3);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const fetchBalance = async (account, web3) => {
    const balance = await web3.eth.getBalance(account);
    setBalance(web3.utils.fromWei(balance, 'ether')); // Convert balance from Wei to Ether
  };

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalance(accounts[0], web3);
        }
      }
    };
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wallet Section</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {account ? (
            <div>
              <p className="text-lg">Connected Account: {account}</p>
              <p className="text-lg">Balance: {balance} ETH</p>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect MetaMask
            </button>
          )}
        </>
      )}
    </div>
  );
} 