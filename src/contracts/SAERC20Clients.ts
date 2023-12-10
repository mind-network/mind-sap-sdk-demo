import { Contract } from "@ethersproject/contracts";
import { JsonRpcSigner } from "@ethersproject/providers";
import { parseChainConfig } from "../utils";
import { ChainConfig, EthersProvider } from "../types";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "FailToVerifySignature",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectNounce",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughTokenInSABalance",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughTokenInWalletBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughTokenSendedToSA",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "sa",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "ciphertext",
        type: "bytes",
      },
    ],
    name: "SATransaction",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "enum SAClientERC20.ActionSet",
        name: "action",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "rate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cap",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "floor",
        type: "uint256",
      },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "receiver",
        type: "address",
      },
    ],
    name: "setFeeReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "saDest",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "skCipher",
        type: "bytes",
      },
    ],
    name: "transferEOAtoSA",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "saSrc",
        type: "bytes32",
      },
      {
        internalType: "address payable",
        name: "walletAddressDest",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nounce",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "relayerWallet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gas",
        type: "uint256",
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
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
    ],
    name: "transferSAtoEOA",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "feeBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum SAClientERC20.ActionSet",
        name: "",
        type: "uint8",
      },
    ],
    name: "feeCap",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum SAClientERC20.ActionSet",
        name: "",
        type: "uint8",
      },
    ],
    name: "feeFloor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum SAClientERC20.ActionSet",
        name: "",
        type: "uint8",
      },
    ],
    name: "feeRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeReceiver",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "sa",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getSABalance",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "sa",
        type: "bytes32",
      },
    ],
    name: "getSANounce",
    outputs: [
      {
        internalType: "uint256",
        name: "nounce",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "saAccount",
    outputs: [
      {
        internalType: "uint256",
        name: "nounce",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default class SAERC20Client {
  readonly contract: Contract;

  constructor(
    signerOrProvider: JsonRpcSigner | EthersProvider,
    chainConfig: ChainConfig | number
  ) {
    const chain = parseChainConfig(chainConfig);
    this.contract = new Contract(
      chain.ERC20ClientAddress,
      _abi,
      signerOrProvider
    );
  }
}
