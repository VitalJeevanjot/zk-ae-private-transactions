const { AeSdk, MemoryAccount, Node } = require('@aeternity/aepp-sdk')
const contractUtils = require('./utils/contract-utils');
require('dotenv').config()

const node = new Node('https://testnet.aeternity.io') // ideally host your own node
const account = new MemoryAccount({
  // provide a valid keypair with your secretKey and publicKey
  keypair: {
    secretKey: process.env.KEY,
    publicKey: process.env.ADDRESS
  }
})

const aeSdk = new AeSdk({
  nodes: [
    { name: 'testnet', instance: node }
  ],
  compilerUrl: 'https://compiler.aepps.com', // ideally host your own compiler
})


const mimc_sponge_CONTRACT_SOURCE = contractUtils.getContractContent('../contracts/MIMCSponge.aes');
const merkle_tree_CONTRACT_SOURCE = contractUtils.getContractContent('../contracts/MerkleTreeWithHistory.aes');

const mimc_sponge_File_System = contractUtils.getFilesystem('../contracts/MIMCSponge.aes');
const merkle_tree_File_System = contractUtils.getFilesystem('../contracts/MerkleTreeWithHistory.aes');


async function init_and_deploy () {
  await aeSdk.addAccount(account, { select: true })

  const mimc_sponge_contractInstance = await aeSdk.getContractInstance({ source: mimc_sponge_CONTRACT_SOURCE, filesystem: mimc_sponge_File_System })
  const merkle_tree_contractInstance = await aeSdk.getContractInstance({ source: merkle_tree_CONTRACT_SOURCE, filesystem: merkle_tree_File_System })

  var deployed_mimc = await mimc_sponge_contractInstance.deploy()
  console.log(deployed_mimc.address)

  var deployed_merkle = await merkle_tree_contractInstance.deploy([20, deployed_mimc.address])
  console.log(deployed_merkle.address)

  // var hasher = await mimc_sponge_contractInstance.methods.hasher([565656512323255, 465468698741321], { gas: 30000000, gasPrice: 2000000000 })
  // console.log(hasher.decodedResult)

  var insert = await merkle_tree_contractInstance.methods.insert("21663839004416932", { gas: 2000000000, gasPrice: 2000000000 });
  console.log(insert.decodedResult)


}

init_and_deploy()