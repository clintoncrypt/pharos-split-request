import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { formatEther } from "ethers";

import { generateSplitNarrative, requestPayment, splitPayment } from "../src/tools/split_request";

type CliAction = "split" | "request";

type ParsedArgs = {
  action: CliAction;
  recipients: string[];
  amounts: bigint[];
  memo?: string;
  deadline?: number;
};

function printUsage(): void {
  console.error("Usage:");
  console.error("  ts-node scripts/split.ts split 0xABC,0xDEF 0.1,0.2");
  console.error('  ts-node scripts/split.ts request 0xABC 0.5 "freelance payment" 48');
}

function requireContractAddress(): void {
  if (!process.env.SPLIT_REQUEST_CONTRACT_ADDRESS) {
    console.error("Contract not deployed yet. Run: npm run deploy");
    process.exit(1);
  }
}

function prosToWei(amount: string): bigint {
  const parsedAmount = Number.parseFloat(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error(`Invalid PROS amount: ${amount}`);
  }

  return BigInt(Math.floor(parsedAmount * 1e18));
}

function validateAddress(address: string): void {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.error(`Invalid address: ${address}. Must be a 42-character hex address starting with 0x`);
    process.exit(1);
  }
}

function validateAddresses(addresses: string[]): void {
  addresses.forEach(validateAddress);
}

function parseSplitArgs(args: string[]): ParsedArgs {
  const [recipientsArg, amountsArg] = args;
  if (!recipientsArg || !amountsArg) {
    throw new Error("Missing split recipients or amounts");
  }

  const recipients = recipientsArg
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
  const amounts = amountsArg.split(",").map((amount) => prosToWei(amount.trim()));

  if (recipients.length === 0 || amounts.length === 0) {
    throw new Error("Split requires at least one recipient and amount");
  }

  if (recipients.length !== amounts.length) {
    throw new Error("Split recipients and amounts must have the same length");
  }

  return {
    action: "split",
    recipients,
    amounts,
  };
}

function parseRequestArgs(args: string[]): ParsedArgs {
  const [recipient, amountArg, ...rest] = args;
  if (!recipient || !amountArg) {
    throw new Error("Missing request recipient or amount");
  }

  const deadlineCandidate = rest.length > 0 ? rest[rest.length - 1] : undefined;
  const hasDeadline = deadlineCandidate !== undefined && /^(\d+(\.\d+)?)$/.test(deadlineCandidate);
  const deadlineArg = hasDeadline ? deadlineCandidate : undefined;
  const memoParts = hasDeadline ? rest.slice(0, -1) : rest;
  const memo = memoParts.length > 0 ? memoParts.join(" ") : undefined;
  const deadline = deadlineArg === undefined ? undefined : Number(deadlineArg);
  if (deadline !== undefined && (!Number.isFinite(deadline) || deadline <= 0)) {
    throw new Error("Deadline must be a positive number of hours");
  }

  return {
    action: "request",
    recipients: [recipient],
    amounts: [prosToWei(amountArg)],
    memo,
    deadline,
  };
}

function parseArgs(argv: string[]): ParsedArgs {
  const [action, ...args] = argv;

  if (action === "split") {
    return parseSplitArgs(args);
  }

  if (action === "request") {
    return parseRequestArgs(args);
  }

  throw new Error("Action must be split or request");
}

function shortenAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatPros(amount: bigint): string {
  return formatEther(amount).replace(/\.?0+$/, "");
}

function printConfirmationSummary(parsedArgs: ParsedArgs): void {
  console.log("About to execute onchain transaction:");
  console.log(`  Action:     ${parsedArgs.action}`);
  console.log(`  Recipients: ${parsedArgs.recipients.map(shortenAddress).join(", ")}`);
  console.log(`  Amounts:    ${parsedArgs.amounts.map(formatPros).join(", ")} PROS`);
  console.log(`  Memo:       ${parsedArgs.memo ?? "-"}`);
  console.log(`  Deadline:   ${parsedArgs.deadline ?? "-"}`);
}

async function confirmTransaction(parsedArgs: ParsedArgs): Promise<boolean> {
  printConfirmationSummary(parsedArgs);
  const readline = createInterface({ input, output });

  try {
    const answer = await readline.question("Confirm transaction? (yes/no): ");
    return answer.trim().toLowerCase() === "yes";
  } finally {
    readline.close();
  }
}

function printResult(parsedArgs: ParsedArgs, narrative: string, signal: string, totalAmount: bigint, txHash: string): void {
  console.log("════════════════════════════════════════");
  console.log("  💸 PHAROS SPLIT & REQUEST");
  console.log("════════════════════════════════════════");
  console.log(`  Action:     ${parsedArgs.action}`);
  console.log("  Network:    Pharos Atlantic Testnet · Chain ID 688689");
  console.log("────────────────────────────────────────");
  console.log(`  Recipients: ${parsedArgs.recipients.map(shortenAddress).join(", ")}`);
  console.log(`  Amounts:    ${parsedArgs.amounts.map(formatPros).join(", ")}`);
  console.log(`  Memo:       ${parsedArgs.memo ?? "-"}`);
  console.log(`  Deadline:   ${parsedArgs.deadline ?? "-"}`);
  console.log("────────────────────────────────────────");
  console.log(`  🧠 ${narrative}`);
  console.log(`  Signal:     ${signal}`);
  console.log(`  Total:      ${formatPros(totalAmount)}`);
  console.log(`  Tx Hash:    ${txHash}`);
  console.log("════════════════════════════════════════");
}

async function main(): Promise<void> {
  const parsedArgs = parseArgs(process.argv.slice(2));
  requireContractAddress();
  validateAddresses(parsedArgs.recipients);

  const confirmed = await confirmTransaction(parsedArgs);
  if (!confirmed) {
    console.log("Transaction cancelled.");
    return;
  }

  const receipt =
    parsedArgs.action === "split"
      ? await splitPayment(parsedArgs.recipients, parsedArgs.amounts)
      : await requestPayment(
          parsedArgs.recipients[0],
          parsedArgs.amounts[0],
          parsedArgs.memo ?? "",
          parsedArgs.deadline ?? 24
        );

  const narrative = await generateSplitNarrative(
    parsedArgs.action,
    parsedArgs.recipients,
    parsedArgs.amounts,
    parsedArgs.memo
  );

  const totalAmount = parsedArgs.amounts.reduce((total, amount) => total + amount, 0n);
  printResult(parsedArgs, narrative.narrative, narrative.signal, totalAmount, receipt?.hash ?? "-");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  printUsage();
  process.exitCode = 1;
});
