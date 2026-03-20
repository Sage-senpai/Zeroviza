# ZeroViza Development Roadmap

**Hackathon**: 0G APAC Hackathon
**Deadline**: May 9, 2026 (23:59 UTC+8)
**Current Version**: V2.5 (fully decentralized on 0G)
**Target**: V3.0 — production-grade, multi-model, privacy-first

---

## Phase 1: Foundation Hardening (March 20–28)
> Get the existing app bulletproof and demo-ready.

### M1.1 — Contract Deployment & Verification
- [ ] Deploy StorageIndex + LawyerRegistry to **0G Galileo V3** (chain ID 16601 — verify current testnet)
- [ ] Verify both contracts on 0G Explorer (chainscan-galileo.0g.ai)
- [ ] Fund server wallet with testnet 0G tokens (faucet)
- [ ] Run `/api/setup` endpoint to deposit into compute ledger + acknowledge provider
- [ ] Smoke test: full flow (connect wallet → ask question → get AI response → check 0G Storage)

### M1.2 — Model Upgrade
- [ ] Test DeepSeek Chat v3 on 0G Compute (better legal reasoning than qwen-2.5-7b)
- [ ] Add `OG_COMPUTE_MODEL_ID` env var for easy model switching
- [ ] A/B test: compare response quality on 10 real immigration questions
- [ ] If DeepSeek unavailable on broker, try gpt-oss-120b or GLM-5
- [ ] Set final model choice based on quality + availability

### M1.3 — Bug Fixes & UX Polish
- [ ] Test full wallet connect → disconnect → reconnect flow on mobile (MetaMask browser, OKX, Trust)
- [ ] Verify chat history persists across sessions (disconnect → reconnect → same history)
- [ ] Fix any broken transitions or layout shifts on mobile
- [ ] Test demo mode end-to-end
- [ ] Add error toasts for failed API calls (instead of silent failures)

**Deliverable**: Working demo that anyone can connect wallet and get AI immigration guidance.

---

## Phase 2: Multi-Modal AI (March 29 – April 8)
> Add voice input and document scanning — massive differentiators.

### M2.1 — Voice Input (Whisper on 0G Compute)
- [ ] Integrate 0G Compute's Whisper Large v3 for speech-to-text
- [ ] Add microphone button to ChatInput component
- [ ] Record audio in browser (MediaRecorder API), send to `/api/transcribe`
- [ ] New API route: `/api/transcribe` — accepts audio blob, calls Whisper, returns text
- [ ] Auto-populate transcription in chat input, user can edit before sending
- [ ] Support: English, Spanish, French, Arabic, Hindi, Yoruba, Hausa, Portuguese, Swahili
- [ ] Mobile-first: large mic button, visual recording indicator, auto-stop after silence

### M2.2 — Document Scanning (Vision Model on 0G Compute)
- [ ] Integrate Qwen3-VL 30B (vision-language) on 0G Compute
- [ ] New feature: "Scan Document" — user photographs passport/visa/letter
- [ ] New API route: `/api/scan` — accepts image, sends to vision model with prompt: "Extract all text and key fields from this immigration document"
- [ ] Display extracted text in chat with option to ask follow-up questions about the document
- [ ] Privacy note: image processed in TEE, never stored on server

### M2.3 — Smart Document Analysis
- [ ] When user uploads a document to the vault, offer "Analyze this document"
- [ ] AI reads document metadata + extracted text and gives immigration-relevant summary
- [ ] Example: Upload offer letter → AI says "This letter meets UK Skilled Worker visa salary threshold of £38,700"

**Deliverable**: Users can speak questions and photograph documents — accessibility for users with low literacy or language barriers.

---

## Phase 3: Privacy & Sealed Inference (April 9–18)
> Leverage 0G's newest feature for the hackathon wow factor.

### M3.1 — Sealed Inference Integration
- [ ] Research 0G Sealed Inference API (TEE-verified compute)
- [ ] Route all AI consultations through Sealed Inference providers
- [ ] Add Remote Attestation (RA) report download to chat UI
- [ ] Display "Verified Secure" badge with TEE attestation hash
- [ ] Create `/api/attestation` route to fetch and verify RA reports

### M3.2 — Privacy Dashboard
- [ ] New page: `/privacy` — shows user their data footprint
- [ ] Display: which 0G Storage roots contain their data, contract addresses, TEE attestation
- [ ] "Export My Data" button — downloads all user data from 0G Storage
- [ ] "Delete My Data" button — removes contract pointers (data immutable on 0G but pointers cleared)
- [ ] Explain decentralized architecture in user-friendly terms

### M3.3 — Encrypted Chat History
- [ ] Encrypt chat history before uploading to 0G Storage (AES-256-GCM)
- [ ] Key derived from user's wallet signature (EIP-712)
- [ ] Only the user's wallet can decrypt their history — not even the server
- [ ] Update storage/download functions to handle encryption/decryption

**Deliverable**: Provably private AI consultations with cryptographic proof — the only immigration advisor where even the platform operator can't read your conversations.

