include "pedersen.circom";
include "bitify.circom";


template Main() {
    signal private input nullifier;
    signal private input secret;
    signal output catch1;
    signal output commitment_hash;
    signal output catch2;


    component commitmentHasher = Pedersen(496);
    component nullifierBits = Num2Bits(248);
    component secretBits = Num2Bits(248);

    nullifierBits.in <== nullifier;
    secretBits.in <== secret;
    for (var i = 0; i < 248; i++) {
        commitmentHasher.in[i] <== nullifierBits.out[i];
        commitmentHasher.in[i + 248] <== secretBits.out[i];
    }
    catch1 <== 1000000000
    commitment_hash <== commitmentHasher.out[0];
    catch2 <== 0000000001
}

component main = Main();

