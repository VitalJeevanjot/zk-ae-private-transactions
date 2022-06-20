const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');

const fs = require('fs')


const CONTRACT_SOURCE = './contracts/MerkleTreeWithHistory.aes';
const CONTRACT_SOURCE_HASHER = './contracts/MIMCSponge.aes';



describe('merkleTreeHistoryTest', () => {
  let aeSdk;
  let contract;
  let contract_hasher;


  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(CONTRACT_SOURCE);
    const filesystem_hasher = utils.getFilesystem(CONTRACT_SOURCE_HASHER);


    // get content of contract
    const source = utils.getContractContent(CONTRACT_SOURCE);
    const source_hasher = utils.getContractContent(CONTRACT_SOURCE_HASHER);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, filesystem });
    contract_hasher = await aeSdk.getContractInstance({ source: source_hasher, filesystem: filesystem_hasher });

    var hasher = await contract_hasher.deploy();
    await contract.deploy([20, hasher.address]);

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);

  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('haser left right', async () => {
    // const get = await contract.methods.t5_now({ gas: 5000000, gasPrice: 20000000000 });
    // const get = await contract.methods.mimcFeistel(5, 3, 0, { gas: 30000000, gasPrice: 2000000000 });
    // const get = await contract.methods.get_feistel_twice({ gas: 30000000, gasPrice: 2000000000 });
    // const get = await contract.methods.field_size_to_int({ gas: 30000000, gasPrice: 2000000000 });
    // const get = await contract.methods.hashLeftRight("21663839004416932945382355908790599225266501822907911457504978515578255421292", "21663839004416932945382355908790599225266501822907911457504978515578255421292", { gas: 30000000, gasPrice: 2000000000 });
    const get = await contract.methods.insert("21663839004416932", { gas: 30000000, gasPrice: 200000000000 });
    console.log(get.decodedResult)
  });

});

