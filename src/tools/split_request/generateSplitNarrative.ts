import "dotenv/config";

import { formatEther } from "ethers";
import Groq from "groq-sdk";

const SYSTEM_PROMPT =
  'You are a helpful onchain payments assistant. Given a split payment or payment request action on Pharos blockchain, generate a clear 1-2 sentence plain-English confirmation summary of what just happened or what is being requested. Be specific about amounts in PROS and wallet addresses (shorten to first 6 + last 4 chars). Always end with the total amount involved. You must respond with ONLY a raw JSON object — no markdown, no backticks, no explanation. Use exactly this format: {"narrative": "2 sentence analysis here", "signal": "BULLISH"}. Signal must be exactly one of: BULLISH, CAUTION, or BEARISH in uppercase.';

type NarrativeSignal = "BULLISH" | "CAUTION" | "BEARISH";

export type SplitNarrative = {
  narrative: string;
  signal: NarrativeSignal;
  generatedAt: string;
};

const VALID_SIGNALS: NarrativeSignal[] = ["BULLISH", "CAUTION", "BEARISH"];

function formatPros(amount: bigint): string {
  return formatEther(amount).replace(/\.?0+$/, "");
}

function normalizeAmount(amount: bigint | string): bigint {
  return typeof amount === "bigint" ? amount : BigInt(amount);
}

function formatAmountForOpenAI(amount: bigint): string {
  return `${(Number(amount) / 1e18).toFixed(4)} PROS`;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function defaultNarrative(): SplitNarrative {
  return {
    narrative: "Payment split executed successfully on Pharos Atlantic Testnet.",
    signal: "CAUTION",
    generatedAt: new Date().toISOString(),
  };
}

function normalizeSignal(signal: unknown): NarrativeSignal {
  if (typeof signal !== "string") {
    return "CAUTION";
  }

  const normalized = signal.trim().toUpperCase();
  return VALID_SIGNALS.includes(normalized as NarrativeSignal) ? (normalized as NarrativeSignal) : "CAUTION";
}

export async function generateSplitNarrative(
  action: string,
  recipients: string[],
  amounts: bigint[] | string[],
  memo?: string
): Promise<SplitNarrative> {
  if (recipients.length !== amounts.length) {
    throw new Error("recipients and amounts must have the same length");
  }

  const normalizedAmounts = amounts.map(normalizeAmount);
  const displayAmounts = normalizedAmounts.map((amount) => formatAmountForOpenAI(amount));
  const totalAmount = normalizedAmounts.reduce((total, amount) => total + amount, 0n);
  const groq = new Groq({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({
          action,
          memo: memo ?? null,
          recipients: recipients.map((recipient, index) => ({
            address: recipient,
            shortenedAddress: shortenAddress(recipient),
            amountWei: normalizedAmounts[index].toString(),
            amountPros: displayAmounts[index],
          })),
          totalAmountWei: totalAmount.toString(),
          totalAmountPros: `${formatPros(totalAmount)} PROS`,
          responseFormat: {
            narrative: "string",
            signal: "BULLISH | CAUTION | BEARISH",
          },
        }),
      },
    ],
  });

  const responseText = completion.choices[0]?.message.content ?? "";
  try {
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { narrative?: unknown; signal?: unknown };
    const narrative = typeof parsed.narrative === "string" && parsed.narrative.trim().length > 0
      ? parsed.narrative.trim()
      : defaultNarrative().narrative;

    return {
      narrative,
      signal: normalizeSignal(parsed.signal),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return defaultNarrative();
  }
}
