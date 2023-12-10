import { Contract } from "@ethersproject/contracts";
import {
  JsonRpcSigner,
  Provider,
  StaticJsonRpcProvider,
  TransactionReceipt,
} from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { INFURA_ID } from "../config";
import { BytesLike, isHexString } from "@ethersproject/bytes";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
    ],
    name: "KeyChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
    ],
    name: "getKeys",
    outputs: [
      {
        internalType: "bytes32[2]",
        name: "opPubKey",
        type: "bytes32[2]",
      },
      {
        internalType: "bytes32[2]",
        name: "encPubKey",
        type: "bytes32[2]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[2]",
        name: "opPubKey",
        type: "bytes32[2]",
      },
      {
        internalType: "bytes32[2]",
        name: "encPubKey",
        type: "bytes32[2]",
      },
    ],
    name: "setKeys",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        internalType: "bytes32[2]",
        name: "opPubKey",
        type: "bytes32[2]",
      },
      {
        internalType: "bytes32[2]",
        name: "encPubKey",
        type: "bytes32[2]",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
      {
        internalType: "bytes1",
        name: "v",
        type: "bytes1",
      },
      {
        internalType: "uint64",
        name: "chainId",
        type: "uint64",
      },
    ],
    name: "setKeysDelegated",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default class SAPRegistry {
  static connect(
    address: string,
    signerOrProvider: JsonRpcSigner | Wallet | Provider
  ) {
    return new Contract(address, _abi, signerOrProvider);
  }
}

export async function getKeys(
  address: string
): Promise<{ opPubKey: string; encPubKey: string }> {
  const provider = new StaticJsonRpcProvider(
    `https://goerli.infura.io/v3/${INFURA_ID}`
  );
  const contractAddress = "0x5893F7f0b34eeFD28bCC81AcFc441034506B26f0";
  const contract = SAPRegistry.connect(contractAddress, provider);
  const res = await contract.getKeys(address);
  const opPubKeyArray = res[0];
  const encPubKeyArray = res[1];
  const opPubKey = `${opPubKeyArray[0]}${opPubKeyArray[1].slice(2, 4)}`;
  const encPubKey = `${encPubKeyArray[0]}${encPubKeyArray[1].slice(2, 4)}`;
  return { opPubKey, encPubKey };
}

export async function setKeys(
  signer: JsonRpcSigner,
  opPubKey: string,
  encPubKey: string
): Promise<TransactionReceipt> {
  if (!isHexString(opPubKey) || !isHexString(encPubKey))
    throw new Error("pubkey must be a hex string width 0x prefix");
  const opPubKeyBytes = Buffer.from(opPubKey.slice(2), "hex");
  const encPubKeyBytes = Buffer.from(encPubKey.slice(2), "hex");
  const contractAddress = "0x5893F7f0b34eeFD28bCC81AcFc441034506B26f0";
  const contract = SAPRegistry.connect(contractAddress, signer);
  const res = await contract.setKeys(
    [
      opPubKeyBytes.slice(0, 32),
      Buffer.concat([opPubKeyBytes.slice(32), Buffer.alloc(31, 0)]),
    ],
    [
      encPubKeyBytes.slice(0, 32),
      Buffer.concat([encPubKeyBytes.slice(32), Buffer.alloc(31, 0)]),
    ]
  );
  return await res.wait();
}
