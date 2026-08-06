# The Ashen Field

| | |
| --- | --- |
| Category | Crypto (HFE / multivariate) |
| Flag | `HTB{e1th3r_gr0bn3r_0r_v4r13ty___1t_st1ll_w0rks!th4nks_f4l4y_f0r_y0ur_4tt4ck_0n_HFE}` |

## Description

> Deep beneath the Ash-Vault rests a relic... a public rite built from equations,
> guarded only by the silent calculations its keepers left behind.

Files: `source.sage` (keygen + encrypt), `output.txt` (137 public polynomials,
ciphertext vector, AES-encrypted flag).

## How it works

An HFE-style multivariate cryptosystem over GF(2) with `n = 137` variables:

1. **Affine input map `S`** — variables replaced by `S_A·x + S_B`
2. **Central field map** in `GF(2^137)` — lift to a field element `F`, then
   `F -> F^4 + F^2 + 1` (with `q = 2`, this is `F^(2q) + F^q + 1`)
3. **Affine output map `T`** — `PK = T_A·PK + T_B`

## The bug

Two observations kill the trapdoor:

**1. Frobenius is linear over GF(2).** For a linear form `L = Σ aᵢxᵢ`,
`L² = Σ aᵢ²xᵢ² = Σ aᵢxᵢ²`. So `F^4 + F^2 + 1` never produces cross terms `xᵢxⱼ`
— only pure `xᵢ⁴`, `xᵢ²` and the constant `1`. You can see this directly in the
public key.

**2. Evaluation at bits collapses the powers.** For `b ∈ {0,1}`, `b⁴ = b² = b`.
So each ciphertext coordinate is a plain **affine function**:

```
ct_j = Σ_i (a4_{j,i} ⊕ a2_{j,i}) · m_i ⊕ const_j
```

The entire "multivariate hardness" degenerates to a linear system `M·m = ct ⊕ c`
whose matrix is read straight off the public key. No Gröbner basis, no field
arithmetic — just Gaussian elimination.

## The approach

1. Parse each public polynomial into a bitmask row: `M[j][i] = x_i⁴-coeff ⊕ x_i²-coeff`,
   `c[j] = 1` iff the polynomial has a `+ 1`.
2. Gaussian-eliminate over GF(2). The system has **rank 135** → 2 free variables
   → 4 candidate solutions.
3. The unique candidate with `nbits == 137` (the generator enforced it) and valid
   PKCS#7 padding decrypts the flag.

The flag name-checks Faugère's Gröbner-basis attacks on HFE — though the GF(2)
linearisation made even that unnecessary.

## Run

```bash
pip install pycryptodome
python solve.py        # expects output.txt alongside
```
