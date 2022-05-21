const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');

const fs = require('fs')


const ZKP_CONTRACT_SOURCE = './contracts/MIMCSponge.aes';



describe('mimcSpongeContract', () => {
  let aeSdk;
  let contract;


  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(ZKP_CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(ZKP_CONTRACT_SOURCE);

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

  it('mimcSponge test', async () => {
    for (let index = 4; index < 10; index++) {
      const get = await contract.methods.mimcFeistel(index, 1, 0, 0, { gas: 10000000, gasPrice: 20000000000 });
      console.log(get.decodedResult.i)
    }
    // assert.equal(get.decodedResult, true)
  });

});

