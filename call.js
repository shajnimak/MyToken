const { Web3 } = require("web3");

var ETHEREUM_NETWORK = "sepolia";
var INFURA_API_KEY = "8fe885b2b1634e9d9bbd0b87a13fc684";
var SIGNER_PRIVATE_KEY = "6ec88c3811a477abf3cbd4ac4fde4e5cc68b6f11770a2bf291d6a3fc17c70f23";
var DEMO_CONTRACT = "0x4E890317C0297Eccf39563e11E92317F85DacbB6";


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