import { ethers, parseEther } from "ethers";

// Define the ABI for the JobFactory contract
const JobFactoryABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "picker",
        "type": "address"
      }
    ],
    "name": "createJob",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "picker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "JobCreated",
    "type": "event"
  }
];

// Replace this with your actual contract address after deployment
const FACTORY_ADDRESS = "0xYOUR_JOB_FACTORY_ADDRESS"; 

// Function to interact with the JobFactory contract and create a new job
export const createJob = async (pickerAddress: string, ethAmount: string) => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      // Connect to the Ethereum provider (Metamask)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the signer to sign the transaction

      // Create an instance of the JobFactory contract
      const factoryContract = new ethers.Contract(FACTORY_ADDRESS, JobFactoryABI, signer);

      // Call the createJob function in the contract and pass the picker address and value (amount in ETH)
      const tx = await factoryContract.createJob(pickerAddress, {
        value: parseEther(ethAmount), // Convert ETH to Wei
      });

      // Wait for the transaction to be mined and get the transaction receipt
      const receipt = await tx.wait();

      // Find the 'JobCreated' event and extract the contract address
      const event = receipt.logs.find(
        (log: { fragment: { name: string; }; }) => log.fragment?.name === "JobCreated"
      );

      const contractAddress = event?.args?.contractAddress;
      return contractAddress; // Return the contract address of the created job
    } catch (error) {
      console.error("Error creating job:", error);
      throw new Error("Job creation failed.");
    }
  } else {
    throw new Error("Metamask is not installed or connected.");
  }
};
