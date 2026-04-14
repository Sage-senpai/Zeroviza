# ZeroViza Demo Video — Shot List (3 min max)

> Hackathon judges will watch this ONCE. Every second has to earn its place.

## Recording checklist before you hit record

- [ ] Chrome in a **clean profile** (no extensions visible in tab bar)
- [ ] Screen resolution 1920×1080
- [ ] Close all other tabs, Slack, notifications
- [ ] Dev tools CLOSED (unless a shot explicitly calls for them)
- [ ] Wallet on **0G Aristotle Mainnet** (not testnet)
- [ ] Have 2 Chrome windows ready: **app** + **0G explorer**
- [ ] Have 1 passport/ID photo ready to drag-drop (sanitized — use a blurred sample)
- [ ] Mic test: speak clearly, no background noise
- [ ] Use Loom, OBS, or ScreenStudio — no phone cameras
- [ ] Record in one take if possible, cut later

---

## Scene-by-scene shot list

### Scene 1 — Hook (0:00 – 0:12)

**Visual**: Full-screen ZeroViza landing page `/connect`, logo prominent

**Voiceover**:
> "280 million people live outside their country of birth. Most can't afford a lawyer. And the apps that do help them leak their most private data to centralized servers. ZeroViza fixes both."

**Action**: None. Just the landing page sitting still.

---

### Scene 2 — Product intro (0:12 – 0:25)

**Visual**: Scroll down the landing page slowly, showing the "Powered by 0G" footer + wallet options

**Voiceover**:
> "ZeroViza is a decentralized AI immigration advisor — built entirely on 0G. Free AI guidance in 30+ languages. Tamper-proof document storage. On-chain verified lawyers. No central database. Anywhere."

**Action**: One smooth scroll from top to footer.

---

### Scene 3 — Connect wallet (0:25 – 0:40)

**Visual**: Click "Connect Wallet" → RainbowKit modal opens → show all 10 wallet options → click MetaMask → connect → auto-redirect to dashboard

**Voiceover**:
> "Connect any EVM wallet — MetaMask, OKX, Phantom, Coinbase. No password. No email. Your wallet is your identity."

**Action**:
1. Click "Connect Wallet"
2. Pause 1 second on the wallet list so viewers can see the 10+ options
3. Click MetaMask
4. Approve in extension popup (cut this if it looks too long)
5. Land on dashboard

---

### Scene 4 — AI advisor in action (0:40 – 1:20) **← THE HERO SHOT**

**Visual**: Click AI Advisor → type a real question → watch AI response stream in

**Voiceover**:
> "Ask anything. Here's a real question: what visa options does a Nigerian software engineer have for the US? The AI response comes from GLM-5 running on 0G Compute Network — decentralized inference, paid for by the app, not the user."

**Action**:
1. Click "AI Advisor" in sidebar
2. Type: **"I'm a software engineer from Nigeria. What US visa options do I have?"**
3. Let the response stream in naturally — DON'T speed this up, the streaming is impressive
4. Once response is visible, scroll through it so judges can see the quality
5. Highlight the "Online · 0G Compute · Not legal advice" badge at the top

**Key thing to emphasize in VO**: "The app pays for inference — users pay zero. That's critical for a service targeting people who can't afford lawyers."

---

### Scene 5 — Document vault (1:20 – 1:45)

**Visual**: Navigate to Documents → drag-drop a passport image → show upload → show the file in the vault with its 0G root hash

**Voiceover**:
> "Upload sensitive documents — passports, birth certificates, asylum papers. They're stored on 0G Storage, content-addressed, tamper-proof. The hash you see is a Merkle root — the document can't be altered without changing the hash."

**Action**:
1. Click "Documents" in sidebar
2. Drag-drop a sample image file
3. Wait for "Uploading to 0G..." indicator
4. Show the completed upload with the root hash visible
5. Hover the hash to show the full value

---

### Scene 6 — Lawyer registry (1:45 – 2:00)

**Visual**: Navigate to Lawyers → show the verified lawyer list → click a lawyer card

**Voiceover**:
> "Need a human? Verified lawyers are registered on-chain. Their credentials can't be faked — every status change is a transaction on 0G Chain."

**Action**:
1. Click "Lawyers"
2. Show the grid of verified lawyers
3. Click one card to show details

---

### Scene 7 — THE PROOF: 0G Explorer (2:00 – 2:40) **← CRITICAL**

This is the scene that proves 0G is actually being used. Judges WILL verify.

**Visual**: Open 0G Explorer in a new tab → paste the `StorageIndex` contract address → show the contract page with real transactions

**Voiceover**:
> "Here's the proof this isn't just a UI demo. This is the StorageIndex contract on 0G Aristotle Mainnet. Every one of these transactions is a real user uploading data. This is the LawyerRegistry contract — here's the verify transaction for the lawyer I just showed you. And here's a 0G Storage root hash fetched live from the indexer."

**Action**:
1. Open `https://chainscan.0g.ai` in new tab
2. Paste StorageIndex contract address
3. Scroll through the transactions tab — show 3-5 real txs
4. Open LawyerRegistry contract address in another tab
5. Show at least 1 `LawyerVerified` event
6. (Optional power move) Open 0G Storage indexer URL + a root hash to show the raw content

---

### Scene 8 — Impact close + CTA (2:40 – 3:00)

**Visual**: Back to the ZeroViza home page → show the tagline + URL

**Voiceover**:
> "ZeroViza. AI immigration legal aid that can't be shut down, can't be subpoenaed, can't be afforded to ignore. Built on 0G. Try it at zeroviza.vercel.app."

**Action**: Final shot — clean landing page, URL visible.

---

## Post-production

- **Add captions** — non-native English judges will thank you (and APAC hackathon)
- **Color correct** if your screen looks washed out
- **Cut the wallet approval modal** if it takes more than 2 seconds
- **Add a 1-frame watermark** with GitHub URL and contract address in the corner of every scene so anyone pausing can copy them
- **Export at 1080p 30fps** — not 4K (wastes bandwidth, judges watch on laptops)
- **Upload to Loom AND YouTube** (Loom is faster for judges, YouTube is the official submission link)

---

## What to say in the Loom description / YouTube title

**Title**: `ZeroViza — Decentralized AI Immigration Legal Aid on 0G | 0G APAC Hackathon 2026`

**Description template**:
```
ZeroViza is a consumer AI dApp that uses 3 of the 5 0G pillars end-to-end:

• 0G Compute — GLM-5 inference via broker (zero-knowledge of user)
• 0G Storage — documents, chat history, profiles (content-addressed)
• 0G Chain — StorageIndex + LawyerRegistry smart contracts (operator pattern)

Built for: #0GHackathon #BuildOn0G

Contracts (0G Aristotle Mainnet):
• StorageIndex:   0x<paste address>
• LawyerRegistry: 0x<paste address>

Live demo:  https://zeroviza.vercel.app
GitHub:     https://github.com/Sage-senpai/Abobi
Docs:       [link to docs/hackathon/ARCHITECTURE.md]

Team: Divine (@yourhandle)
Track: 3 — Agentic Economy & Autonomous Applications
```

---

## If anything breaks during recording

1. **Mainnet compute timeout** → fall back to Groq + say "running on 0G Compute Network with Groq as emergency fallback for demo reliability"
2. **Upload fails** → show the Vercel logs briefly to prove it's trying, then cut to a pre-recorded successful upload
3. **Contracts not deployed yet** → record with testnet addresses, add a text overlay: "Mainnet deploy pending 0G grant approval"

Don't lie about what's working. Judges can tell, and they appreciate honesty more than polish.
