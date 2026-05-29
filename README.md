# 💸 Pharos Split & Request

> **The first Pharos skill to split payments across unlimited wallets and create onchain payment requests - all via natural language, powered by AI.**

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Network](https://img.shields.io/badge/Network-Pharos%20Atlantic%20Testnet-purple)
![ChainID](https://img.shields.io/badge/Chain%20ID-688689-green)
![Framework](https://img.shields.io/badge/Framework-LangChain-orange)
![AI](https://img.shields.io/badge/AI-Llama%203.3%2070B%20via%20Groq-red)

---

## 🧠 What Is Pharos Split & Request?

Pharos Split & Request is an AI-native onchain skill that brings real-world payment coordination to the Pharos blockchain. Most onchain tools do one thing for one wallet. This skill does something fundamentally different - it lets an AI agent coordinate payments across **any number of wallets simultaneously**, create trackable payment requests with memos and deadlines, and generate a plain-English AI narrative explaining exactly what happened onchain.

This is not a transfer tool. This is a **payment coordination layer** for the Pharos ecosystem.

---

## ✨ Key Features

- 💥 **Unlimited Recipients** - Split payments to 2, 5, 10, or more wallets in a single onchain transaction. No loops, no multiple transactions - one execution, multiple recipients.
- 🧾 **Onchain Payment Requests** - Create a payment request with a memo and deadline that lives onchain and can be fulfilled before expiry.
- 🤖 **AI Narrative Engine** - Every action generates a plain-English summary powered by Llama 3.3 70B (via Groq, free) explaining what happened and what it means.
- ✅ **Confirmation Prompt** - Before any transaction executes, a full summary is shown and confirmation is required. No accidental sends.
- 🛡️ **Address Validation** - Every recipient address is validated before execution. Invalid addresses are rejected before any gas is spent.
- ⚡ **Pharos Native** - Built for Pharos Atlantic Testnet (Chain ID 688689), exploiting sub-second finality and high throughput.

---

## 🎯 Why This Skill Stands Out

Every other skill fetches a balance, checks a price, or sends a single transfer. **Pharos Split & Request is the only skill that:**

1. Coordinates multi-party payments across unlimited wallets in one transaction
2. Creates enforceable onchain payment requests with memos and deadlines
3. Combines a deployed Solidity smart contract + ethers.js execution + AI narrative in one agent action
4. Maps real human workflows - splitting bills, invoicing, group payments - directly to onchain
5. Uses Groq's free Llama 3.3 70B so anyone can run it with zero AI cost

This is what AI agents were built for - not just reading data, but **coordinating complex financial actions across multiple parties via natural language**.

---

## ✅ Verified Live on Pharos Atlantic Testnet

This skill has been tested and verified on the Pharos Atlantic Testnet with a real onchain transaction:

**Tx Hash:** `0x680dfcafac684f5a0ed68d0912f30a4512148487f4e81d5cb4b6a828c2818dc0`  
**Explorer:** https://atlantic.pharosscan.xyz/tx/0x680dfcafac684f5a0ed68d0912f30a4512148487f4e81d5cb4b6a828c2818dc0  
**Contract:** `0xe9E56d609CDf9a6c430Ec0a5Ca203dEba0a4D6DE`  
**Contract Explorer:** https://atlantic.pharosscan.xyz/address/0xe9E56d609CDf9a6c430Ec0a5Ca203dEba0a4D6DE

---

## 🏗️ How It Works

```text
Natural Language Input
↓
LangChain Tool (SplitRequestTool)
↓
Zod Schema Validation + Address Validation
↓
Confirmation Prompt
↓
SplitRequest.sol Smart Contract
(Events: PaymentSplit, PaymentRequested, RequestFulfilled)
↓
ethers.js → Pharos Atlantic Testnet
↓
Llama 3.3 70B Narrative Engine (Groq)
↓
Formatted Output + Real Tx Hash
```

The `SplitRequest.sol` contract handles all onchain logic - it validates arrays, emits indexed events for every action, and auto-increments request IDs for payment tracking. ethers.js executes transactions using your wallet. Groq's Llama 3.3 70B synthesizes all data into a human-readable narrative with a BULLISH / CAUTION / BEARISH signal.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/clintoncrypt/pharos-split-request.git
cd pharos-split-request
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
PRIVATE_KEY=0x_your_testnet_wallet_private_key
OPENAI_API_KEY=your_groq_api_key_from_console.groq.com
RPC_URL=https://atlantic.dplabs-internal.com
CHAIN_ID=688689
SPLIT_REQUEST_CONTRACT_ADDRESS=
```

⚠️ Use a fresh testnet wallet for `PRIVATE_KEY` - never your main wallet.  
💡 `OPENAI_API_KEY` accepts a Groq key (free at https://console.groq.com) - no OpenAI subscription needed.

### 4. Get free testnet PHRS for gas

Visit https://zan.top/faucet/pharos and paste your wallet address to receive free testnet tokens.

### 5. Deploy the smart contract

```bash
npm run deploy
```

Copy the output address into your `.env` as `SPLIT_REQUEST_CONTRACT_ADDRESS`.

---

## 💡 Usage Examples

### Split between 2 wallets

```bash
npm run split -- split "0xWALLET1,0xWALLET2" 0.001,0.001
```

### Split between 4 wallets - unlimited recipients!

```bash
npm run split -- split "0xWALLET1,0xWALLET2,0xWALLET3,0xWALLET4" 0.25,0.25,0.25,0.25
```

### Split a dinner bill between 5 friends

```bash
npm run split -- split "0xFRIEND1,0xFRIEND2,0xFRIEND3,0xFRIEND4,0xFRIEND5" 0.02,0.02,0.02,0.02,0.02
```

### Create a payment request with memo and 48hr deadline

```bash
npm run split -- request 0xCLIENT 0.5 "Freelance design work - Invoice #001" 48
```

### Example terminal output

```text
════════════════════════════════════════════════
  💸 PHAROS SPLIT & REQUEST
════════════════════════════════════════════════
  Action:     split
  Network:    Pharos Atlantic Testnet · Chain ID 688689
────────────────────────────────────────────────
  Recipients: 0x4c2C...8540, 0xd639...6513
  Amounts:    0.001, 0.001 PROS
  Memo:       -
  Deadline:   -
────────────────────────────────────────────────
  🧠 A split payment of 0.0010 PROS was sent to
  0x4c2C...8540 and 0.0010 PROS to 0xd639...6513,
  totaling 0.002 PROS in a single onchain
  transaction on Pharos Atlantic Testnet.

  Signal:  BULLISH
  Total:   0.002 PROS
  Tx Hash: 0x680dfcafac684f5a0ed68...2818dc0
════════════════════════════════════════════════
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| PRIVATE_KEY | ✅ | Testnet wallet private key (0x + 64 hex chars). |
| OPENAI_API_KEY | ✅ | Groq API key - free at console.groq.com. |
| RPC_URL | ✅ | `https://atlantic.dplabs-internal.com`. |
| CHAIN_ID | ✅ | `688689`. |
| SPLIT_REQUEST_CONTRACT_ADDRESS | ✅ | Output of `npm run deploy`. |

---

## 🛠️ Troubleshooting

| Error | Cause | Fix |
| --- | --- | --- |
| Contract not deployed yet | Missing contract address in `.env`. | Run `npm run deploy` first. |
| Invalid address | Address is not 42 hex characters. | Ensure all addresses start with `0x` and are 42 chars. |
| Insufficient funds | Not enough PHRS for gas. | Get free tokens from https://zan.top/faucet/pharos. |
| RPC timeout | Network unreachable. | Check `https://atlantic.dplabs-internal.com` is reachable. |
| 401 API key error | Wrong AI key format. | Use a Groq key from console.groq.com. |
| Arrays length mismatch | Recipients and amounts count differ. | Ensure equal number of addresses and amounts. |

---

## 📦 Dependencies

| Package | Purpose |
| --- | --- |
| pharos-agent-kit | Pharos blockchain integration. |
| ethers | Smart contract interaction and transaction signing. |
| groq-sdk | Llama 3.3 70B AI narrative generation. |
| @langchain/core | LangChain tool wrapper. |
| zod | Input schema validation. |
| dotenv | Environment variable management. |
| typescript | Type safety. |

---

## 📋 Supported Frameworks

- ✅ LangChain
- ✅ Vercel AI SDK
- ✅ MCP (Model Context Protocol)

---

## 🌐 Network Details

| Property | Value |
| --- | --- |
| Network | Pharos Atlantic Testnet |
| Chain ID | 688689 |
| RPC | https://atlantic.dplabs-internal.com |
| Explorer | https://atlantic.pharosscan.xyz |
| Currency | PHRS |
| Deployed Contract | `0xe9E56d609CDf9a6c430Ec0a5Ca203dEba0a4D6DE` |

---

## 📄 License

Apache 2.0
