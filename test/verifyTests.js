const { assert } = require('chai');
const { utils, wallets } = require('@aeternity/aeproject');
const snarkjs = require('snarkjs')

const EXAMPLE_CONTRACT_SOURCE = './contracts/PairVerify.aes';
const bigInt = snarkjs.bigInt

describe('VerifyContract', () => {
  let client;
  let contract;

  const toHex = (number, length = 48) =>
    '#' + bigInt(number).toString(16).padStart(length * 2, '0')

  var get_array;
  var points;

  before(async () => {
    console.log("Starting1")
    client = await utils.getClient();
    console.log("Starting2.0")
    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);
    console.log("Starting3")
    console.log(filesystem)

    // get content of contract
    const source = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);
    console.log(source)
    console.log("Starting4")

    // initialize the contract instance
    contract = await client.getContractInstance({ source, filesystem });

    console.log("Starting5")
    points = {
      a: [bigInt("20491192805390485299153009773594534940189261866228447918068658471970481763042"),
      bigInt("9383485363053290200918347156157836566562967994039712273449902621266178545958"),
        1],

      b: [[bigInt("4252822878758300859123897981450591353533073413197771768651442665752259397132"),
      bigInt("6375614351688725206403948262868962793625744043794305715222011528459656738731")],

      [bigInt("21847035105528745403288232691147584728191162732299865338377159692350059136679"),
      bigInt("10505242626370262277552901082094356697409835680220590971873171140371331206856")],

      [1, 0]],

      c: [[bigInt("11559732032986387107991004021392285783925812861821192530917403151452391805634"),
      bigInt("10857046999023057135944570762232829481370756359578518086990519993285655852781")],

      [bigInt("4082367875863433681332203403145435568316851327593401208105741076214120093531"),
      bigInt("8495653923123431417604973247489272438418190587263600148770280649306958101930")],

      [1, 0]],

      d: [[bigInt("5563441545933948488218476494240706057924259789995623756679765101921985839773"),
      bigInt("14322932008140731863626437644704537772004063670431390131921086482467808925808")],

      [bigInt("10519417790328391187994375766106885897716047910761289758197540860719091765039"),
      bigInt("19928495485339881223957653982775976414131926290258541241094287378087674453300")],

      [1, 0]],

      ic: [[bigInt("6819801395408938350212900248749732364821477541620635511814266536599629892365"),
      bigInt("9092252330033992554755034971584864587974280972948086568597554018278609861372"),
        1],
      [bigInt("17882351432929302592725330552407222299541667716607588771282887857165175611387"),
      bigInt("18907419617206324833977586007131055763810739835484972981819026406579664278293"),
        1]]
    }
    console.log("Starting6")
    console.log("points-----")
    console.log(points)
    get_array = [
      points.a[0],
      points.a[1],
      points.a[2],
      points.b[0][0],
      points.b[0][1],
      points.b[1][0],
      points.b[1][1],
      points.b[2][0],
      points.b[2][1],
      points.c[0][0],
      points.c[0][1],
      points.c[1][0],
      points.c[1][1],
      points.c[2][0],
      points.c[2][1],
      points.d[0][0],
      points.d[0][1],
      points.d[1][0],
      points.d[1][1],
      points.d[2][0],
      points.d[2][1],
      points.ic[0][1],
      points.ic[0][2],
      points.ic[0][3],
      points.ic[1][1],
      points.ic[1][2],
      points.ic[1][3]
    ]
    console.log(get_array)
    // create a snapshot of the blockchain state
    // await utils.createSnapshot(client);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    // await utils.rollbackSnapshot(client);
  });

  it('VerifyContract: Deploy', async () => {
    // const vks = await contract.methods.intToFp(20491192805390485299153009773594534940189261866228447918068658471970481763042);
    // console.log(vks.decodedResult)
    let deployed = await contract.deploy(get_array);
    console.log(deployed)
  });
  // it('VerifyContract: proof', async () => {
  //   const set = await contract.methods.set(42);
  //   assert.equal(set.decodedEvents[0].name, 'SetXEvent');
  //   assert.equal(set.decodedEvents[0].decoded[0], wallets[0].publicKey);
  //   assert.equal(set.decodedEvents[0].decoded[1], 42);

  //   const { decodedResult } = await contract.methods.get();
  //   assert.equal(decodedResult, 42);
  // });

  // it('ExampleContract: get undefined when not set before', async () => {
  //   const { decodedResult } = await contract.methods.get();
  //   assert.equal(decodedResult, undefined);
  // });
});
