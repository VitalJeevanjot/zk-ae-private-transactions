include "pedersen.circom";
include "bitify.circom";


template Main() {
    signal input in;
    signal output catch1;
    signal output out[2];
    signal output catch2;

    component pedersen = Pedersen(248);

    component n2b;
    n2b = Num2Bits(248);

    var i;

    in ==> n2b.in;

    for  (i=0; i<248; i++) {
        pedersen.in[i] <== n2b.out[i];
    }

    catch1 <== 40000000
    pedersen.out[0] ==> out[0];
    pedersen.out[1] ==> out[1];
    catch2 <== 50000000
}

component main = Main();

