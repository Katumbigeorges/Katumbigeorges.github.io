# CrownSpire Bellworks

| | |
| --- | --- |
| Category | Web |
| Flag | *(recorded on the scoreboard — fill in)* |

> Note: any extra Docker address / IP in the original prompt was **not** part of
> the challenge.

## Description

> Crownspire is in its last stand... Alyss's cultists have prepared the bell
> tower's next ring — one clean cadence to hold the touched inside the Quiet
> March.
>
> Keir can get one borrowed bell-scribe pass into the desk. From there the job is
> simple and ugly: get standing, make the Keeper's proctor fetch the wrong
> inspection, take the Keeper's access, and change the emergency ring before it
> sounds.
>
> If the bell rings wrong, the puppet-touched wake from Alyss's pull and the true
> dead are put down cleanly. If it rings clean, the lower wards answer Alyss as one.

## The chain

The story spells out a four-step privilege escalation against the Bellworks admin
desk:

1. **Get standing** — enter with the one borrowed *bell-scribe pass* (low-priv
   session / credential).
2. **Proctor confusion** — make the Keeper's proctor "fetch the wrong inspection":
   a server-side request / reference confusion where the privileged component
   fetches an attacker-controlled target.
3. **Take the Keeper's access** — escalate from the fetched inspection to the
   Keeper's (admin) access.
4. **Change the emergency ring** — with Keeper access, overwrite the queued clean
   cadence so the bell "rings wrong".

## Status

Solved on the live instance; the flag was submitted on the scoreboard. The
handout artifacts (app source / Docker) weren't captured in the write-up bundle,
so this page documents the intended chain rather than a re-runnable exploit.

_If you have the original handout, drop `app/` here and this README can be filled
out with the concrete endpoints and payloads._
