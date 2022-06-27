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
const buildPedersenHash = require("circomlibjs").buildPedersenHash;
const buildBabyJub = require("circomlibjs").buildBabyjub;


const CONTRACT_SOURCE = './contracts/Operations.aes';
const VERIFIER_CONTRACT_SOURCE = './contracts/zkpVerify.aes';


const rbigint = (nbytes) => ffjavascript.utils.leBuff2int(crypto.randomBytes(nbytes))

// const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]
const toFixedHex = (number, length = 32) =>
  '0x' +
  BigInt(number)
    .toString(16)
    .padStart(length * 2, '0')
const getRandomRecipient = () => rbigint(20)
// console.log(126810179319684907151315297506427434126249836227001154683610076032717190448n.toString(16))
// console.log(Buffer.from("47c5a2f894ff0490b6b5cd696eda5b000b4eacd38590d21671e2c53d227530", "hex"))
async function generateDeposit () {
  let deposit = {
    secret: rbigint(31),
    nullifier: rbigint(31),
  }
  deposit.commitment = await get_commitment_hash(deposit.nullifier, deposit.secret)

  return deposit
}

async function get_commitment_hash (nullifier, secret) {
  let _input = {
    nullifier: nullifier.toString(),
    secret: secret.toString()
  }
  let _wintess_file = "circuits/pedersenHash/commitment_witness.wtns"
  await snarkjs.wtns.calculate(_input, "circuits/pedersenHash/get_commitment_hash.wasm", _wintess_file)
  let _withness_in_json = await snarkjs.wtns.exportJson(_wintess_file)
  return (_withness_in_json[2])
}

async function pedersenHash (data) {
  let _input = {
    in: data.toString()
  }
  let _wintess_file = "circuits/pedersenHash/witness.wtns"
  await snarkjs.wtns.calculate(_input, "circuits/pedersenHash/make_pedersen.wasm", _wintess_file)
  let _withness_in_json = await snarkjs.wtns.exportJson(_wintess_file)
  return (_withness_in_json[2])
}

// console.log(pedersenHash(ffjavascript.utils.leInt2Buff(ffjavascript.utils.unstringifyBigInts("126810179319684907151315297506427434126249836227001154683610076032717190448"))))
// console.log(ffjavascript.utils.leBuff2int(circomlib.pedersenHash.hash(ffjavascript.utils.leInt2Buff(BigInt(126810179319684907151315297506427434126249836227001154683610076032717190448)))))
// function snarkVerify (proof) {
//   proof = unstringifyBigInts2(proof)
//   const verification_key = unstringifyBigInts2(require('../withdraw_0001_verification_key.zkey.json'))
//   return snarkjs['groth'].isValid(verification_key, proof, proof.publicSignals)
// }


