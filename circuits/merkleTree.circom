include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
// Computes SHA256([left, right])
template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;
    var getHash = 0;
    component num2bits[2];

    num2bits[0] = Num2Bits(512);
    num2bits[1] = Num2Bits(512);

    num2bits[0].in <== left;
    num2bits[1].in <== right;

    component hasher = Sha256(1024);

    for (var i = 0; i<512; i ++) {
        hasher.in[i] <== num2bits[0].out[i];
        hasher.in[i+512] <== num2bits[1].out[i];
    }
    for (var k=0; k<256; k++) {
        getHash += hasher.out[k];
    }
    hash <== getHash
}

// if s == 0 returns [in[0], in[1]]
// if s == 1 returns [in[1], in[0]]
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices input is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component selectors[levels];
    component hashers[levels];

    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
    }

    root === hashers[levels - 1].hash;
}
