# Ashbyte Arcade

| | |
| --- | --- |
| Category | Crypto |
| Difficulty | Medium |
| Points | 975 |
| Flag | `HTB{tw0_r0und5_0f_5n0w_4nd_1mp0551bl3_d1ff5}` |

## Description

> Among the Ash-Vault's stranger discoveries stands a curious relic unlike any
> other. An ancient entertainment cabinet whose strange machinery guards more
> than high scores.

An arcade-cabinet "save game" API. A save is a 16-byte binary state the server
encrypts and hands back; to win you must submit a ciphertext that decrypts to a
*winning* save.

## The cipher

`SnowCipher` is standard AES with the round count chopped to **two**:

```
encrypt_block(P):
    s = P ⊕ rk0                                    # initial AddRoundKey
    s = MixColumns(ShiftRows(SubBytes(s))) ⊕ rk1   # round 1
    s = MixColumns(ShiftRows(SubBytes(s))) ⊕ rk2   # round 2
```

- Two rounds only (real AES-128 uses ten).
- MixColumns kept in the final round — irrelevant, we can invert it.
- Ordinary AES-128 key schedule, so **`rk0` *is* the master key**.
- `encrypt()` is PKCS#7 + **ECB**.

Write `R(·) = MixColumns∘ShiftRows∘SubBytes`. Then `C = R( R(P ⊕ rk0) ⊕ rk1 ) ⊕ rk2`.

## The game state

| Offset | Field | Notes |
| --- | --- | --- |
| 0 | `SIG` | constant `0x4E` |
| 1 | `HP` | 1–9 |
| 2 | `SECTOR` | 1–9 |
| 3 | `X` | 1–18 |
| 4 | `Y` | 1–13 |
| 5–7 | `SCORE` | 24-bit little-endian |
| 8–11 | `RUNE_A..D` | must XOR to `0xA7` |
| 12 | `TRACK` seal | `(sector·19 + x·7 + y·13 + score_lo) & 0xFF` |
| 13 | `DEATHS` | 0–31 |
| 14 | `FLAGS` seal | `(hp + sector + x + y + track) & 0xFF` |
| 15 | `LRC` | XOR checksum of bytes 0–14 |

Winning = format-valid **and** `SECTOR=9, X=18, Y=13, SCORE ≥ 10_000_000,
RUNES = (0xC3, 0x7A, 0xB0, 0xAE)`.

Endpoints: `/api/start` (new session, random key, 16 lives), `/api/death`
(encryption oracle for valid **non-winning** states), `/api/load` (submit 32
bytes → flag if it decrypts to a winning save).

## Reaching the win condition

A winning submission must be `E(winning_state) ‖ E(0x10 * 16)`.

1. **The padding block is free.** Every state pads with the same full block, and
   ECB encrypts identical blocks identically — so `E(pad)` is just the second half
   of any `/api/death` response.
2. **The winning block is not free.** `is_winning_state` blocks the oracle from
   ever encrypting a winning state, and no ECB rearrangement produces a *new*
   block value.

So the only path is to **recover the key**.

> The 16-life cap is deliberate: it rules out the classic integral / "Square"
> attack on 2-round AES, which needs a 256-plaintext Λ-set under one key. We're
> forced into low-data known-plaintext recovery — exactly what the flag
> ("impossible diffs") hints at.

## The bug — the key-cancelling relation

Let `M = R(P ⊕ rk0) ⊕ rk1` be the input to the second SubBytes. From the
ciphertext side `C = R(M) ⊕ rk2`, so

```
SubBytes(M) = ShiftRows⁻¹( MixColumns⁻¹( C ⊕ rk2 ) )
```

`MixColumns⁻¹` and `ShiftRows⁻¹` are linear, so subtracting two known pairs kills
`rk2` entirely:

```
SubBytes(M_a) ⊕ SubBytes(M_b) = ShiftRows⁻¹( MixColumns⁻¹( C_a ⊕ C_b ) )
```

The right-hand side is **completely known — no key material**. This single
relation decouples the two S-box layers and is the engine of the whole attack.

## Per-diagonal structure

One AES round diffuses only within a MixColumns group, so each 4-byte output
group depends on exactly one input diagonal of `rk0`:

```
round-1 output [0,1,2,3]   ← rk0 diagonal (0, 5, 10, 15)   (contains SIG byte 0)
round-1 output [4,5,6,7]   ← rk0 diagonal (3, 4,  9, 14)
round-1 output [8,9,10,11] ← rk0 diagonal (2, 7,  8, 13)
round-1 output [12..15]    ← rk0 diagonal (1, 6, 11, 12)
```

Four independent 4-byte solves. For a candidate diagonal, compute
`W_a = R(P_a ⊕ rk0)[group]`, set `u_a = (W_a ⊕ W_0)[byte]` and
`δ_a = Δc(a,0)[byte]`, then require a single middle byte `M_0` consistent across
**all** pairs:

```
SubBytes(M_0 ⊕ u_a) ⊕ SubBytes(M_0) = δ_a     for every pair a
```

With ~14 pairs this is extremely selective. Done as a meet-in-the-middle over the
diagonal (split 2+2) using the S-box DDT, each diagonal solves in seconds.

**The SIG byte.** Byte 0 is constant `0x4E` in every valid state, so its `rk0`
byte cancels out of all differentials. Brute-force it (256 values) at the end
against one full pair. Since `rk0` is the master key, that completes recovery.

## Workflow

1. `collect.py` — grab ~14 known pairs from one session plus the free pad block.
2. Recover the 16-byte key offline (four diagonal MITMs + SIG brute-force).
3. Forge `E(winning_state) ‖ E(pad)` under the recovered key, submit to
   `/api/load` **in the same session**.

Sanity check before spending the load: the second half of the forged ciphertext
must exactly match the `pad_block` from the collector.

## Result

```json
{ "win": true,
  "message": "Vault opened. The encrypted save reached the relic room. Here you are: ",
  "flag": "HTB{tw0_r0und5_0f_5n0w_4nd_1mp0551bl3_d1ff5}" }
```

## Takeaways

- **Round count is security margin.** AES is only secure with its full round count.
- **ECB leaks structure.** Fixed padding means `E(pad)` is a constant you get free.
- **Limiting queries doesn't save a broken cipher.** The 16-life cap blocks the
  256-plaintext integral attack, but 2-round AES also falls to low-data
  known-plaintext recovery.

## Run

```bash
python collect.py http://<host>:<port> > pairs.json
# then key recovery + forge/load
```
