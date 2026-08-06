# Ancient Artifacts

| | |
| --- | --- |
| Category | Crypto |
| Difficulty | Hard |
| Points | 975 |
| Type | Remote service (`nc <host> <port>`), single source file `server.py` |
| Flag | *(fill in)* |

## Description

> Years of decrees, ledgers, and witness rolls have been packed into an aging
> archive beneath Crownspire. The records remain unreadable at first glance, yet
> every archive leaves traces of its own construction.

The flavour text is theming. The real challenge is a **checksum-collision puzzle
on Adler-32 and CRC-32**. The server hides a 128-bit secret and its Adler-32
checksum, and only hands over the flag to a client that can both *recover* that
hidden checksum and *forge* numbers colliding with it under three constraints at
once.

## The server

```python
import zlib, functools, secrets, signal

signal.alarm(30)
def apply_rune(rune, *nums):
    return rune("".join(str(num) for num in nums).encode())

num = secrets.randbits(128)
h = apply_rune(zlib.adler32, num)          # never revealed

my_salt = secrets.randbits(128)
your_salt = int(input("your salt: "))
assert your_salt.bit_length() >= 128
salted = apply_rune(zlib.adler32, my_salt, num, your_salt)
print(f"{my_salt = }")
print(f"{salted = }")

nums = []
while True:
    try:
        option = int(input(MENU))
        if option == 2:
            break
        elif option == 1:
            your_num = int(input("n: "))
            assert your_num not in nums
            assert apply_rune(zlib.adler32, your_num) == h
            nums.append(your_num)
        else:
            exit("bye")
    except:
        exit("bye")

assert apply_rune(zlib.crc32, *nums) == h
assert functools.reduce(lambda a, b: a ^ b,
                        [apply_rune(zlib.crc32, num) for num in nums]) == h
print(open("flag.txt").read())
```

## What we must produce

Distinct integers `nums` satisfying, all at once:

1. **Per-element Adler** — `adler32(str(x)) == h` for every `x`
2. **Concatenation CRC** — `crc32(str(x₁) ‖ … ‖ str(xₙ)) == h`
3. **XOR of CRCs** — `crc32(str(x₁)) ⊕ … ⊕ crc32(str(xₙ)) == h`

We never see `h` or `num`, so this splits into two problems.

### Two constraints that shape everything

- **30-second alarm** per connection — recovery + forging + I/O must all fit.
- **Python's 4300-digit limit** — the server calls `int(input())`, which raises
  for decimal strings longer than 4300 digits. That exception is swallowed by
  `except: exit("bye")`, so any oversized number **silently kills the connection**.

---

## Puzzle A — recovering `h`

Adler-32 is fully **linear** mod 65521:

```
A = 1 + Σ s[i]            (mod 65521)   -- low 16 bits
B = n + Σ (n − i)·s[i]    (mod 65521)   -- high 16 bits
```

Both halves combine *and invert*, so knowing `S1` and `S3` lets us peel them off
`adler32(S1 ‖ S2 ‖ S3)` and read out `adler32(S2)`. See [`recover_h.py`](recover_h.py).

**The one unknown: the length of the secret.** The `A` half needs no length
information, but the `B` half needs `n = len(str(num))`. Since
`num = secrets.randbits(128)` and `2¹²⁸ ≈ 3.4 × 10³⁸`:

- `n = 39` with probability ≈ **70 %**
- `n = 38` with probability ≈ 30 %

We can't observe the length within a session, and a wrong `h` gets us kicked at
the first Adler check. So: **assume `n = 39`, reconnect on failure.** Each
reconnect re-rolls `num`, so we hit a 39-digit session in ~1.4 attempts.

> Verified: given the correct `n`, `recover_h` reproduced the true `h` 5000/5000 times.

---

## Puzzle B — forging the numbers

### The two-number reduction

Use exactly two numbers:

- `a`: `adler32(a) = h`, `crc32(a) = 0`
- `b`: `adler32(b) = h`, `crc32(b) = h`

Using `crc32(X ‖ Y) = combine(crc32(X), crc32(Y), len Y)`:

| Constraint | Check |
| --- | --- |
| Concatenation | `combine(0, h, len b) = h` ✓ |
| XOR | `0 ⊕ h = h` ✓ |
| Per-element Adler | both are `h` ✓ |
| Distinct | CRCs differ (0 vs h) ✓ |

This works because `crc32_combine` is **linear with no constant term** — verified
against real zlib: `combine(c1, c2, len2) = T_len2 · c1 ⊕ c2`, and
`combine(0, 0, L) == 0` for all `L`.

So the whole problem collapses to one primitive: *build a decimal integer with a
chosen Adler-32 and a chosen CRC-32 simultaneously, in under ~4300 digits.*

### Building a number with a target (Adler, CRC)

Layout: `[ leading digit ][ bank of CRC "triples" ][ arithmetic Adler region ]`

**Stage 1 — fix Adler.** `zlib.adler32` runs on *bytes* (`0x30 + digit`), so the
ASCII baseline (48 per position) folds into the targets. For a fixed length `L`
the Adler-`A` value only reaches a `9·L`-wide band of residues — narrower than
65521 — so first pick an `L` where the target `A` residue is reachable:

```python
def pick_length(aA, n_triples=80):
    for L in range(LMAX, 400, -1):              # LMAX = 4200, stays under 4300
        r = (aA - 1 - 48*L) % BASE              # required digit-sum residue
        DS_free = r - (1 + 4*n_triples)         # minus lead + triples baseline
        if 2500 <= DS_free <= 9*free - 2500:    # comfortable, solvable band
            return L, r
```

The `B` (weighted-sum) target is solved by distributing digit "units" across a
contiguous range of position weights `1..Wmax` — always solvable because the
weighted range far exceeds 65521.

**Stage 2 — fix CRC without breaking Adler.** The key trick: apply the digit
pattern **`+1, −2, +1`** to three consecutive positions. This is *Adler-neutral*:

- digit-sum change: `+1 − 2 + 1 = 0` → **A** unchanged
- weighted change: `w·(+1) + (w−1)·(−2) + (w−2)·(+1) = 0` → **B** unchanged

— but it flips three bytes, so it changes the CRC by a fixed value. Each triple is
therefore an independent **CRC knob that leaves Adler untouched**. Lay down ~80
triples, compute each one's CRC-delta vector, and solve a GF(2) subset-XOR system
by Gaussian elimination:

```python
sol = gf2_solve(delta_vectors, crc_target ^ baseline_crc)
```

> Verified: hit arbitrary (Adler, CRC) targets 25/25; both forged numbers came out
> ~4078 digits (under the 4300 limit), built in 0.02 s — trivially inside the alarm.

---

## Putting it together

Per connection:

1. Send a ≥128-bit `your_salt`; read back `my_salt` and `salted`.
2. `recover_h(my_salt, your_salt, salted, n=39)`.
3. `a = find_number(h, crc=0)`, `b = find_number(h, crc=h)`.
4. Menu: `1` → send `a`, `1` → send `b`, `2` → stop.
5. If the connection died (wrong `n` this session), reconnect and retry.

**Validation.** The live host wasn't reachable from the build environment, so the
pipeline was validated against a local re-implementation of `server.py`: 25/25
full sessions succeeded whenever the length guess matched; the misses were exactly
the 38-digit sessions, handled by reconnecting. Offline self-test: 20/20
constructions satisfying all three conditions.

## Key takeaways

- **Adler-32 is fully linear mod 65521** — a checksum of `A ‖ secret ‖ B` with
  known `A`, `B` leaks the secret's checksum (given its length).
- **The digit length of `randbits(128)` is a coin flip** between 38 and 39 — guess
  the likely one and reconnect; don't try to be clever within a session.
- **CRC-32 is affine over GF(2)** and `crc32_combine` has no constant term, which
  reduces a three-way collision to two numbers with CRCs `0` and `h`.
- **`+1, −2, +1` on consecutive digits is Adler-neutral** — clean CRC control knobs.
- **Watch the 4300-digit `int()` limit** — it's the real bound on the construction.
