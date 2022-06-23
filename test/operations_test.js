const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');

const fs = require('fs')
const { toBN, randomHex } = require('web3-utils')
// const websnarkUtils = require('websnark/src/utils')
// const buildGroth16 = require('websnark/src/groth16')
// const stringifyBigInts = require('websnark/tools/stringifybigint').stringifyBigInts
// const unstringifyBigInts2 = require('snarkjs/src/stringifybigint').unstringifyBigInts
const snarkjs = require('snarkjs')
const bigInt = require("big-integer");
const ffjavascript = require('ffjavascript')
const crypto = require('crypto')
const circomlib = require('circomlib')
const MerkleTree = require('fixed-merkle-tree')


const CONTRACT_SOURCE = './contracts/Operations.aes';
const VERIFIER_CONTRACT_SOURCE = './contracts/zkpVerify.aes';


const rbigint = (nbytes) => ffjavascript.utils.leBuff2int(crypto.randomBytes(nbytes))
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]
const toFixedHex = (number, length = 32) =>
  '0x' +
  bigInt(number)
    .toString(16)
    .padStart(length * 2, '0')
const getRandomRecipient = () => rbigint(20)

function generateDeposit () {
  let deposit = {
    secret: rbigint(31),
    nullifier: rbigint(31),
  }
  const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)])
  deposit.commitment = pedersenHash(preimage)
  return deposit
}

// function snarkVerify (proof) {
//   proof = unstringifyBigInts2(proof)
//   const verification_key = unstringifyBigInts2(require('../withdraw_0001_verification_key.zkey.json'))
//   return snarkjs['groth'].isValid(verification_key, proof, proof.publicSignals)
// }


describe('ZKPContract', () => {
  let aeSdk;
  let contract;
  const levels = 20
  const value = "1000000000000000000"
  const operator = wallets[0].publicKey
  // const fee = bigInt(1e16)
  // const refund = bigInt(0)
  const recipient = getRandomRecipient()

  let tree
  let groth16
  let circuit
  let proving_key
  // const relayer = accounts[1]

  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(CONTRACT_SOURCE);
    const verifier_filesystem = utils.getFilesystem(VERIFIER_CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(CONTRACT_SOURCE);
    const verifier_source = utils.getContractContent(VERIFIER_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, filesystem });
    contract_verifier = await aeSdk.getContractInstance({ source: verifier_source, filesystem: verifier_filesystem });
    let verifier_tx = await contract_verifier.deploy();
    await contract.deploy([levels, value, operator, verifier_tx.address]);

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);

    tree = new MerkleTree(levels)
    // groth16 = await buildGroth16()
  });

  // after each test roll back to initial state
  // afterEach(async () => {
  //   await utils.rollbackSnapshot(aeSdk);
  // });

  it('operations: denomination', async () => {
    let _denomination = await contract.methods.get_approved_deposit()
    // console.log("Denomination/>")
    // console.log(_denomination.decodedResult)
    // console.log("</Denomination")
    assert.equal(_denomination.decodedResult, value)
  });

  it('operations: Deposit with dummy commitment', async () => {
    let _commitment = bigInt(42)
    let _deposit = await contract.methods.deposit(_commitment, { amount: value })
    // console.log("Deposit/>")
    // console.log(_deposit.decodedEvents[0].args[0])
    // console.log("</Deposit")
    assert.equal(_deposit.decodedEvents[0].name, "Deposit")
    assert.equal(_deposit.decodedEvents[0].args[0], _commitment)
    assert.equal(_deposit.decodedEvents[0].args[1], 0)
  });

  it('operations: Deposit error if commitment already exists', async () => {
    let _commitment = bigInt(42)
    try {
      let _deposit = await contract.methods.deposit(_commitment, { amount: value })
      console.log(_deposit.decodedEvents[0])
    } catch (e) {
      // console.log(e.message)
      assert.equal(e.message, `Invocation failed: "Cannot submit same commitment again!"`)
    }
  });
});

