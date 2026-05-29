import type { TransactionReceipt, TransactionResponse } from "ethers";

import { getSplitRequestContract } from "./contract";

export async function splitPayment(recipients: string[], amounts: bigint[]): Promise<TransactionReceipt | null> {
  if (recipients.length !== amounts.length) {
    throw new Error("recipients and amounts must have the same length");
  }

  if (recipients.length === 0) {
    throw new Error("at least one recipient is required");
  }

  const totalAmount = amounts.reduce((total, amount) => total + amount, 0n);
  const contract = getSplitRequestContract();
  const transaction = (await contract.splitPayment(recipients, amounts, {
    value: totalAmount,
  })) as TransactionResponse;

  return transaction.wait();
}
