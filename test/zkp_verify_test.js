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
    await contract.deploy();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('zkpVerify: get', async () => {
    console.log("AT GET")
    var proof = {
      'a': {
        'x': '16#1473EBD8B0A03FAA87A0BD8DFC47A5C48898F0F9EFD46D0DAE39DFAFCC0AC5CA548BD8FE9382A80E4821952389794E0C',
        'y': '16#60B16EC324DCE974A1437FB18903810737613B0BBE02022D08F9546815EB5A76DFC7EEF987EEA4D18AF426243D33934',
        'z': '1'
      },
      'b': {
        'x': {
          'x1': '16#12DF1368133E7A00B8DC007E298A9AF0D61618B9C8AF7CC4ACDA7633D722F3AA1953CA2D173FE8A266B7DD2636261D5B',
          'x2': '16#D6B0B391DCAC320A0056B3BA2A78679E0C761F7C634782A0E7E0070955E93261EDB9428126A7A8D776C000D1C042501'
        },
        'y': {
          'x1': '16#85B963951C54B2A8AD5D4446284FD871D672F42DD3FCCFD52D73BD42A00BF4A23BFAEE2437BE63FD63F6018274F790',
          'x2': '16#D01AECEE6EE1183EF3252F8D222B234049220A4C96A2337B6DC18F5EACF684C486259555ECAED1A61A63B133A83F3E5'
        },
        'z': {
          'x1': '1',
          'x2': '0'
        }
      },
      'c': {
        'x': '16#1977B68CA648C486BB3B2F958397801201A2C667CD71738DF81D6552CAF002A28FE60253089BE49C317EF824FB9933DD',
        'y': '16#171E3D98632A648D417273AF9D5A3F0028A513C17F0A88FF9A0E78255E83D6EBCEC9C8559CF29D63BCDB04E0E3DB535A',
        'z': '1'
      }
    }

    var input = ['16#0000000000000000000000000000000000000000000000000000000000000021']
    const get = await contract.methods.verify(proof, input, { gas: 100000, gasPrice: 2000000000 });
    console.log(get.decodedResult)

  });
});
