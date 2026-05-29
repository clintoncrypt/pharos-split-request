import type { TransactionReceipt, TransactionResponse } from "ethers";

import { getSplitRequestContract } from "./contract";

export async function requestPayment(
  to: string,
  amount: bigint,
  memo: string,
  deadlineHours: number
): Promise<TransactionReceipt | null> {
  if (amount <= 0n) {
    throw new Error("amount must be greater than zero");
  }

  if (!Number.isFinite(deadlineHours) || deadlineHours <= 0) {
    throw new Error("deadlineHours must be greater than zero");
  }

  const deadlineSeconds = Math.ceil(deadlineHours * 60 * 60);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);
  const contract = getSplitRequestContract();
  const transaction = (await contract.requestPayment(to, amount, memo, deadline)) as TransactionResponse;

  return transaction.wait();
}