describe('ZKPContract', () => {
  let aeSdk;
  let contract;
  const levels = 20
  const value = BigInt(1e17).toString()
  const operator = wallets[0].publicKey
  const fee = BigInt(1e15).toString()
  const refund = BigInt(0).toString()
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
    // let deposit = await generateDeposit()
    // let nullifier = Buffer.from("224090316219006964704684429623707295009158815299416414618621345802405015976")
    // let secret = Buffer.from("25457547106020319892560499412253457336364309431609500165441822920485098370")
    // console.log(nullifier)
    // console.log(secret)
    // console.log("rr>")
    // console.log(Array.prototype.slice.call(Buffer.concat([nullifier, secret])).join(''))
    // console.log("<rr")
    // // console.log("22409031621900696470468442962370729500915881529941641461862134580240501597625457547106020319892560499412253457336364309431609500165441822920485098370")
    // console.log("hash>")
    // console.log(await pedersenHash(Array.prototype.slice.call(Buffer.concat([nullifier, secret])).join('')))
    // console.log("<hash")
    // console.log(await pedersenHash(22409031621900696470468442962370729500915881529941641461862134580240501597625457547106020319892560499412253457336364309431609500165441822920485098370n))
    // let bj = await buildBabyJub();
    // let F = bj.F;
    // let Scalar = ffjavascript.Scalar
    // console.log("F>")
    // console.log(F.toObject(F.e(Scalar.sub(Scalar.shl(Scalar.e(1), 253), Scalar.e(1)))))
    // console.log("<F")
    // let buuf = Buffer.from("47c5a2f894ff0490b6b5cd696eda5b000b4eacd38590d21671e2c53d227530", "hex")
    // const b = Buffer.alloc(32);
    // for (let i = 0; i < buuf.length; i++) b[i] = buuf[i];
    // b[31] = 0x00;
    // let ph = await buildPedersenHash();
    // console.log(bigInt(126810179319684907151315297506427434126249836227001154683610076032717190448))
    // console.log(pedersenHash(Buffer.from(126810179319684907151315297506427434126249836227001154683610076032717190448n.toString(16), "hex")))
    // const _deposit = generateDeposit()
    // let ffbuuf = ffjavascript.utils.leInt2Buff(126810179319684907151315297506427434126249836227001154683610076032717190448n)
    // console.log(_deposit.nullifier)
    // console.log(b)
    // let _buuf = Buffer.from(126810179319684907151315297506427434126249836227001154683610076032717190448n.toString(16), "hex")
    // console.log(pedersenHash(_buuf))
    // console.log(pedersenHash(buuf))
    // console.log(pedersenHash(ffbuuf))
    // let h = ph.hash(buuf)
    // let hp = bj.unpackPoint(h)
    // console.log("hp")
    // console.log(F.toObject(hp[0]))
    // // console.log(F.toObject(hp[1]))
    // let _h = ph.hash(ffbuuf)
    // let _hp = bj.unpackPoint(_h)
    // console.log("_hp")
    // console.log(F.toObject(_hp[0]))

    // let __h = ph.hash(b)
    // let __hp = bj.unpackPoint(__h)
    // console.log("__hp")
    // console.log(F.toObject(__hp[0]))
    // console.log(F.toObject(hp[1]))

    let _denomination = await contract.methods.get_approved_deposit()
    // console.log("Denomination/>")
    // console.log(_denomination.decodedResult)
    // console.log("</Denomination")
    assert.equal(_denomination.decodedResult, value)
  });

  it('operations: Deposit with dummy commitment', async () => {
    let _commitment = BigInt(42).toString()
    let _deposit = await contract.methods.deposit(_commitment, { amount: value })
    // console.log("Deposit/>")
    // console.log(_deposit.decodedEvents[0].args[0])
    // console.log("</Deposit")
    assert.equal(_deposit.decodedEvents[0].name, "Deposit")
    assert.equal(_deposit.decodedEvents[0].args[0], _commitment)
    assert.equal(_deposit.decodedEvents[0].args[1], 0)
  });

  it('operations: Deposit error if commitment already exists', async () => {
    let _commitment = BigInt(42).toString()
    try {
      await contract.methods.deposit(_commitment, { amount: value })
    } catch (e) {
      assert.equal(e.message, `Invocation failed: "Cannot submit same commitment again!"`)
    }
  });

  it('operations: Snarkjs create witness & proof', async () => {
    const _deposit = await generateDeposit()
    // console.log(_deposit.commitment)
    // 44586450400433173680761464372173390741855958019792134306206493119522851078525n
    tree.insert(_deposit.commitment)

    const { pathElements, pathIndices } = tree.path(0)

    // console.log(_deposit.nullifier)
    const _input = {
      root: tree.root(),
      nullifierHash: await pedersenHash(_deposit.nullifier),
      nullifier: _deposit.nullifier,
      relayer: BigInt("0xab9B39b9e0baDBb3Dbc81a7d7EEF13Bc7D5c846c").toString(),
      recipient,
      fee,
      refund,
      secret: _deposit.secret,
      pathElements: pathElements,
      pathIndices: pathIndices,
    }
    // console.log(JSON.stringify(ffjavascript.utils.stringifyBigInts(_input), null, 1))
    // <to be performed on each input>
    let _wasm_file = 'circuits/withdraw.wasm'
    let _witness_save_file = 'circuits/witness/withdraw.wtns'

    // await snarkjs.wtns.calculate(_input, _wasm_file, _witness_save_file)

    // let _save_file_json = _witness_save_file.replace('.wtns', '.json')
    // let _withness_in_json = await snarkjs.wtns.exportJson(_witness_save_file)
    // fs.writeFileSync(_save_file_json, JSON.stringify(ffjavascript.utils.stringifyBigInts(_withness_in_json), null, 1), "utf-8")


    let _zkey_file_name = 'circuits/withdraw2_0001.zkey'
    let _prove = await snarkjs.groth16.fullProve(_input, _wasm_file, _zkey_file_name)
    // console.log(_prove)
    // let { proof, publicSignals } = await snarkjs.groth16.prove(_zkey_file_name, _witness_save_file)

    // let _public_signals_save_file = 'circuits/witness/public.json'
    // let _proof_save_file = 'circuits/witness/proof.json'
    // fs.writeFileSync(_public_signals_save_file, JSON.stringify(ffjavascript.utils.stringifyBigInts(publicSignals), null, 1), "utf-8")
    // fs.writeFileSync(_proof_save_file, JSON.stringify(ffjavascript.utils.stringifyBigInts(proof), null, 1), "utf-8")
    // // <to be performed on each input>

    let _verification_key_path = 'circuits/verification_key.json'
    let _vk = JSON.parse(fs.readFileSync(_verification_key_path, "utf8"))
    // console.log(_vk)
    // let _pub = JSON.parse(fs.readFileSync(_public_signals_save_file, "utf8"))
    // let _proof = JSON.parse(fs.readFileSync(_proof_save_file, "utf8"))

    let _result = await snarkjs.groth16.verify(_vk, _prove.publicSignals, _prove.proof)
    console.log("Result />")
    console.log(_result)
    console.log("</ Result")
  })

  it('operations: Snarkjs verify proof & detect tampering', async () => {

  })
});

