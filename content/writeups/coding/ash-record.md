# Ash Record

| | |
| --- | --- |
| Category | Coding |
| Flag | `HTB{th3_h4ml3t_w4s_k3pt_n0t_burn3d}` |

## Description

Residues recovered across the site each carry a timestamp and a material type.
We're given an expected extraction sequence of material types and a `min_gap`
window. Find the longest prefix of that sequence that can be confirmed as a
subsequence of the timestamp-sorted residues, with consecutive matched stages at
least `min_gap` apart.

Residues are **not** given in timestamp order.

## The bug

Classic "longest matchable prefix" DP. `dp[j]` = the earliest timestamp at which
stage `j` can be completed. Process residues in timestamp order and relax:

```
dp[0] = min(dp[0], t)                              if seq[0] == material
dp[j] = min(dp[j], t)   when dp[j-1] <= t - min_gap and seq[j] == material
```

## The gotcha

Within a single residue, a material may appear at several stage indices. If you
update stages in **ascending** `j`, a single residue can advance two stages at
once (`dp[j-1]` gets set by this same residue, then immediately feeds `dp[j]`),
which is wrong — the gap constraint would be violated.

Iterating stage indices in **descending** order fixes it: `dp[j]` always reads a
`dp[j-1]` from strictly before the current residue.

```python
for mt in stages:
    stages[mt].sort(reverse=True)   # <- the whole fix
```

## Run

```bash
python solve.py < input.txt
```
