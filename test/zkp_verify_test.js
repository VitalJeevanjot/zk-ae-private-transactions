// const { assert } = require('chai');
// const { utils, wallets } = require('@aeternity/aeproject');

// const fs = require('fs')
// const { toBN, randomHex } = require('web3-utils')
// // const websnarkUtils = require('websnark/src/utils')
// // const buildGroth16 = require('websnark/src/groth16')
// // const stringifyBigInts = require('websnark/tools/stringifybigint').stringifyBigInts
// // const unstringifyBigInts2 = require('snarkjs/src/stringifybigint').unstringifyBigInts
// const snarkjs = require('snarkjs')
// const ffjavascript = require('ffjavascript')
// const bigInt = snarkjs.bigInt
// const crypto = require('crypto')
// const circomlib = require('circomlib')
// const MerkleTree = require('fixed-merkle-tree')


// const ZKP_CONTRACT_SOURCE = './contracts/zkpVerify_static_example.aes';


// const rbigint = (nbytes) => ffjavascript.utils.leBuff2int(crypto.randomBytes(nbytes))
// const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]
// const toFixedHex = (number, length = 32) =>
//   '0x' +
//   bigInt(number)
//     .toString(16)
//     .padStart(length * 2, '0')
// const getRandomRecipient = () => rbigint(20)

// function generateDeposit () {
//   let deposit = {
//     secret: rbigint(31),
//     nullifier: rbigint(31),
//   }
//   const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)])
//   deposit.commitment = pedersenHash(preimage)
//   return deposit
// }

// // function snarkVerify (proof) {
// //   proof = unstringifyBigInts2(proof)
// //   const verification_key = unstringifyBigInts2(require('../withdraw_0001_verification_key.zkey.json'))
// //   return snarkjs['groth'].isValid(verification_key, proof, proof.publicSignals)
// // }


// describe('ZKPContract', () => {
//   let aeSdk;
//   let contract;
//   const levels = 16
//   // const value = bigInt(1e18)
//   // const fee = bigInt(1e16)
//   // const refund = bigInt(0)
//   const recipient = getRandomRecipient()

//   let tree
//   let groth16
//   let circuit
//   let proving_key
//   // const relayer = accounts[1]

//   before(async () => {
//     aeSdk = await utils.getSdk();

//     // a filesystem object must be passed to the compiler if the contract uses custom includes
//     const filesystem = utils.getFilesystem(ZKP_CONTRACT_SOURCE);

//     // get content of contract
//     const source = utils.getContractContent(ZKP_CONTRACT_SOURCE);

//     // initialize the contract instance
//     contract = await aeSdk.getContractInstance({ source, filesystem });
//     await contract.deploy();

//     // create a snapshot of the blockchain state
//     await utils.createSnapshot(aeSdk);

//     tree = new MerkleTree(levels)
//     // groth16 = await buildGroth16()
//   });

//   // after each test roll back to initial state
//   afterEach(async () => {
//     await utils.rollbackSnapshot(aeSdk);
//   });

//   it('zkpVerify: verify Correctly', async () => {
//     var proof = [
//       '3147976723149489859761530872984028462034538679944384837539791309920356665754164302613908745640547280918695328173580',
//       '930151850943288771744482840546852954611155336919204941204021862254754152518302874102606047734354137440573711399220',
//       '1',
//       '2904572736743504490815711870221035402191552027212666353577288182480850298300419248232935947470474838494798493916507',
//       '2065240763541717981078787854968598823208382364114476659485192937340836599945305275680958916731432307027797336139009',
//       '80398571805065897487660301796264674247777121558657687069183589411378965424205829537530242080722236143422638716816',
//       '2001894898589695903485343754133403796168357290049128430070740884856148456511639050413934345423589140110795014927333',
//       '1',
//       '0',
//       '3919826893926508557750098617639871699928504637318988284475674255169924457111925861214158159129822181411321007387613',
//       '3558205460341417241254987523891719000244488429387579696970032523124201417880094438520681105453836336618530498368346',
//       '1'
//     ]

//     var input = ['33']
//     const get = await contract.methods.verify(proof, input, { gas: 100000, gasPrice: 2000000000 });
//     assert.equal(get.decodedResult, true)
//   });

//   it('zkpVerify: verify Incorrectly: change in proof', async () => {
//     // change in proof at index 3
//     var proof = [
//       '3147976723149489859761530872984028462034538679944384837539791309920356665754164302613908745640547280918695328173580',
//       '930151850943288771744482840546852954611155336919204941204021862254754152518302874102606047734354137440573711399220',
//       '1',
//       '2903572736743504490815711870221035402191552027212666353577288182480850298300419248232935947470474838494798493916507',
//       '2065240763541717981078787854968598823208382364114476659485192937340836599945305275680958916731432307027797336139009',
//       '80398571805065897487660301796264674247777121558657687069183589411378965424205829537530242080722236143422638716816',
//       '2001894898589695903485343754133403796168357290049128430070740884856148456511639050413934345423589140110795014927333',
//       '1',
//       '0',
//       '3919826893926508557750098617639871699928504637318988284475674255169924457111925861214158159129822181411321007387613',
//       '3558205460341417241254987523891719000244488429387579696970032523124201417880094438520681105453836336618530498368346',
//       '1'
//     ]

//     var input = ['33']
//     const get = await contract.methods.verify(proof, input, { gas: 100000, gasPrice: 2000000000 });
//     assert.equal(get.decodedResult, false)
//   });

//   it('zkpVerify: verify Incorrectly: change in input', async () => {
//     // change in input
//     var proof = [
//       '3147976723149489859761530872984028462034538679944384837539791309920356665754164302613908745640547280918695328173580',
//       '930151850943288771744482840546852954611155336919204941204021862254754152518302874102606047734354137440573711399220',
//       '1',
//       '2904572736743504490815711870221035402191552027212666353577288182480850298300419248232935947470474838494798493916507',
//       '2065240763541717981078787854968598823208382364114476659485192937340836599945305275680958916731432307027797336139009',
//       '80398571805065897487660301796264674247777121558657687069183589411378965424205829537530242080722236143422638716816',
//       '2001894898589695903485343754133403796168357290049128430070740884856148456511639050413934345423589140110795014927333',
//       '1',
//       '0',
//       '3919826893926508557750098617639871699928504637318988284475674255169924457111925861214158159129822181411321007387613',
//       '3558205460341417241254987523891719000244488429387579696970032523124201417880094438520681105453836336618530498368346',
//       '1'
//     ]

//     var input = ['22']
//     const get = await contract.methods.verify(proof, input, { gas: 100000, gasPrice: 2000000000 });
//     assert.equal(get.decodedResult, false)
//   });
// });

