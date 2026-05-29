import { formatEther } from "ethers";
import { z } from "zod";

import { generateSplitNarrative, requestPayment, splitPayment } from "../../tools/split_request";

type ActionExample = {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  explanation: string;
};

type PharosAction = {
  name: string;
  similes: string[];
  description: string;
  examples: ActionExample[][];
  schema: z.ZodTypeAny;
  handler: (agent: unknown, input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export const splitRequestActionSchema = z
  .object({
    action: z.enum(["split", "request"]).describe("Whether to split a payment or create a payment request"),
    recipients: z
      .array(z.string().min(1))
      .min(1, "recipients array must have at least 1 entry")
      .describe("Recipient or requested payer wallet addresses"),
    amounts: z.array(z.string().regex(/^\d+$/, "amounts must be wei strings")).min(1).describe("Amounts in wei"),
    memo: z.string().optional().describe("Optional note for the payment request"),
    deadline: z.number().positive().optional().describe("Optional request deadline in hours"),
  })
  .refine((data) => data.recipients.length === data.amounts.length, {
    message: "recipients and amounts arrays must have the same length",
  });

type SplitRequestActionInput = z.infer<typeof splitRequestActionSchema>;

function parseAmounts(amounts: string[]): bigint[] {
  return amounts.map((amount) => BigInt(amount));
}

function formatPros(amount: bigint): string {
  return formatEther(amount).replace(/\.?0+$/, "");
}

async function executeSplitRequest(input: SplitRequestActionInput): Promise<Record<string, string | null>> {
  const amounts = parseAmounts(input.amounts);
  let transactionHash: string | null = null;

  if (input.action === "split") {
    const receipt = await splitPayment(input.recipients, amounts);
    transactionHash = receipt?.hash ?? null;
  } else {
    if (input.recipients.length !== 1 || amounts.length !== 1) {
      throw new Error("request action requires exactly one recipient and one amount");
    }

    const receipt = await requestPayment(input.recipients[0], amounts[0], input.memo ?? "", input.deadline ?? 24);
    transactionHash = receipt?.hash ?? null;
  }

  const narrative = await generateSplitNarrative(input.action, input.recipients, amounts, input.memo);
  const totalAmount = amounts.reduce((total, amount) => total + amount, 0n);

  return {
    message: narrative.narrative,
    signal: narrative.signal,
    generatedAt: narrative.generatedAt,
    totalAmount: totalAmount.toString(),
    totalAmountPros: `${formatPros(totalAmount)} PROS`,
    transactionHash,
  };
}

export const splitRequestAction: PharosAction = {
  name: "PHAROS_SPLIT_REQUEST",
  similes: ["split payment", "request payment", "divide bill", "send invoice", "split bill"],
  description: "Split PROS payments or create payment requests on Pharos Mainnet.",
  examples: [
    [
      {
        input: {
          action: "split",
          recipients: ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"],
          amounts: ["1000000000000000000", "2000000000000000000"],
          memo: "Team dinner",
        },
        output: {
          status: "success",
          message: "Split payment sent successfully.",
          totalAmount: "3000000000000000000",
        },
        explanation: "Split a PROS payment between two wallet addresses.",
      },
    ],
    [
      {
        input: {
          action: "request",
          recipients: ["0x3333333333333333333333333333333333333333"],
          amounts: ["500000000000000000"],
          memo: "Design review",
          deadline: 48,
        },
        output: {
          status: "success",
          message: "Payment request created successfully.",
          totalAmount: "500000000000000000",
        },
        explanation: "Create an onchain payment request for one payer.",
      },
    ],
  ],
  schema: splitRequestActionSchema,
  handler: async (_agent, input) => {
    const parsedInput = splitRequestActionSchema.parse(input);
    return executeSplitRequest(parsedInput);
  },
};

export default splitRequestAction;
