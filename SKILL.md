# Pharos Split & Request

**Skill name:** Pharos Split & Request

**Tagline:** Split PROS payments and create onchain payment requests via natural language — powered by GPT-4o

## What It Does

- Splits a native PROS payment across multiple recipient wallets in one onchain transaction.
- Creates onchain payment requests with a memo and deadline so another wallet can fulfill the request later.
- Generates an AI-written, plain-English confirmation narrative for every split or request action.

## Why It's Unique

Pharos Split & Request is the first Pharos skill combining a deployed Solidity contract, ethers.js execution, and GPT-4o narrative in a single agent action. It turns real payment coordination workflows into one agent-ready primitive: decide who is involved, execute the transaction, and explain the result clearly.

## Inputs

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| action | split\|request | Yes | Use `split` to send PROS to multiple recipients, or `request` to create an onchain payment request. |
| recipients | comma-separated addresses | Yes | Wallet addresses involved in the action. For `split`, these are recipients. For `request`, this is the payer address. |
| amounts | PROS, not wei | Yes | Human-readable PROS amounts such as `0.1` or `1.25`. The CLI converts them to wei internally. |
| memo | string | No | Optional note attached to the payment request or confirmation narrative. |
| deadline | hours | No | Optional number of hours until a payment request expires. Defaults to 24 hours in the CLI. |

## Example Inputs

Split 0.3 PROS across two wallets:

```bash
ts-node scripts/split.ts split 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222 0.1,0.2
```

Create a payment request for 0.5 PROS with a memo and 48-hour deadline:

```bash
ts-node scripts/split.ts request 0x3333333333333333333333333333333333333333 0.5 "freelance payment" 48
```

## Example Terminal Output

```text
════════════════════════════════════════
  💸 PHAROS SPLIT & REQUEST
════════════════════════════════════════
  Action:     split
  Network:    Pharos Mainnet · Chain ID 1672
────────────────────────────────────────
  Recipients: 0x1111...1111, 0x2222...2222
  Amounts:    0.1, 0.2
  Memo:       -
  Deadline:   -
────────────────────────────────────────
  🧠 Split 0.1 PROS to 0x1111...1111 and 0.2 PROS to 0x2222...2222 on Pharos Mainnet. Total amount involved: 0.3 PROS.
  Total:      0.3
  Tx Hash:    0x9f2c7a4d6e8b10c12d14e16f1820222426283032343638404244464850528a11
  Signal:     SUCCESS
════════════════════════════════════════
```

## Supported Frameworks

- LangChain
- Vercel AI SDK
- MCP

## Dependencies

- pharos-agent-kit
- openai
- ethers
- zod
- dotenv
- @langchain/core
- typescript

## Network

Pharos Mainnet · Chain ID: 1672 · RPC: https://rpc.pharos.network

## Contract

`SplitRequest.sol` handles split payments, payment requests, request fulfillment, and request lookup. Deploy it first:

```bash
npm run deploy
```

Then add the deployed address to `.env`:

```bash
SPLIT_REQUEST_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```
