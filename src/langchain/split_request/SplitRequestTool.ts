import { Tool } from "@langchain/core/tools";
import { formatEther } from "ethers";
import { z } from "zod";

import { generateSplitNarrative, requestPayment, splitPayment } from "../../tools/split_request";

const splitRequestToolInputSchema = z.object({
  action: z.enum(["split", "request"]),
  recipients: z.array(z.string().min(1)).min(1),
  amounts: z.array(z.string().regex(/^\d+$/, "amounts must be wei strings")).min(1),
  memo: z.string().optional(),
  deadline: z.number().positive().optional(),
});

type SplitRequestToolInput = z.infer<typeof splitRequestToolInputSchema>;

function parseToolInput(input: string): SplitRequestToolInput {
  let parsedInput: unknown;

  try {
    parsedInput = JSON.parse(input);
  } catch {
    throw new Error("Input must be valid JSON");
  }

  return splitRequestToolInputSchema.parse(parsedInput);
}

function parseAmounts(amounts: string[]): bigint[] {
  return amounts.map((amount) => BigInt(amount));
}

function formatPros(amount: bigint): string {
  return formatEther(amount).replace(/\.?0+$/, "");
}

export class SplitRequestTool extends Tool {
  name = "pharos_split_request";
  description =
    "Split PROS payments among multiple recipients or create a payment request on Pharos Mainnet using natural language. Input is JSON with action (split|request), recipients (string[]), amounts (string[] in wei), memo (optional string), deadline (optional number in hours).";

  protected async _call(input: string): Promise<string> {
    const parsedInput = parseToolInput(input);
    const amounts = parseAmounts(parsedInput.amounts);
    let transactionHash: string | undefined;

    if (parsedInput.action === "split") {
      const receipt = await splitPayment(parsedInput.recipients, amounts);
      transactionHash = receipt?.hash;
    } else {
      if (parsedInput.recipients.length !== 1 || amounts.length !== 1) {
        throw new Error("request action requires exactly one recipient and one amount");
      }

      const receipt = await requestPayment(
        parsedInput.recipients[0],
        amounts[0],
        parsedInput.memo ?? "",
        parsedInput.deadline ?? 24
      );
      transactionHash = receipt?.hash;
    }

    if (!transactionHash) {
      return "Transaction failed: no txHash returned. Check your PRIVATE_KEY and contract address.";
    }

    const narrative = await generateSplitNarrative(
      parsedInput.action,
      parsedInput.recipients,
      amounts,
      parsedInput.memo
    );
    const totalAmount = amounts.reduce((total, amount) => total + amount, 0n);

    return [
      `Summary: ${narrative.narrative}`,
      `Signal: ${narrative.signal}`,
      `Generated At: ${narrative.generatedAt}`,
      `Total Amount: ${formatPros(totalAmount)} PROS`,
      transactionHash ? `Transaction Hash: ${transactionHash}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
  }
}
