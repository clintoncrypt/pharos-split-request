# 💸 Pharos Split & Request

Split PROS payments and create onchain payment requests from natural language, with GPT-4o confirmations for every action.

![License](Apache-2.0) · ![Network](Pharos Mainnet) · ![Chain ID](1672) · ![Framework](LangChain)

## What It Does

- Splits PROS across multiple recipients in a single onchain transaction.
- Creates onchain payment requests with a payer, amount, memo, and deadline.
- Generates a clear GPT-4o confirmation narrative that explains what happened in plain English.

## Why It's Unique

No other Pharos skill handles multi-recipient coordination, onchain payment requests, and AI narrative in one action. This maps real human workflows, such as splitting bills and sending invoices, directly to onchain execution without forcing users to think in contract calls, wei math, or transaction internals.

## Architecture

The Solidity contract, `SplitRequest.sol`, handles the onchain payment logic. The ethers.js interaction layer executes transactions against Pharos Mainnet. GPT-4o generates a plain-English confirmation after each action. A LangChain Tool wraps the full workflow so agents can call one natural-language payment capability instead of stitching together contract, wallet, and narrative steps manually.

## Quick Start

1. Clone the project.

   ```bash
   git clone <repo-url>
   cd pharos-split-request
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create your environment file and fill in keys.

   ```bash
   cp .env.example .env
   ```

4. Deploy the contract, then copy the output address into `.env` as `SPLIT_REQUEST_CONTRACT_ADDRESS`.

   ```bash
   npm run deploy
   ```

5. Run a split or request action.

   ```bash
   npm run split -- split 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222 0.1,0.2
   ```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| PRIVATE_KEY | Yes | Wallet private key used to deploy the contract and sign transactions. |
| OPENAI_API_KEY | Yes | OpenAI API key used by GPT-4o to generate confirmation narratives. |
| RPC_URL | Yes | Pharos Mainnet RPC endpoint. Defaults to `https://rpc.pharos.network` in `.env.example`. |
| SPLIT_REQUEST_CONTRACT_ADDRESS | Yes | Address returned by `npm run deploy`; required before calling split or request actions. |

## Usage Examples

Split 0.3 PROS between two recipients:

```bash
npm run split -- split 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222 0.1,0.2
```

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
════════════════════════════════════════
```

Create a 0.5 PROS payment request with a memo and 48-hour deadline:

```bash
npm run split -- request 0x3333333333333333333333333333333333333333 0.5 "freelance payment" 48
```

```text
════════════════════════════════════════
  💸 PHAROS SPLIT & REQUEST
════════════════════════════════════════
  Action:     request
  Network:    Pharos Mainnet · Chain ID 1672
────────────────────────────────────────
  Recipients: 0x3333...3333
  Amounts:    0.5
  Memo:       freelance payment
  Deadline:   48
────────────────────────────────────────
  🧠 Created a payment request asking 0x3333...3333 to pay 0.5 PROS for "freelance payment" before the 48-hour deadline. Total amount involved: 0.5 PROS.
  Total:      0.5
  Tx Hash:    0xa12b34c56d78e90f12a34b56c78d90e12f34a56b78c90d12e34f56a78b90c123
════════════════════════════════════════
```

## Troubleshooting

### `Contract not deployed yet. Run: npm run deploy`

Run `npm run deploy` first, then copy the deployed contract address into `.env` as `SPLIT_REQUEST_CONTRACT_ADDRESS`.

### Insufficient Funds

Fund your signing wallet with PROS on Pharos Mainnet before deploying the contract or sending split payments.

### RPC Timeout

Check that `https://rpc.pharos.network` is reachable, then retry the command. If you use a custom RPC, update `RPC_URL` in `.env`.

## Dependencies

| Package | Purpose |
| --- | --- |
| pharos-agent-kit | Action pattern and Pharos agent integration. |
| openai | GPT-4o narrative generation. |
| ethers | Contract deployment, signing, and transaction execution. |
| zod | Runtime input validation. |
| dotenv | Environment variable loading. |
| @langchain/core | LangChain Tool integration. |
| typescript | Static typing and build verification. |

## License

Apache-2.0
