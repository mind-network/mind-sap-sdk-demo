
# About
A zero-trust stealth address protocol based on CCIP. 

# Installation:
```
git clone https://github.com/mind-network/mind-sap-sdk
cd mind-sap-sdk
yarn install # install depedency package
```

# Demo:
![](/images/chainlink-hackathon-demoflow.png)
### Step 00: Configure test environment 
   1. Create three wallets: Alice, Bob and Charlie. Top up relevant tokens for Alice and Bob on relevant chain for gas fees and transactions.
   2. Copy tests/config_test_template.ts into tests/config_test.ts 
   3. Update tests/config_test.ts with credentials from Alice, Bob and Charlie

### Step 01: Register Bob in MindSAP 
so others (like Alice) can transfer into his stealth address.
```
yarn test-register-bob
yarn test-check-bob-isRegistered # optional
```

### Step 1: EOA to SA bridge transfer
Alice transfers ERC20 (CCIP-BnM) on Ethereum Sepolia from her EOA wallet to Bob stealth address wallet on Polygon Mumbai.
```
yarn test-send-EOA_TO_SA_CCIPBridge
# get txHash and check status on CCIP Explorer
```

### Step 2: Scan to locate and control SA
Bob can scan and fully access into his stealth address wallet on Polygon Mumbai. 
```
yarn test-scan-bob-sa
# note down SA and ciphertext in order to spend in next step.
# check token and amount in SA
```

### Step 3: SA to EOA transfer
Bob can transfer ERC20 (CCIP-BnM) from his stealth address wallet to Charlie's EOA wallet on Polygon Mumbai. Charlie is free to use ERC20 once received
```
# update sa_address and sa_ciphertext value from in tests/send.test.ts/SA_TO_EOA_MUMBAI
yarn test-send-SA_TO_EOA_MUMBAI
# note down txHash in result and validate on PolygonScan
# check Charlie's MetaMask wallet to see if token is received
```