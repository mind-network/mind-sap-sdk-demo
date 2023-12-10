import { Contract } from "@ethersproject/contracts";
import { JsonRpcSigner, TransactionReceipt } from "@ethersproject/providers";
import { parseChainConfig } from "../utils";
import {
  ChainConfig,
  EthersProvider,
  GetStealthKeysResponse,
  SetStealthKeysPayload,
} from "../types";
import IStealthRegistry from "./IStealthRegistry";
import KeypairECC, { RandomNumber } from "../keypair/KeypairECC";

const _abi = [
  "event StealthKeyChanged(address indexed registrant, uint256 spendingPubKeyPrefix, uint256 spendingPubKey, uint256 viewingPubKeyPrefix, uint256 viewingPubKey)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function STEALTHKEYS_TYPEHASH() view returns (bytes32)",
  "function setStealthKeys(uint256 spendingPubKeyPrefix, uint256 spendingPubKey, uint256 viewingPubKeyPrefix, uint256 viewingPubKey)",
  "function setStealthKeysOnBehalf(address registrant, uint256 spendingPubKeyPrefix, uint256 spendingPubKey, uint256 viewingPubKeyPrefix, uint256 viewingPubKey, uint8 v, bytes32 r, bytes32 s)",
  "function stealthKeys(address registrant) view returns (uint256 spendingPubKeyPrefix, uint256 spendingPubKey, uint256 viewingPubKeyPrefix, uint256 viewingPubKey)",
];

export default class StealthRegistryECC implements IStealthRegistry {
  readonly contract: Contract;
  readonly chain: ChainConfig;

  constructor(
    signerOrProvider: JsonRpcSigner | EthersProvider,
    chainConfig: ChainConfig | number
  ) {
    this.chain = parseChainConfig(chainConfig);
    this.contract = new Contract(
      this.chain.stealthAddress,
      _abi,
      signerOrProvider
    );
  }

  async stealthGenerate(address: string): Promise<any> {
    const { spendingPublicKey, viewingPublicKey } = await this.getStealthKeys(
      address
    );

    if (!spendingPublicKey || !viewingPublicKey) {
      throw new Error(
        `Could not retrieve public keys for recipient ID ${address}`
      );
    }

    const spendingKeyPair = new KeypairECC({ key: spendingPublicKey });
    const viewingKeyPair = new KeypairECC({ key: viewingPublicKey });

    // Generate random number
    const randomNumber = new RandomNumber();

    // Encrypt random number with recipient's public key
    const encrypted = viewingKeyPair.encrypt(randomNumber);

    // Get x,y coordinates of ephemeral private key
    const { pubKeyXCoordinate } = KeypairECC.compressPublicKey(
      encrypted.ephemeralPublicKey
    );

    // Compute stealth address
    const stealthKeyPair = spendingKeyPair.mulPublicKey(randomNumber);

    return { stealthKeyPair, pubKeyXCoordinate, encrypted };
  }

  async setStealthKeys(
    payload: SetStealthKeysPayload
  ): Promise<TransactionReceipt> {
    const { spendingPublicKey, viewingPublicKey } = payload;
    if (!spendingPublicKey || !viewingPublicKey) {
      throw new Error("Invalid spending public key or viewing public key");
    }
    const { prefix: spendingPrefix, pubKeyXCoordinate: spendingPubKeyX } =
      KeypairECC.compressPublicKey(spendingPublicKey);
    const { prefix: viewingPrefix, pubKeyXCoordinate: viewingPubKeyX } =
      KeypairECC.compressPublicKey(viewingPublicKey);

    const res = await this.contract.setStealthKeys(
      spendingPrefix,
      spendingPubKeyX,
      viewingPrefix,
      viewingPubKeyX
    );
    return await res.wait();
  }

  async getStealthKeys(account: string): Promise<GetStealthKeysResponse> {
    // Read stealth keys from the resolver contract
    const keys = await this.contract.stealthKeys(account);
    const {
      spendingPubKeyPrefix,
      spendingPubKey,
      viewingPubKeyPrefix,
      viewingPubKey,
    } = keys;
    if (
      spendingPubKeyPrefix.eq(0) ||
      spendingPubKey.eq(0) ||
      viewingPubKeyPrefix.eq(0) ||
      viewingPubKey.eq(0)
    ) {
      throw new Error(
        `Address ${account} has not registered stealth keys on ${this.chain.chainId} chain. Please ask them to setup their Mind account`
      );
    }

    const spendingPublicKey = KeypairECC.getUncompressedFromX(
      spendingPubKey,
      spendingPubKeyPrefix.toNumber()
    );
    const viewingPublicKey = KeypairECC.getUncompressedFromX(
      viewingPubKey,
      viewingPubKeyPrefix.toNumber()
    );
    return {
      spendingPublicKey,
      viewingPublicKey,
    };
  }
}
