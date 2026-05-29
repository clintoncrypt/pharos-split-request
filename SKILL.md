# Pharos Split & Request

**Skill name:** Pharos Split & Request

**Tagline:** Split PROS payments across unlimited wallets and create onchain payment requests via natural language - powered by Llama 3.3 70B on Groq

## What It Does

- Splits PROS payments across unlimited recipient wallets in a single onchain transaction with no wallet limit.
- Creates onchain payment requests with a payer address, memo, amount, and deadline.
- Generates an AI-written plain-English narrative for every split or request action.
- Shows a confirmation prompt before every transaction so users can review recipients, amounts, memo, and deadline before anything is sent.

## Why It's Unique

Pharos Split & Request is the first Pharos skill combining a deployed Solidity contract, ethers.js execution, AI narrative, and multi-recipient coordination in one agent action. It maps everyday payment workflows - splitting bills, paying groups, and requesting invoices - into a single onchain primitive that agents can call through natural language.

## Inputs

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| action | `split` \| `request` | Yes | Use `split` to send PROS to multiple recipients, or `request` to create an onchain payment request. |
| recipients | comma-separated 42-char addresses | Yes | Wallet addresses involved in the action. For `split`, these are recipient wallets. For `request`, this is the requested payer address. |
| amounts | PROS values, not wei | Yes | Human-readable PROS amounts such as `0.001` or `0.25`. For `split`, the number of amounts must match the number of recipients. |
| memo | string | No | Optional note attached to a payment request and included in the AI narrative. |
| deadline | hours | No | Optional deadline in hours for `request` actions only. Defaults to 24 hours when omitted. |

## Example CLI Commands

Split 1 PROS across four wallets:

```bash
npm run split -- split "0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222,0x3333333333333333333333333333333333333333,0x4444444444444444444444444444444444444444" 0.25,0.25,0.25,0.25
```

Create a payment request with memo and 48-hour deadline:

```bash
npm run split -- request 0x5555555555555555555555555555555555555555 0.5 "Freelance design work - Invoice #001" 48
```

## Example Terminal Output

```text
════════════════════════════════════════════════
  💸 PHAROS SPLIT & REQUEST
════════════════════════════════════════════════
  Action:     split
  Network:    Pharos Atlantic Testnet · Chain ID 688689
────────────────────────────────────────────────
  Recipients: 0x1111...1111, 0x2222...2222, 0x3333...3333, 0x4444...4444
  Amounts:    0.25, 0.25, 0.25, 0.25 PROS
  Memo:       -
  Deadline:   -
────────────────────────────────────────────────
  🧠 A split payment sent 0.2500 PROS to each of four wallets on Pharos Atlantic Testnet in one coordinated transaction. Total amount involved: 1.0000 PROS.
  Signal:     BULLISH
  Total:      1 PROS
  Tx Hash:    0x680dfcafac684f5a0ed68d0912f30a4512148487f4e81d5cb4b6a828c2818dc0
════════════════════════════════════════════════
```

## Supported Frameworks

- LangChain
- Vercel AI SDK
- MCP

## AI Model

Llama 3.3 70B via Groq (free)

## Dependencies

| Package | Purpose |
| --- | --- |
| pharos-agent-kit | Pharos agent action integration. |
| ethers | Smart contract deployment, signing, and transaction execution. |
| groq-sdk | Llama 3.3 70B narrative generation through Groq. |
| zod | Runtime input validation and action schemas. |
| dotenv | Environment variable loading. |
| @langchain/core | LangChain Tool integration. |
| typescript | Static typing and build verification. |

## Network

Pharos Atlantic Testnet · Chain ID: 688689 · RPC: https://atlantic.dplabs-internal.com · Explorer: https://atlantic.pharosscan.xyz

## Contract

`SplitRequest.sol` handles split payments, payment requests, request fulfillment, request lookup, and event emission. Deploy it with:

```bash
npm run deploy
```

Then copy the output address into `.env` as `SPLIT_REQUEST_CONTRACT_ADDRESS`.

## Verified Live Transaction

Verified live transaction on Pharos Atlantic Testnet: `0x680dfcafac684f5a0ed68d0912f30a4512148487f4e81d5cb4b6a828c2818dc0`
