# Text Signing Contract (Solana + Anchor) + Frontend

- Program: charges exactly 0.04 SOL and records text, signer, timestamp
- Frontend: Next.js page with wallet connect and a button that sends 0.04 SOL and (once deployed) can call Anchor RPC

## Dev quickstart

1) Install tools (Rust, Solana CLI, Anchor)
2) Update `Anchor.toml` program id and `app/.env.local` with authority and program id
3) Build/deploy program
4) Run frontend

