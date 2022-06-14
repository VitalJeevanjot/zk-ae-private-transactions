const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');

const fs = require('fs')


const CONTRACT_SOURCE = './contracts/MerkleTreeWithHistory.aes';



describe('merkleTreeHistoryTest', () => {
  let aeSdk;
  let contract;


  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, filesystem });
    await contract.deploy();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);

  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('bytes to int test', async () => {
//     const field_size_to_int = await contract.methods.field_size_to_int({ gas: 30000000, gasPrice: 2000000000 });
//     console.log(field_size_to_int.decodedResult)
    const zeros_to_find = await contract.methods.zeros_to_find({ gas: 30000000, gasPrice: 2000000000 });
    console.log(zeros_to_find.decodedResult)
    console.log(zeros_to_find.decodedResult.length)
  });

});

