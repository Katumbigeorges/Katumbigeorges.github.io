# Vow Engine

| | |
| --- | --- |
| Category | Coding |
| Flag | `HTB{th3_b3ll_r1ngs_wr0ng_0n_purp0s3}` |

## Description

Witnesses are linked by oath-paths carrying a value. Each query asks whether a
target cadence value is achievable on *some* oath-path between two named
witnesses. The witness chain may contain redundant loops.

## The bug

Path value is the **XOR** of the edge weights along the path. XOR makes the set of
achievable values a coset of a linear space:

- Fix a BFS/DFS tree per connected component and let `d[x]` be the XOR from the
  root to `x`. Any path `u → v` has base value `d[u] ^ d[v]`.
- Every non-tree edge closes a **fundamental cycle** whose XOR value can be added
  to the walk freely (walk the loop, come back).
- So the achievable set from `u` to `v` is `d[u] ^ d[v] ^ span(cycle values)`.

Redundant loops are therefore not noise — they are exactly the generators of the
reachable set.

## The approach

1. BFS each component, computing `d[x]` and collecting fundamental cycle values.
2. Insert every cycle value into a **GF(2) linear basis** (7 bits, since weights ≤ 63).
3. Answer each query `(u, v, T)`:
   - different components → `NO`
   - otherwise `YES` iff `d[u] ^ d[v] ^ T` lies in the span of that component's basis.

Basis insertion and span testing are both `O(BITS)`, so the whole thing is linear.

## Run

```bash
python solve.py < input.txt
```
