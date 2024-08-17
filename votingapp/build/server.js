import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';

// Load service account JSON
const serviceAccount = JSON.parse(fs.readFileSync('./votinginblockchain.json', 'utf8'));

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://votinginblockchain.firebaseio.com' // Replace with your Firebase database URL
});

const db = admin.firestore(); // Use Firestore database

const provider = new ethers.providers.JsonRpcProvider('http://localhost:7545'); // Change this to your Ganache URL if different

const privateKey = '0x853d220e53993d6ab4d6c81f4da9bb59d177d721189e91545d7daab7450eab39'; // Replace with the private key from Ganache or another wallet
const wallet = new ethers.Wallet(privateKey, provider);

const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "VotedEvent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "candidatesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "voteCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

const contractAddress = '0xfDF08D1E744eE59f027084e24F5Bf9dd3fC8786e'; // Replace with your contract address
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

app.post('/vote', async (req, res) => {
  const { candidateId } = req.body;

  try {
      const tx = await contract.vote(candidateId);
      await tx.wait(); // Wait for the transaction to be mined

      // Get the UTC timestamp
      const utcTimestamp = admin.firestore.Timestamp.now();

      // Convert the UTC timestamp to IST
      const istTimestamp = new Date(utcTimestamp.toDate().getTime() + (5.5 * 60 * 60 * 1000));

      // Update Firebase with the new vote and IST timestamp
      const candidateRef = db.collection('votes').doc(candidateId.toString());
      await candidateRef.set({
          candidateId: candidateId,
          timestamp: istTimestamp
      });

      res.send('Vote cast successfully');
  } catch (error) {
      res.status(500).send(error.toString());
  }
});

app.setMaxListeners(20);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
