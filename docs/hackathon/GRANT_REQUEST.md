---
**To:** 0G Foundation / 0G APAC Hackathon Organizers
**From:** ZeroViza Team
**Subject:** Mainnet grant request — ZeroViza (0G APAC Hackathon submission)
**Requested:** ~10 0G mainnet tokens for contract deployment + compute funding
---

# Hi 0G team 👋

I'm building **ZeroViza** for the 0G APAC Hackathon — an AI-powered immigration legal aid platform built entirely on 0G infrastructure.

Before I finalize my submission, I'd like to request a small mainnet allocation so I can deploy my contracts to **0G Aristotle Mainnet** and run live inference through **0G Compute**, as the submission requirements specify a mainnet contract address and verifiable on-chain activity.

---

## What ZeroViza is (one line)

A multilingual AI immigration advisor for immigrants, asylum seekers, and international workers — fully decentralized on 0G, with free AI guidance, tamper-proof document storage, and on-chain verified lawyer credentials.

## The problem I'm solving

Over 280 million people live outside their country of birth. Immigration advice costs $200–500 per hour from lawyers, and many migrants, refugees, and asylum seekers **cannot afford it at all**. Meanwhile, the centralized apps that do exist leak sensitive immigration data — passport numbers, asylum details, family situations — to servers that can be subpoenaed, hacked, or shut down.

ZeroViza fixes both: **free AI-driven guidance** (users pay nothing), and **zero centralized data** (every byte lives on 0G).

## Why this matters for 0G

ZeroViza is one of the few hackathon projects using **three 0G pillars end-to-end in a consumer product**:

| 0G Component | Usage | File |
|---|---|---|
| **0G Compute** | AI inference for multilingual legal guidance (targeting GLM-5 / DeepSeek v3 on mainnet) | `src/lib/0g/compute.ts` |
| **0G Storage** | Chat history, user profiles, documents, lawyer metadata — all content-addressed | `src/lib/0g/storage.ts` |
| **0G Chain** | `StorageIndex.sol` + `LawyerRegistry.sol` — 39 passing Forge tests | `contracts/src/` |

It's a genuine use case for decentralized AI + storage: **sensitive personal data that must not live on any company's database**. That's exactly the story 0G wants to tell to consumers.

## Track fit

**Track 3: Agentic Economy & Autonomous Applications** — AI-driven consumer dApp with on-chain lawyer verification, free-for-users economics, and agent-as-a-service positioning.

## Current status

- ✅ Full-stack app deployed at **[zeroviza.vercel.app](https://zeroviza.vercel.app)**
- ✅ 2 smart contracts deployed to 0G Galileo Testnet (with 39 passing tests)
- ✅ 0G Storage working end-to-end (documents, chat history, profiles)
- ✅ 0G Compute broker integration written and tested on testnet
- ✅ 22 API routes, full wallet support (MetaMask, OKX, Phantom + 7 more)
- ✅ Public GitHub repo with meaningful commit history
- ⏳ **Blocked**: cannot deploy to mainnet or run mainnet inference without mainnet 0G

## What I'm requesting

**~10 mainnet 0G tokens** to cover:

| Purpose | Estimated cost |
|---|---|
| Deploy `StorageIndex.sol` to 0G Aristotle Mainnet | ~0.5 0G |
| Deploy `LawyerRegistry.sol` to 0G Aristotle Mainnet | ~0.5 0G |
| Fund compute ledger (1 0G minimum per 0G docs) | 1 0G |
| Transfer to GLM-5 / DeepSeek provider sub-account | 5 0G |
| Storage uploads for demo seed data + judge testing | 1 0G |
| Buffer for demo recording + live judge verification | 2 0G |
| **Total** | **~10 0G** |

Wallet address for the grant (0G Aristotle Mainnet):
`0xE5A747FA09271C8d479Cf718b205F8aADd6E4C30`

## What I'll deliver in return

1. **Mainnet contract deployment** with verifiable on-chain activity (explorer links in README)
2. **Live 0G Compute inference** on every user chat message (with fee settlement via broker)
3. **Full submission** on HackQuest with demo video showing 0G in action
4. **Public X post** with `#0GHackathon #BuildOn0G` and all required tags
5. **Case study**: I'll write a public technical write-up showing how I used 0G Storage + Compute + Chain together for a consumer app — useful for other builders

## Links

- **Live demo**: https://zeroviza.vercel.app
- **GitHub**: https://github.com/Sage-senpai/Abobi
- **Architecture doc**: [`docs/hackathon/ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Existing testnet contracts**:
  - StorageIndex: `0xbBb868BcA991c8C9e184F236bD7AfAB79e4F602b`
  - LawyerRegistry: `0x009158249E904A7089f8649ABb9b9268780E2D9a`

## Timeline

I need this before **April 22** to have time for mainnet deployment, demo video recording, and submission polish before the May 16 deadline.

Happy to jump on a quick call, share more details, or demo the app live.

Thanks for building 0G — and for making this hackathon happen.

— **Divine**
ZeroViza

---

**Where to send this:**

- 🗨️ 0G Discord `#hackathon-support` or `#grants` channel
- 📧 Email: `hackathon@0g.ai` or `grants@0g.ai` (check official channels first)
- 🐦 DM `@0g_labs` on X with a shorter version linking to this doc
- 💬 HackQuest builder chat if available
