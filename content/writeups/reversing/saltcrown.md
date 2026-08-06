# SaltCrown

| | |
| --- | --- |
| Category | Reversing (Mobile) |
| Flag | `HTB{p3rf3ct_f4c3_wr0ng_sp1n3}` |

## Description

> Alyss has threaded the dead of Crownspire to the city bell. It strikes, they
> step, all together. You play Elric Ashspar... The bell's strike-plate is a
> counterfeit, and counterfeits fail under repetition. Break the march, force the
> bell to work, and read the failure.

## Recon

A ~190 MB Android APK. Unzipping reveals a **Godot engine game written in C#
(Mono)**:

```
lib/arm64-v8a/libgodot_android.so
lib/*/libmonosgen-2.0.*
assets/.godot/mono/publish/{arm64,x86_64}/SaltCrown.dll   <- the game assembly
assets/scripts/**/*.cs                                    <- decoy stubs (all empty)
```

The `.cs` files ship in cleartext but are empty. The real logic is in
`SaltCrown.dll`. String recon points straight at the class:

```
SaltCrown.Mechanism.SaltCrownSpec
LoadRubbing / RubbingPath / _rubbing / BucketTolerance / StrikeIndex / WearLattice
```

## Reversing the crypto core

No .NET runtime or ILSpy in the box, but Mono's disassembler is enough:

```bash
sudo apt-get install -y mono-utils
monodis SaltCrown.dll > SaltCrown.il
```

`SaltCrownSpec` contains the entire flag derivation:

- Constants: `Frame = "HTB"`, `Unmeasured = 0x811c9dc5` (FNV-1a offset basis).
- `Mix(h, v)` — a per-step mixer (all uint32):

  ```
  h ^= v;  h *= 0x01000193;   // FNV prime
  h ^= h >> 15;  h *= 0x85EBCA77;
  h ^= h >> 13;
  ```

- `Measure(acc, choke, phase) = Mix(Mix(acc, choke), phase)` — accumulates "strikes".
- `Unseal(measured)` — the flag emitter:

  ```
  h = measured
  for i in 0..len-1:
      h = Mix(h, i)
      out[i] = SealedSpec[i] ^ (byte)(h >> 24)
  return "HTB{" + ASCII(out) + "}"
  ```

`SealedSpec` is a 24-byte static array. `monodis` truncates the data blob, so read
it out of the PE via its FieldRVA — see [`extract_sealed.py`](extract_sealed.py):

```
75c9ab6b9a53cfbf1fe97e4a939425e029cf87a9c280dedc
```

## The bug

All the "march / bell strike" machinery exists only to produce a **single 32-bit
seed** (`measured`) fed into `Unseal`. The 24-byte flag body is entirely
determined by that one seed XORed against `SealedSpec`.

Rather than reverse the game's strike sequence, **brute-force all 2³² seeds** with
an early-exit printability filter — the correct seed is the only one whose 24-byte
output is all printable flag characters.

Exactly one candidate exists across all 4 billion seeds (`seed=0x75f944d2`) — that
uniqueness *is* the solve. The flag reads "perfect face, wrong spine": the
counterfeit strike-plate looks right on the face but is wrong underneath.

## Run

```bash
python extract_sealed.py            # -> the 24 sealed bytes (needs SaltCrown.dll)
gcc -O3 -o brute brute.c && ./brute # ~35s single core
```
