# Abobi Legal

> AI-powered immigration legal guidance for underserved communities worldwide.

**Abobi Legal** is a multilingual immigration legal aid platform built on 0G decentralized infrastructure. It gives immigrants, refugees, and international professionals free, confidential AI guidance — covering visas, asylum, work permits, family reunification, and more — in 7+ languages, with tamper-proof blockchain document storage and on-chain verified lawyer credentials.

---

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10
- MetaMask or compatible EVM wallet (or use Demo Mode — no wallet needed)
- Funded 0G Galileo testnet server wallet
- [Foundry](https://book.getfoundry.sh/) (for contract deployment)

### Install

```bash
pnpm install
```

### Environment

```bash
cp .env.example .env.local
```

Required env vars:

```env
# 0G Galileo Testnet
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_0G_CHAIN_ID=16602

# 0G Storage indexer
OG_INDEXER_RPC=https://indexer-storage-testnet-standard.0g.ai

# Server wallet private key (pays compute + storage on behalf of users)
OG_SERVER_PRIVATE_KEY=0x...

# 0G Compute provider address
OG_COMPUTE_PROVIDER_ADDRESS=0x...

# Smart contracts (deployed on 0G Galileo)
NEXT_PUBLIC_STORAGE_INDEX_ADDRESS=0x...
NEXT_PUBLIC_LAWYER_REGISTRY_ADDRESS=0x...

# Admin secret for lawyer verification
ADMIN_SECRET=your-admin-secret

# WalletConnect (optional — enables QR code on mobile)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### Deploy Contracts

```bash
cd contracts && forge test -vvv   # 39 tests pass

forge script script/Deploy.s.sol \
  --rpc-url og_galileo --broadcast \
  --legacy --gas-price 3000000000 \
  --private-key $OG_SERVER_PRIVATE_KEY
```

Add the output addresses to `.env.local`.

### Run

```bash
pnpm dev       # development server (localhost:3000)
pnpm build     # production build
pnpm start     # serve production build
```

### One-Time AI Setup

```bash
curl -X POST http://localhost:3000/api/setup -H "x-setup-secret: YOUR_SETUP_SECRET"
```

---

## Features

| Feature | Description |
|---------|-------------|
| AI Immigration Advisor | Multilingual AI guided by USCIS, IRCC, UK Home Office, UNHCR |
| Document Vault | Drag-drop upload to 0G blockchain — tamper-proof, verifiable by lawyers |
| Lawyer Registry | On-chain verified lawyer directory with admin approval flow |
| Eligibility Quiz | 4-step interactive quiz for instant visa eligibility assessment |
| Document Checklists | Country + visa-type specific document requirement lists |
| Policy Alerts | Strip of recent immigration policy changes and deadlines |
| Resources Hub | Country guides: US, UK, Canada, EU, Australia, UAE, Japan, Nigeria + more |
| Dashboard | Activity graph, daily streak, session stats |
| Demo Mode | Full app preview without a wallet — zero friction onboarding |
| Multilingual | English, Spanish, French, Hausa, Yoruba, Igbo, Portuguese + auto-detect |

---

## Stack (V2.5)

- **Framework**: Next.js 15.5 (App Router), React 19
- **CSS**: Tailwind v4 with `@theme inline` design tokens
- **Auth**: Wagmi v2 + RainbowKit v2 — 0G Galileo (Chain ID 16602)
- **AI**: `qwen/qwen-2.5-7b-instruct` via 0G Compute Network
- **Storage**: `@0glabs/0g-ts-sdk` — content-addressed decentralized file storage
- **Data Layer**: `StorageIndex.sol` + `LawyerRegistry.sol` on 0G Galileo (no SQLite)
- **Contracts**: Foundry (Solidity 0.8.24), ethers.js 6.16 integration
- **State**: Zustand + TanStack Query
- **Animation**: Framer Motion

---

## Smart Contracts

| Contract | Address (Galileo) | Purpose |
|----------|-------------------|---------|
| `StorageIndex` | `0xbBb868BcA991c8C9e184F236bD7AfAB79e4F602b` | Maps wallet -> 0G root hashes (history, profile, documents) |
| `LawyerRegistry` | `0x009158249E904A7089f8649ABb9b9268780E2D9a` | On-chain lawyer verification + metadata URI |

All user data lives on 0G Storage. Contracts serve as mutable pointers to the latest version. No centralized database.

---

## Deployment (Vercel)

```bash
pnpm build
vercel --prod
```

Set all env vars in Vercel dashboard. V2.5 has **zero filesystem dependencies** — fully compatible with serverless.

---

## Docs

- [V2.5 Release Notes](docs/V2.5.md) — architecture changes, contract details, migration notes
- [Technical Documentation](docs/README.md) — full project structure, API reference
- [Feature Specification](docs/features.md) — complete feature list with status
- [Pitch Document](docs/pitch.md) — problem, market, solution, roadmap
