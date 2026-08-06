# False Witness

| | |
| --- | --- |
| Category | Crypto |
| Difficulty | Very Easy |
| Points | 925 |
| Flag | *(fill in)* |

## Description

> Caldrin Vowmark knows that not every seal deserves belief. Some marks still
> carry the weight of a living vow; others only imitate one well enough to pass
> a glance.

`server.py` + a Docker instance. On connect the server prints an AES-ECB
ciphertext of the flag, then exposes an oracle we can query as many times as we
like.

## How it works

- The flag is encrypted with AES-ECB under a random 32-byte `KEY`.
- `KEY_BITS` = the 256 bits of that key.
- **We choose the generator `G`.** Public key entries `PK[i]` are pairs
  `(G^sk0, G^sk1) mod P` — i.e. elements of the subgroup `<G>`.
- The oracle leaks one key bit at a time:
  - `KEY_BITS[i] == 1` → returns a `PK` value (an element of `<G>`)
  - `KEY_BITS[i] == 0` → returns a uniformly random 256-bit integer

## The bug

Nothing constrains `G`. Pick

```
G = P - 1     (≡ -1 mod P)
```

Then `<G> = {1, P-1}` — a subgroup of order 2. So:

- every `1` answer is **always** `1` or `P-1`
- every `0` answer is a random 256-bit integer, landing in `{1, P-1}` with
  probability `~2^-255`

That's a perfect distinguisher. The story hint fits exactly: a convincing lie
(random value) is cheap, but a genuine living vow (real subgroup element) is now
trivially identifiable.

## The approach

1. Read the AES-ECB ciphertext the server prints.
2. Send `G = P - 1`.
3. Query offsets `0..255`; result in `{1, P-1}` → bit `1`, else bit `0`.
4. Reassemble MSB-first into the 32-byte key.
5. AES-ECB decrypt, unpad → flag.

## Takeaway

If a scheme lets the attacker choose the group generator, they can collapse the
group's structure. `G = -1` reduced a 256-bit subgroup to two elements and turned
"is this value legitimate?" into a trivial membership test.

## Run

```bash
pip install pwntools pycryptodome
python solve.py
```
