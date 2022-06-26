include "pedersen.circom";
include "bitify.circom";


template Main() {
    signal input in;
    signal output onei;
    signal output out[2];
    signal output twoi;

    component pedersen = Pedersen(248);

    component n2b;
    n2b = Num2Bits(248);

    var i;

    in ==> n2b.in;

    for  (i=0; i<248; i++) {
        pedersen.in[i] <== n2b.out[i];
    }

    pedersen.out[0] ==> out[0];
    pedersen.out[1] ==> out[1];
    100000 ==> onei
    200000 ==> twoi
}

component main = Main();

