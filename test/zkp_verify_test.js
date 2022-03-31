const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');

const EXAMPLE_CONTRACT_SOURCE = './contracts/zkpVerify.aes';

describe('ExampleContract', () => {
  let aeSdk;
  let contract;

  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, filesystem });
    await contract.methods.init({ gas: 100000, gasPrice: 2000000000 });

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('zkpVerify: get', async () => {
    console.log("AT GET")
    const get = await contract.methods.callDataToVerify({ gas: 100000, gasPrice: 2000000000 });
    console.log(get.decodedResult)

  });
});
