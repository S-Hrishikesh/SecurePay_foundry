## SecurePay 🚀

SecurePay is a decentralized subscription platform built for the NeuralDao Hackathon. It empowers creators to launch subscription-based services on-chain while providing users with a secure, transparent way to manage their recurring payments.

## 📖 Our Story: From Hackathon Chaos to "Eureka!"

Our story began in the creative chaos of the NeuralDao Hackathon. We were four friends, diving headfirst into the wild world of blockchain with more enthusiasm than experience. Our big idea, SecurePay, sounded so cool, so revolutionary! Little did we know we were signing up for a rollercoaster of laughter, late-night debugging, and a few moments of wanting to throw our computers out the window.

We began our quest with Hardhat but, after a few good laughs at our own confusion, made a game-changing pivot to Foundry. It just felt right—fast, intuitive, and fun. With our MetaMask wallets filled with free test POL from the Amoy faucet, we started forging our masterpiece in Solidity: the SubscriptionManager contract. The feeling of deploying it to the Polygon Amoy testnet with a forge script command was pure joy. Our code was alive, a real entity on the blockchain!

Then came the frontend, our beautiful React + Vite app. This is where the real adventure began. We battled bewildering "silent reverts," where MetaMask would cheer "Success!" but our plans would vanish. The "Aha!" moment came from digging into Polygonscan to find that hidden "revert reason" was a true victory, quickly followed by the hilarious realization that a simple browser cache was our nemesis. We didn't just build a project; we wove in Firebase for Google logins, built a history page for a sense of permanence, and created an analytics dashboard with Recharts that felt like a real, professional product.

SecurePay is more than a project; it's the story of our journey from curious novices to confident builders. It’s a testament to friendship, resilience, and the sheer fun of creating something new in a world that’s being built right before our eyes.

## 🛠 Tech Stack

Smart Contracts: Solidity (v0.8.20+)

Framework: Foundry

Network: Polygon Amoy Testnet

Frontend: React, Vite, Ethers.js

Database & Auth: Firebase (Google Auth, Firestore)

Data Visualization: Recharts


## 🚀 Getting Started

## 1) Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## 2)Node.js installed.

## 3)MetaMask with Polygon Amoy Testnet configured.


## Backend Setup

Install dependencies: forge install

Compile contracts: forge build

Deploy: forge script script/Deploy.s.sol:DeployScript --rpc-url $AMOY_RPC_URL --broadcast --verify


## Frontend Setup

Navigate to the folder: cd subscription-frontend-vite

Install dependencies: npm install

Run local server: npm run dev


## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
