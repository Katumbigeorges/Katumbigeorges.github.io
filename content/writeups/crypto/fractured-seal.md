# Fractured Seal

| | |
| --- | --- |
| Category | Crypto (RSA) |
| Flag | `HTB{r3c0v3r1ng_RSA_k3ys___l1k3___Me0w___me0o00o0o0w___Me0w}` |

## Description

> One of the Registry's oldest key-scrolls survived the fall of Crownspire,
> though time and fire spared only fragments of its writing... a seal doesn't
> have to be whole to still remember the door it once opened.

Files:

```
encrypt.py            # generator
fractured_seal.pem    # RSA private key, heavily redacted (asterisks + cat ASCII art)
flag.enc              # 256-byte RSA ciphertext
```

`encrypt.py` is textbook RSA (2048-bit modulus, `e = 65537`) exporting a full
PKCS#1 private key via `RSA.construct((n, e, d))` — which serialises
`version, n, e, d, p, q, dp, dq, qinv`. Most bytes are blanked out with `*` and
cat art, but two fragments survive.

## What survives the redaction

Walking the ASN.1 from the top (decoding the contiguous base64 up to the first
`*`) recovers `e = 0x10001` and `n` — **except** the redaction eats exactly the
least-significant byte of `n`. Since `n = pq` is odd, that byte has 128 candidates.

Near the bottom the PEM leaks the start of prime `p` (an `02 81 81 00` header
followed by `wLGxcJ7...`). Base64 phase-aligning that run recovers the **top 72 of
128 bytes of `p`** — the high **576 bits** of a 1024-bit prime.

## The bug

Knowing more than half the bits of a factor of `N` is the classic Coppersmith
**"known high bits of a factor"** setup:

| | |
| --- | --- |
| Recovery bound for a 1024-bit factor of a 2048-bit `N` | ~512 unknown bits (`N^0.25`) |
| Actually unknown here | **448 bits** |

Comfortably inside the bound. The only wrinkle is the missing low byte of `N`,
handled by looping the 128 odd candidates — only the true `N` lets `p` divide it,
which also pins that byte.

## The approach

Univariate Coppersmith (Howgrave–Graham lattice) on `fpylll`. Validated on a toy
RSA first: `mm=5, tt=5` recovers 448 unknown bits in ~0.1s; `mm=7, tt=7` used here
for margin.

## Run

```bash
pip install fpylll cysignals sympy pycryptodome
python solve.py        # expects fractured_seal.pem and flag.enc alongside
```
