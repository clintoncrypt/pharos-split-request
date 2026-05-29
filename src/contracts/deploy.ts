import "dotenv/config";

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import solc from "solc";
import { ethers, type InterfaceAbi } from "ethers";

const CONTRACT_NAME = "SplitRequest";
const SOURCE_FILE = "SplitRequest.sol";
const PHAROS_TESTNET_RPC_URL = "https://atlantic.dplabs-internal.com";
const PHAROS_TESTNET_NETWORK = {
  chainId: 688689,
  name: "pharos-atlantic-testnet",
};

type SolcError = {
  severity: "error" | "warning" | "info";
  formattedMessage: string;
};

type SolcContract = {
  abi: InterfaceAbi;
  evm: {
    bytecode: {
      object: string;
    };
  };
};

type SolcOutput = {
  contracts?: Record<string, Record<string, SolcContract>>;
  errors?: SolcError[];
};

export function compileSplitRequest(): { abi: InterfaceAbi; bytecode: string } {
  const contractPath = resolve(process.cwd(), "src", "contracts", SOURCE_FILE);
  const source = readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      [SOURCE_FILE]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input))) as SolcOutput;
  const errors = output.errors?.filter((error) => error.severity === "error") ?? [];

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.formattedMessage).join("\n"));
  }

  const compiledContract = output.contracts?.[SOURCE_FILE]?.[CONTRACT_NAME];
  if (!compiledContract?.evm.bytecode.object) {
    throw new Error(`Unable to compile ${CONTRACT_NAME}`);
  }

  return {
    abi: compiledContract.abi,
    bytecode: `0x${compiledContract.evm.bytecode.object}`,
  };
}

export async function deploySplitRequest(): Promise<string> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is required in .env");
  }

  const rpcUrl = process.env.RPC_URL ?? PHAROS_TESTNET_RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpcUrl, PHAROS_TESTNET_NETWORK);

  const wallet = new ethers.Wallet(privateKey, provider);
  const { abi, bytecode } = compileSplitRequest();
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`${CONTRACT_NAME} deployed to ${address}`);
  writeFileSync(
    resolve(process.cwd(), "deployed.json"),
    `${JSON.stringify({ SPLIT_REQUEST_CONTRACT_ADDRESS: address }, null, 2)}\n`,
    "utf8"
  );
  console.log(`Add this to your .env: SPLIT_REQUEST_CONTRACT_ADDRESS=${address}`);
  return address;
}

if (require.main === module) {
  deploySplitRequest().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
