const file = require('../circuits/verification_key.json')
const fs = require('fs')


const contract = `
@compiler >= 6

include "BLS12_381.aes"
include "List.aes"

contract VerifyZKP =

    record verify_key = { a : BLS12_381.g1, b : BLS12_381.g2, c : BLS12_381.g2, d : BLS12_381.g2, ic : list(BLS12_381.g1) }
    record proof = { a : BLS12_381.g1, b : BLS12_381.g2, c : BLS12_381.g1 }

    public entrypoint verifyingKey() : verify_key =
        let _a = BLS12_381.mk_g1(
            ${file.vk_alpha_1[0]},
            ${file.vk_alpha_1[1]},
            ${file.vk_alpha_1[2]}
         )

        let _b = BLS12_381.mk_g2(
            ${file.vk_beta_2[0][0]},
            ${file.vk_beta_2[0][1]},
            ${file.vk_beta_2[1][0]},
            ${file.vk_beta_2[1][1]},
            ${file.vk_beta_2[2][0]},
            ${file.vk_beta_2[2][1]}
         )

        let _c = BLS12_381.mk_g2(
            ${file.vk_gamma_2[0][0]},
            ${file.vk_gamma_2[0][1]},
            ${file.vk_gamma_2[1][0]},
            ${file.vk_gamma_2[1][1]},
            ${file.vk_gamma_2[2][0]},
            ${file.vk_gamma_2[2][1]}
         )

        let _d = BLS12_381.mk_g2(
            ${file.vk_delta_2[0][0]},
            ${file.vk_delta_2[0][1]},
            ${file.vk_delta_2[1][0]},
            ${file.vk_delta_2[1][1]},
            ${file.vk_delta_2[2][0]},
            ${file.vk_delta_2[2][1]}
         )

        let _ic: list(BLS12_381.g1) = [
            BLS12_381.mk_g1(
                ${file.IC[0][0]},
                ${file.IC[0][1]},
                ${file.IC[0][2]}
            ),
            BLS12_381.mk_g1(
                ${file.IC[1][0]},
                ${file.IC[1][1]},
                ${file.IC[1][2]}
            ),
            BLS12_381.mk_g1(
                ${file.IC[2][0]},
                ${file.IC[2][1]},
                ${file.IC[2][2]}
            ),
            BLS12_381.mk_g1(
                ${file.IC[3][0]},
                ${file.IC[3][1]},
                ${file.IC[3][2]}
            ),
            BLS12_381.mk_g1(
                ${file.IC[4][0]},
                ${file.IC[4][1]},
                ${file.IC[4][2]}
            ),
            BLS12_381.mk_g1(
                ${file.IC[5][0]},
                ${file.IC[5][1]},
                ${file.IC[5][2]}
            ),
            BLS12_381.mk_g1(
                ${file.IC[6][0]},
                ${file.IC[6][1]},
                ${file.IC[6][2]}
            )
         ]

        {a =_a, b = _b, c = _c, d = _d, ic = _ic}

    public entrypoint verify(proof_abc: list(int), inp: list(int)) : bool =
        let p: proof = make_proof(proof_abc)
        let inp: list(BLS12_381.fr) = make_input(inp)
        let vk = verifyingKey()
        let vk_x = verify_proof(inp, p, vk)

        BLS12_381.pairing_check([BLS12_381.g1_neg(p.a), vk.a, vk_x, p.c],
                            [p.b, vk.b, vk.c, vk.d])

    function verify_proof(inputs: list(BLS12_381.fr), pr: proof, vk: verify_key) : BLS12_381.g1 =

        require(List.length(inputs) + 1 == List.length(vk.ic), "verifier-bad-input")

        let vk_x = calc_vk_x(vk.ic, inputs)

        vk_x

    function calc_vk_x(ics : list(BLS12_381.g1), xs : list(BLS12_381.fr)) : BLS12_381.g1 =
        switch(ics)
            (ic :: ics) => calc_vk_x_(ic, ics, xs)

    function calc_vk_x_(vk_x : BLS12_381.g1, ics : list(BLS12_381.g1), xs : list(BLS12_381.fr)) : BLS12_381.g1 =
        switch((ics, xs))
            ([], []) => vk_x
            (ic :: ics, x :: xs) => calc_vk_x_(BLS12_381.g1_add(vk_x, BLS12_381.g1_mul(x, ic)), ics, xs)

    function make_proof(abc: list(int)): proof =
        {
            a = BLS12_381.mk_g1(List.get(0, abc),
                List.get(1, abc),
                List.get(2, abc)),
            b = BLS12_381.mk_g2(List.get(3, abc),
                List.get(4, abc),
                List.get(5, abc),
                List.get(6, abc),
                List.get(7, abc),
                List.get(8, abc)),
            c = BLS12_381.mk_g1(List.get(9, abc),
                List.get(10, abc),
                List.get(11, abc))
         }

    function make_input(inp: list(int)): list(BLS12_381.fr) =
        let newList = []
        switch(inp)
            [] => newList
            i :: inp => BLS12_381.int_to_fr(i) :: newList

    entrypoint caller(): address=
        Call.caller

`
fs.writeFileSync('../contracts/zkpVerify.aes', contract)