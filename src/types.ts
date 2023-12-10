import {
  JsonRpcSigner,
  StaticJsonRpcProvider,
  Web3Provider,
} from "@ethersproject/providers";
import { BRIDGE_PRTOTOCOL, KEYPAIR_TYPE } from "./utils/constants";
import { BigNumber } from "@ethersproject/bignumber";

export interface ChainConfig {
  chainId: number; // Chain ID of the deployed contract
  ERC20ClientAddress: string; // address of Umbra contract
  startBlock: number; // block Umbra contract was deployed at
  subgraphUrl: string | false; // URL of the subgraph used to fetch Announcement events, or false to not use a subgraph
}

export type ResultType = {
  code: number; // 0 is success
  message?: string;
  result?: any;
};

export type EthersProvider = Web3Provider | StaticJsonRpcProvider;

export type Bridge = {
  chain: number;
  protocol: BRIDGE_PRTOTOCOL;
  token?: string;
};

export type Receive = {
  receipt: string; // address or ENS or CNS or SA SA publicKey
  createSA?: boolean; // default: true; if receipt is SA ignor this parameter
};

export type Token = {
  address: string;
  decimal?: number; //if ERC20Token need set ERC20Token's decimal
};

export type SendPayload = {
  from?: string; // SA
  cipherText?: string; //
  amount: number | BigNumber;
  token: Token; //if ERC20Token need set token address and decimal ETH
  receive: Receive;
  bridge?: Bridge; //
};

export type KeypairECCPayload = {
  key?: string;
};

export type StealthRegistryPayload = {
  signerOrProvider: JsonRpcSigner | EthersProvider;
  chainConfig: ChainConfig | number;
};

export type SetStealthKeysPayload = {
  spendingPublicKey: string;
  viewingPublicKey: string;
};

// Type for storing compressed public keys
export type CompressedPublicKey = {
  prefix: number;
  pubKeyXCoordinate: string; // has 0x prefix
};

export type GetStealthKeysResponse = {
  spendingPublicKey: string;
  viewingPublicKey: string;
};

export type EncryptedPayload = {
  ephemeralPublicKey: string; // hex string with 0x04 prefix
  ciphertext: string; // hex string with 0x prefix
};

export type ScanPayload = {
  startBlock?: number | string;
  endBlock?: number | string;
};

export type TransferEOATOSAPayload = {
  saDest: string;
  token: string;
  amount: number;
  skCipher: Buffer;
};
