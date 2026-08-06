# Rumour Spine

| | |
| --- | --- |
| Category | Coding |
| Difficulty | Hard |
| Points | 925 |
| Flag | `HTB{0n3_c00rd1n4t3d_m0m3nt}` |

## Description

A priming signal travels through a network of quiet hands until a target district
falls still. Miren can expose any quiet hand along the way — one flagged, one
route burned. The coordinator (`S`) and the target district (`T`) can't be touched.

> What is the minimum number of quiet hands that must be exposed to sever every
> path the priming signal could still travel?

## The bug

The story is a **minimum vertex cut** between `S` and `T` in a directed graph.

By Menger's theorem the minimum vertex cut equals the maximum number of
vertex-disjoint `S→T` paths, which is a max-flow problem once you convert vertex
capacities into edge capacities.

## The approach

**Node splitting.** Every node `x` becomes two nodes joined by one edge whose
capacity is the cost of removing `x`:

```
vin(x) = x        vout(x) = x + N
add_edge(vin(x), vout(x), 1)      # exposing this hand costs 1
add_edge(vin(S), vout(S), INF)    # S and T can't be exposed
add_edge(vin(T), vout(T), INF)
```

Each original edge `u → v` becomes `vout(u) → vin(v)` with infinite capacity, so
the cut can never pay for an edge — only for a node.

Run Dinic's algorithm from `vout(S)` to `vin(T)`. The max flow is the min cut is
the answer.

## Run

```bash
python solve.py < input.txt
```
