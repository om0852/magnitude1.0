'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

export const Web3Integration = ({ ride, onPaymentComplete }) => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [hover, setHover] = useState(null);

    useEffect(() => {
        initializeWeb3();
        checkTransactionStatus();
    }, [ride.rideId]);

    const checkTransactionStatus = async () => {
        try {
            const response = await axios.get(`/api/transactions/${ride.rideId}`);
            if (response.data.success) {
                setTransactionStatus(response.data.data.status);
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
        }
    };

    const initializeWeb3 = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                // Request account access
                await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });

                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    setAccount(accounts[0]);
                });

                // Listen for chain changes
                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                });
            } else {
                toast.error('Please install MetaMask to use this feature');
            }
        } catch (error) {
            console.error('Web3 initialization error:', error);
            toast.error('Failed to connect to MetaMask');
        }
    };

    const storeTransaction = async (transactionData) => {
        try {
            // Convert BigInt values to strings
            const formattedData = {
                rideId: ride.rideId,
                fromAddress: account,
                toAddress: ride.driverDetails.walletAddress,
                amount: ride.estimatedFare.toString(),
                transactionHash: transactionData.transactionHash,
                status: 'completed',
                gasUsed: transactionData.gasUsed.toString(), // Convert BigInt to string
                blockNumber: Number(transactionData.blockNumber) // Convert to regular number
            };

            const response = await axios.post('/api/transactions', formattedData);

            if (response.data.success) {
                setTransactionStatus('completed');
                toast.success('Transaction details stored successfully!', {
                    duration: 3000,
                    icon: '📝',
                });
            } else {
                throw new Error(response.data.error || 'Failed to store transaction');
            }
        } catch (error) {
            console.error('Error storing transaction:', error);
            toast.error('Failed to store transaction details: ' + (error.response?.data?.error || error.message));
            throw error;
        }
    };

    const submitRating = async () => {
        try {
            const response = await axios.post(`/api/rides/${ride.rideId}/rate`, {
                rating,
                feedback
            });

            if (response.data.success) {
                toast.success('Thank you for your feedback! Redirecting...', {
                    duration: 3000,
                });
                
                // Check user role from session
                const userResponse = await axios.get('/api/auth/me');
                const userRole = userResponse.data.role;
                
                // Wait for toast to be visible before redirecting
                setTimeout(() => {
                    // Redirect based on user role
                    if (userRole === 'driver') {
                        window.location.href = '/driver/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                }, 2000);
                
                setShowRating(false);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Failed to submit rating. Please try again.');
        }
    };

    const makePayment = async () => {
        try {
            setLoading(true);
            console.log('Starting payment process...');

            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            if (!ride.driverDetails?.walletAddress) {
                throw new Error('Driver wallet address not found');
            }

            // Ensure we have the latest account
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            const currentAccount = accounts[0];

            // Convert fare from rupees to ETH
            const ETH_PRICE_IN_RUPEES = 150000; // You should fetch this from an API
            const fareInEth = (parseFloat(ride.estimatedFare) / ETH_PRICE_IN_RUPEES).toFixed(18);
            console.log('Fare in Rupees:', ride.estimatedFare);
            console.log('Fare in ETH:', fareInEth);

            // Convert ETH to Wei using BigNumber to handle decimals properly
            const fareWei = web3.utils.toWei(fareInEth, 'ether');
            console.log('Payment amount (Wei):', fareWei);
            console.log('To address:', ride.driverDetails.walletAddress);
            console.log('From address:', currentAccount);

            // Convert Wei to hex for the transaction
            const valueInHex = web3.utils.toHex(fareWei);
            console.log('Value in Hex:', valueInHex);

            // Prepare transaction parameters
            const transactionParameters = {
                to: ride.driverDetails.walletAddress,
                from: currentAccount,
                value: fareWei,
                gas: web3.utils.toHex(2100000), // Basic ETH transfer gas limit
            };

            // Send transaction using window.ethereum directly
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });

            console.log('Transaction hash:', txHash);
            toast.success('Transaction initiated! Waiting for confirmation...', {
                duration: 10000,
                icon: '⏳'
            });

            // Wait for transaction receipt
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            console.log('Transaction receipt:', receipt);
            
            // Store transaction details with original rupee amount
            await storeTransaction({
                transactionHash: txHash,
                gasUsed: receipt.gasUsed,
                blockNumber: receipt.blockNumber
            });
            
            toast.success(`Payment of ₹${ride.estimatedFare} completed successfully!`, {
                duration: 5000,
                icon: '💰',
            });

            setShowRating(true); // Show rating UI after payment

            if (onPaymentComplete) {
                onPaymentComplete();
            }
        } catch (error) {
            console.error('Payment error:', error);
            
            let errorMessage = 'Payment failed: ';
            if (error.code === 4001) {
                errorMessage += 'Transaction rejected by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage += 'Insufficient funds in wallet';
            } else if (error.message.includes('MetaMask is not installed')) {
                errorMessage += 'Please install MetaMask';
            } else if (error.message.includes('Driver wallet address not found')) {
                errorMessage += 'Driver wallet address not found';
            } else {
                errorMessage += error.message || 'Please check your wallet connection and try again';
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Update the button text to show both Rupee and ETH amounts
    const getPaymentButtonText = () => {
        if (loading) return 'Processing...';
        const ETH_PRICE_IN_RUPEES = 150000; // Should match the rate used in makePayment
        const ethAmount = (parseFloat(ride.estimatedFare) / ETH_PRICE_IN_RUPEES).toFixed(6);
        return `Pay ₹${ride.estimatedFare} (${ethAmount} ETH)`;
    };

    // Don't show payment section if transaction is already completed
    if (transactionStatus === 'completed') {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <h3 className="text-xl font-semibold mb-2 text-green-900">
                        Payment Completed
                    </h3>
                    <p className="text-green-700">
                        The payment for this ride has been successfully processed.
                    </p>
                </div>

                {showRating && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 mt-4">
                        <h3 className="text-xl font-semibold mb-4">Rate Your Driver</h3>
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={ratingValue}
                                        className={`text-2xl mr-2 focus:outline-none transition-colors duration-200 ${
                                            (hover || rating) >= ratingValue
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                        onClick={() => setRating(ratingValue)}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(null)}
                                    >
                                        <FaStar />
                                    </button>
                                );
                            })}
                        </div>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                            placeholder="Share your experience (optional)"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows="3"
                        />
                        <button
                            onClick={submitRating}
                            disabled={!rating}
                            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Submit Rating
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-xl font-semibold mb-4 text-purple-900">
                    MetaMask Payment
                </h3>
                
                {!account ? (
                    <button
                        onClick={initializeWeb3}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
                    >
                        Connect MetaMask
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Connected Account: {account.slice(0, 6)}...{account.slice(-4)}
                        </p>
                        
                        <button
                            onClick={makePayment}
                            disabled={loading || !ride.driverDetails?.walletAddress}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {getPaymentButtonText()}
                        </button>
                        
                        {!ride.driverDetails?.walletAddress && (
                            <p className="text-sm text-red-600">
                                Driver's wallet address not available
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Web3Integration; 