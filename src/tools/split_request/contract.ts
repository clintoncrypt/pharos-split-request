import "dotenv/config";

import { ethers, type InterfaceAbi } from "ethers";

const PHAROS_RPC_URL = "https://atlantic.dplabs-internal.com";
const PHAROS_NETWORK = {
  chainId: 688689,
  name: "pharos-atlantic-testnet",
};

export const SPLIT_REQUEST_ABI: InterfaceAbi = [
  "function splitPayment(address[] recipients, uint256[] amounts) payable",
  "function requestPayment(address from, uint256 amount, string memo, uint256 deadline) returns (uint256 requestId)",
  "function fulfillRequest(uint256 requestId) payable",
  "function getRequest(uint256 requestId) view returns (address requester, address from, uint256 amount, string memo, uint256 deadline, bool paid)",
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required in .env`);
  }

  return value;
}

export function getSplitRequestContract(): ethers.Contract {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL ?? PHAROS_RPC_URL, PHAROS_NETWORK);
  const wallet = new ethers.Wallet(requireEnv("PRIVATE_KEY"), provider);
  return new ethers.Contract(requireEnv("SPLIT_REQUEST_CONTRACT_ADDRESS"), SPLIT_REQUEST_ABI, wallet);
}