---

## Phase 4: On-Chain Identity & Agent (April 19–28)
> Deep 0G ecosystem integration — ERC-7857 iNFT.

### M4.1 — ZeroViza Agent as iNFT (ERC-7857)
- [ ] Study ERC-7857 standard (0G's Intelligent NFT)
- [ ] Write `ZeroVizaAgent.sol` — mints the AI advisor as an iNFT
- [ ] Store system prompt hash + model config on-chain as agent metadata
- [ ] Implement `authorizeUsage()` — allow third parties to use the agent
- [ ] Deploy to 0G Galileo, verify on explorer

### M4.2 — Case Tracker
- [ ] New page: `/cases` — users can create immigration cases (e.g., "H-1B Application 2026")
- [ ] Each case: timeline of steps, document checklist, deadline reminders
- [ ] AI generates case plan from initial consultation
- [ ] Case data stored on 0G Storage, indexed by StorageIndex contract
- [ ] Share case with lawyer (generate read-only link via 0G Storage hash)

### M4.3 — Lawyer Matching
- [ ] AI recommends verified lawyers based on user's case type, language, jurisdiction
- [ ] "Connect with Lawyer" button on chat — packages conversation + documents into shareable case file
- [ ] Lawyer receives case file via 0G Storage hash (wallet-to-wallet, no intermediary)

**Deliverable**: ZeroViza is a tokenized AI agent on 0G with case management and lawyer matching.

---

## Phase 5: Submission Polish (April 29 – May 9)
> Everything needed for a winning submission.

### M5.1 — Mainnet Deployment (if 0G mainnet required)
- [ ] Deploy contracts to 0G Aristotle mainnet
- [ ] Fund mainnet server wallet
- [ ] Update all env vars for mainnet
- [ ] Verify contracts on mainnet explorer
- [ ] Test full flow on mainnet

### M5.2 — Demo Video (3 minutes max)
Script outline:
1. **0:00–0:15** — Problem statement: "Millions of immigrants can't afford legal advice"
2. **0:15–0:45** — Connect wallet → ask immigration question → get AI response
3. **0:45–1:15** — Voice input (speak a question in Spanish/Yoruba) → AI responds in same language
4. **1:15–1:45** — Scan passport photo → AI extracts info → recommends visa options
5. **1:45–2:15** — Document vault → upload → tamper-proof storage → share with lawyer
6. **2:15–2:45** — Privacy dashboard → TEE attestation → encrypted history proof
7. **2:45–3:00** — Architecture: 0G Storage + Compute + Chain + Sealed Inference + iNFT

### M5.3 — Documentation
- [ ] Architecture diagram (draw.io or Excalidraw) showing all 0G integrations
- [ ] Update README with: project overview, 0G components, setup guide, test accounts
- [ ] Write technical deep-dive: how each 0G module is used
- [ ] Prepare judge-friendly README section: "0G Integration Proof"
- [ ] Add faucet links and test wallet instructions for reviewers

### M5.4 — Social & Submission
- [ ] X post with demo clip + #0GHackathon #BuildOn0G @0G_labs @0g_CN @0g_Eco @HackQuest_
- [ ] Submit on HackQuest: project info, GitHub, contract addresses, explorer links, demo video, README
- [ ] Optional: pitch deck (5-8 slides), frontend demo link, tutorial write-up

---

## 0G Integration Depth Summary

| 0G Component | Current (V2.5) | Target (V3.0) |
|---|---|---|
| **0G Chain** | StorageIndex + LawyerRegistry contracts | + ZeroVizaAgent iNFT (ERC-7857) |
| **0G Storage** | Documents, chat history, profiles, lawyer metadata | + Encrypted storage, case files, shared lawyer access |
| **0G Compute** | qwen-2.5-7b text inference | + DeepSeek/GLM-5, Whisper voice, Qwen3-VL vision |
| **Sealed Inference** | Not yet | TEE-verified consultations + RA attestation |
| **Agent ID (iNFT)** | Not yet | ZeroViza minted as ERC-7857 intelligent NFT |

**Result**: Integration across **5 of 0G's core pillars** — more than most hackathon teams will achieve.

---

## Priority Matrix

If time is short, prioritize in this order:
1. **Phase 1** (M1.1–M1.3) — Without this, nothing works. Non-negotiable.
2. **Phase 5** (M5.2–M5.4) — Without submission materials, you can't win. Non-negotiable.
3. **Phase 2** (M2.1) — Voice input alone is a massive differentiator.
4. **Phase 3** (M3.1) — Sealed Inference is brand new (March 2026) — judges will notice.
5. **Phase 4** (M4.1) — ERC-7857 iNFT shows deep ecosystem knowledge.
6. **Phase 2** (M2.2) — Document scanning is impressive but complex.
7. **Phase 3** (M3.3) — Encrypted history is the gold standard but can be deferred.
8. **Phase 4** (M4.2–M4.3) — Case tracker + lawyer matching are nice-to-have.
