import { isHexString } from "@ethersproject/bytes";
import { computeAddress } from "@ethersproject/transactions";
import { getAddress } from "@ethersproject/address";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { chainConfigs, ETH_ADDRESS } from "./constants";
import ERC20Contract from "../contracts/ERC20";
import { ChainConfig } from "../types";
import { BigNumberish, BigNumber } from "@ethersproject/bignumber";
import { isValidSA } from "./utilSap";

export function assertSupportedAddress(receiver: string): string {
  if (isValidSA(receiver)) {
    return receiver;
  }
  if (isHexString(receiver) && receiver.length == 132) {
    // Get address from public key.
    return computeAddress(receiver);
  }

  //normal wallet address
  if (isHexString(receiver) && receiver.length === 42) {
    return getAddress(receiver);
  }

  //TODO: get normal address from ENS
  //TODO: get normal address from CNS

  throw new Error("not supported address");
}

export function getAddressFromENS(address: string) {}

export function getAddressFromCNS(address: string) {}

// The function below is exported for testing purposes only and should not be used outside of this file.
export async function assertSufficientBalance(
  signer: JsonRpcSigner | Wallet,
  token: string,
  tokenAmount: number
) {
  // If applicable, check that sender has sufficient token balance. ETH balance is checked on send. The isEth
  // method also serves to validate the token input
  if (!isNativeToken(token)) {
    const tokenContract = ERC20Contract.connect(token, signer);
    const tokenBalance = await tokenContract.balanceOf(
      await signer.getAddress()
    );
    if (tokenBalance.lt(tokenAmount)) {
      const providedAmount = tokenAmount.toString();
      const details = `Has ${tokenBalance.toString()} tokens, tried to send ${providedAmount} tokens.`;
      throw new Error(`Insufficient balance to complete transfer. ${details}`);
    }
  }
  return true;
}

export function isNativeToken(token: string): boolean {
  return getAddress(token) === ETH_ADDRESS; // throws if `token` is not a valid address
}

export const parseChainConfig = (chainConfig: ChainConfig | number) => {
  if (!chainConfig) {
    throw new Error("chainConfig not provided");
  }

  // If a number is provided, verify chainId value is value and pull config from `chainConfigs`
  if (typeof chainConfig === "number") {
    const validChainIds = Object.keys(chainConfigs);
    if (validChainIds.includes(String(chainConfig))) {
      return chainConfigs[chainConfig];
    }
    throw new Error("Unsupported chain ID provided");
  }

  // Otherwise verify the user's provided chain config is valid and return it
  const { chainId, startBlock, subgraphUrl, ERC20ClientAddress } = chainConfig;
  const isValidStartBlock = typeof startBlock === "number" && startBlock >= 0;

  if (!isValidStartBlock) {
    throw new Error(
      `Invalid start block provided in chainConfig. Got '${startBlock}'`
    );
  }
  if (typeof chainId !== "number" || !Number.isInteger(chainId)) {
    throw new Error(
      `Invalid chainId provided in chainConfig. Got '${chainId}'`
    );
  }
  if (subgraphUrl !== false && typeof subgraphUrl !== "string") {
    throw new Error(
      `Invalid subgraphUrl provided in chainConfig. Got '${String(
        subgraphUrl
      )}'`
    );
  }

  return {
    ERC20ClientAddress: getAddress(ERC20ClientAddress),
    startBlock,
    chainId,
    subgraphUrl,
  };
};

export const infuraUrl = (chainId: BigNumberish, infuraId: string) => {
  chainId = BigNumber.from(chainId).toNumber();
  // For Hardhat, we just use the mainnet chain ID to avoid errors in tests, but this doesn't affect anything.
  if (chainId === 1 || chainId === 1337)
    return `https://mainnet.infura.io/v3/${infuraId}`;
  if (chainId === 10)
    return `https://optimism-mainnet.infura.io/v3/${infuraId}`;
  if (chainId === 5) return `https://goerli.infura.io/v3/${infuraId}`;
  if (chainId === 100) return "https://rpc.ankr.com/gnosis";
  if (chainId === 137)
    return `https://polygon-mainnet.infura.io/v3/${infuraId}`;
  if (chainId === 80001)
    return `https://polygon-mumbai.infura.io/v3/${infuraId}`;
  if (chainId === 42161)
    return `https://arbitrum-mainnet.infura.io/v3/${infuraId}`;
  if (chainId === 11155111) return `https://sepolia.infura.io/v3/${infuraId}`;
  throw new Error(`No Infura URL for chainId ${chainId}.`);
};

export const isPublicKeyExist = (pubkey: string) => {
  if (!isHexString(pubkey))
    throw new Error("Invalid public key, must be a hex string with 0x prefix");

  return !BigNumber.from(pubkey).eq(BigNumber.from("0x".padEnd(68, "0")));
};

export function bigintTo32BytesHex(bigintValue: bigint): string {
  // Convert the bigint to a hex string without the "0x" prefix.
  let hexString = bigintValue.toString(16);

  // Calculate the padding necessary to make it 32 bytes (64 characters)
  const paddingSize = 64 - hexString.length;
  const padding = "0".repeat(paddingSize);

  // Prepend the padding to the hex string
  hexString = padding + hexString;

  return hexString;
}
