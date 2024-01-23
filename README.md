# Second Assignment

## Description

Compiling and deploying and also calling contract methods

## Compile.js

```
const fs = require("fs").promises;
const solc = require("solc");

async function main() {
  const sourceCode = await fs.readFile("Demo.sol", "utf8");
  const { abi, bytecode } = compile(sourceCode, "Demo");
  const artifact = JSON.stringify({ abi, bytecode }, null, 2);
  await fs.writeFile("Demo.json", artifact);
}

function compile(sourceCode, contractName) {
  const input = {
    language: "Solidity",
    sources: { main: { content: sourceCode } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };
  const output = solc.compile(JSON.stringify(input));
  const artifact = JSON.parse(output).contracts.main[contractName];
  return {
    abi: artifact.abi,
    bytecode: artifact.evm.bytecode.object,
  };
}

main()
```

## index.js

Explain how users can use your project. Provide examples, if possible.

```
const fs = require("fs");
const { abi, bytecode } = JSON.parse(fs.readFileSync("Demo.json"));

async function main() {
  // Configuring the connection to an Ethereum node
  const network = ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${INFURA_API_KEY}`,
    ),
  );
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    '0x' + SIGNER_PRIVATE_KEY,
  );
  web3.eth.accounts.wallet.add(signer);

  // Using the signing account to deploy the contract
  const contract = new web3.eth.Contract(abi);
  contract.options.data = bytecode;
  const deployTx = contract.deploy();
  const deployedContract = await deployTx
    .send({
      from: signer.address,
      gas: await deployTx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining deployment transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`);
  console.log(
    `Add DEMO_CONTRACT to the.env file to store the contract address: ${deployedContract.options.address}`,
  );
}

main();
```

## Call
```
  const fs = require("fs");
const { abi } = JSON.parse(fs.readFileSync("Demo.json"));

async function main() {
  const network = ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${INFURA_API_KEY}`,
    ),
  );
  const signer = web3.eth.accounts.privateKeyToAccount(
    "0x" + SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);
  const contract = new web3.eth.Contract(
    abi,
    DEMO_CONTRACT,
  );
  const method_abi = contract.methods.echo("Hello, world!").encodeABI();
  const tx = {
    from: signer.address,
    to: contract.options.address,
    data: method_abi,
    value: '0',
    gasPrice: '100000000000',
  };
  const gas_estimate = await web3.eth.estimateGas(tx);
  tx.gas = gas_estimate;
  const signedTx = await web3.eth.accounts.signTransaction(tx, signer.privateKey);
  console.log("Raw transaction data: " + ( signedTx).rawTransaction);
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  console.log(`Mined in block ${receipt.blockNumber}`);
}
main();
```


## License

Specify the license under which your project is distributed. For example:

This project is licensed under the [MIT License](LICENSE).
.
