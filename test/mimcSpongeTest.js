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
    // const get = await contract.methods.t5_now({ gas: 5000000, gasPrice: 20000000000 });
    // const get = await contract.methods.mimcFeistel(5, 3, 0, { gas: 30000000, gasPrice: 2000000000 });
    // const get = await contract.methods.get_feistel_twice({ gas: 30000000, gasPrice: 2000000000 });
    const get = await contract.methods.hasher([565656512323255, 465468698741321], { gas: 30000000, gasPrice: 2000000000 });
    console.log(get.decodedResult)
    // inputs:   "left": 565656512323255, "right": 465468698741321
    // 1st output expected: 38891872867026040328108358595221420665472868284040096954349764956244819173849 & 44960690674927008188172993140266778298953095954586356598642382665837691415817 (as produced by circom lib)

    assert.equal(get.decodedResult[0], "38891872867026040328108358595221420665472868284040096954349764956244819173849")
    assert.equal(get.decodedResult[1], "44960690674927008188172993140266778298953095954586356598642382665837691415817")
  });

});

