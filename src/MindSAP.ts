import { ResultType, ScanPayload, SendPayload } from "./types";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import SendFactory from "./send/SendFactory";
import {
  assertSupportedAddress,
  isPublicKeyExist,
  parseChainConfig,
} from "./utils";
import Result from "./utils/result";
import { toUtf8Bytes } from "@ethersproject/strings";
import { hexlify, isHexString } from "@ethersproject/bytes";
import { KEYPAIR_TYPE } from "./utils/constants";
import { sha512 } from "@ethersproject/sha2";
//@ts-ignore
import merge from "lodash/merge";
import KeypairECC from "./keypair/KeypairECC";
import { getKeys, setKeys } from "./contracts/SAPRegistry";
import { parseUnits } from "@ethersproject/units";
import SAERC20Client from "./contracts/SAERC20Clients";
import { BigNumber } from "@ethersproject/bignumber";

const defaultSendPayload = {
  receive: {
    createSA: true,
  },
  token: {
    decimal: 18,
  },
} as SendPayload;

/**
 * @notice Helper method to parse chainConfig input and return a valid chain configuration
 * @param chainConfig Supported chainID as number, or custom ChainConfig
 */
/**
 * @notice Returns the Infura RPC URL for the provided chainId and Infura ID
 */

export class MindSAP {
  readonly stealthType: KEYPAIR_TYPE = KEYPAIR_TYPE.ECC;

  constructor(stealthType?: KEYPAIR_TYPE) {
    if (stealthType) {
      this.stealthType = stealthType;
    }
  }

  /**
   * send transaction from signer
   * @param signer
   * @param payload
   * @returns
   */
  async send(
    signer: JsonRpcSigner | Wallet,
    payload: SendPayload
  ): Promise<ResultType> {
    try {
      payload = merge(defaultSendPayload, payload);

      // Check that recipient is valid and get normal wallet address.
      const receiverAddress = await assertSupportedAddress(
        payload.receive.receipt
      );
      payload.receive.receipt = receiverAddress;
      payload.amount = parseUnits(payload.amount + "", payload.token.decimal);

      //Check that the sender has sufficient balance.
      // await assertSufficientBalance(signer, payload.token, payload.amount);

      const sendInstance = await SendFactory.create(signer, payload);
      const result = await sendInstance.send();
      return Result.success(result);
    } catch (error: any) {
      console.error(error);
      return Result.fail(error);
    }
  }

  async registry(signer: JsonRpcSigner): Promise<ResultType> {
    try {
      const { opKeypair, encKeypair } = await MindSAP.generatePrivateKeys(
        signer
      );

      await setKeys(
        signer,
        opKeypair.publicKeyHex as string,
        encKeypair.publicKeyHex as string
      );

      //alice
      // const sk = new RandomNumber().asBuffer;
      // sk[0] = 0;
      // console.log("🚀 ~ file: MindSAP.ts:95 ~ MindSAP ~ registry ~ sk:", sk);

      // const buffer = encrypt(opKeypair.publicKeyHex as string, sk);
      // console.log(
      //   "🚀 ~ file: MindSAP.ts:97 ~ MindSAP ~ registry ~ buffer:",
      //   buffer
      // );

      // const decyrpt = decrypt(opKeypair.privateKeyHex as string, buffer);
      // console.log(
      //   "🚀 ~ file: MindSAP.ts:104 ~ MindSAP ~ registry ~ decyrpt:",
      //   decyrpt
      // );

      // const randomKeypair = new KeypairECC({ key: `0x${sk.toString("hex")}` });

      // console.log(
      //   "🚀 ~ file: MindSAP.ts:98 ~ MindSAP ~ registry ~ randomKeypair:",
      //   randomKeypair
      // );

      // if (!randomKeypair.publicKeyHex) {
      //   throw new Error("stealthKeyPair generation failed");
      // }
      // const stealthKeyPair = opKeypair.addPublicKey(randomKeypair.publicKeyHex);
      // console.log(
      //   "🚀 ~ file: MindSAP.ts:101 ~ MindSAP ~ registry ~ stealthKeyPair:",
      //   stealthKeyPair
      // );
      // const _stealthKeyPair = opKeypair.addPrivateKey(
      //   randomKeypair.privateKeyHex as string
      // );
      // console.log(
      //   "🚀 ~ file: MindSAP.ts:108 ~ MindSAP ~ registry ~ _stealthKeyPair:",
      //   _stealthKeyPair
      // );

      //TODO: relaywallet 注册方式
      return Result.success(true);
    } catch (error) {
      console.error(error);
      return Result.fail(error);
    }
  }

  async isRegistry(signer: JsonRpcSigner | string): Promise<ResultType> {
    try {
      let address: string;
      if (typeof signer === "string") {
        address = signer;
      } else {
        address = await signer.getAddress();
      }
      const response = await getKeys(address);
      const flag = isPublicKeyExist(response.opPubKey);
      return Result.success(flag);
    } catch (error) {
      console.error(error);
      return Result.fail(error);
    }
  }

  async scan(
    signer: JsonRpcSigner | Wallet,
    payload: ScanPayload
  ): Promise<ResultType> {
    try {
      const chainID = await signer.getChainId();
      const chain = parseChainConfig(chainID);
      const startBlock = payload.startBlock || chain.startBlock;
      const endBlock = payload.endBlock || "latest";

      const { opKeypair, encKeypair } = await MindSAP.generatePrivateKeys(
        signer as JsonRpcSigner
      );

      const contract = new SAERC20Client(signer as JsonRpcSigner, chainID)
        .contract;

      const filter = contract.filters.SATransaction(null, null, null, null);
      const events = await contract.queryFilter(filter, startBlock, endBlock);

      const announcements = await Promise.all(
        events.map(async (event) => {
          // Extract out event parameters
          const announcement = event.args as unknown as {
            ciphertext: string;
            sa: string;
            token: string;
            amount: BigNumber;
          };
          const { ciphertext, sa, amount, token } = announcement;

          const [block, tx] = await Promise.all([
            event.getBlock(),
            event.getTransaction(),
          ]);
          return {
            block: block.number.toString(),
            ciphertext,
            from: tx.from,
            timestamp: String(block.timestamp),
            txHash: event.transactionHash,
            sa,
            amount,
            token,
          };
        })
      );

      const resultList = new Array();

      for (const announcement of announcements) {
        const { sa, ciphertext } = announcement;
        const stealthKeyPair = MindSAP.isSAForUser(opKeypair, encKeypair, {
          sa,
          ciphertext,
        });
        if (
          stealthKeyPair &&
          BigNumber.from(sa).eq(BigNumber.from(stealthKeyPair?.address))
        ) {
          resultList.push(announcement);
        }
      }
      return Result.success(resultList);
    } catch (error) {
      console.error(error);
      return Result.fail(error);
    }
  }

  async swap(): Promise<ResultType> {
    try {
      return Result.success(true);
    } catch (error) {
      console.error(error);
      return Result.fail(error);
    }
  }

  async stake(): Promise<ResultType> {
    try {
      return Result.success(true);
    } catch (error) {
      console.error(error);
      return Result.fail(error);
    }
  }

  //===============inner functions================================//
  static async generatePrivateKeys(signer: JsonRpcSigner) {
    const baseMessage =
      "Sign this message to access your Mind account.\n\nOnly sign this message for a trusted client!";
    const formattedMessage = hexlify(toUtf8Bytes(baseMessage));
    const signature = await signer.signMessage(formattedMessage);
    if (!(isHexString(signature) || signature.length !== 132)) {
      throw new Error("Invalid signature");
    }
    const sigHash = Buffer.from(sha512(signature).slice(2), "hex");
    const opSK = sigHash.slice(0, 32);
    const encSK = sigHash.slice(32);
    opSK[0] &= 0x7f;
    const opKeypair = new KeypairECC({ key: `0x${opSK.toString("hex")}` });
    const encKeypair = new KeypairECC({ key: `0x${encSK.toString("hex")}` });
    return { opKeypair, encKeypair };
  }

  static isSAForUser(
    opKeypair: KeypairECC,
    encKeypair: KeypairECC,
    payload: { sa: string; ciphertext: string }
  ): KeypairECC | undefined {
    try {
      const cipherBytes = Buffer.from(payload.ciphertext.slice(2), "hex");
      const sk = encKeypair.decrypt(cipherBytes);
      const randomKeypair = new KeypairECC({ key: `0x${sk.toString("hex")}` });
      const _stealthKeyPair = opKeypair.addPrivateKey(
        randomKeypair.privateKeyHex as string
      );
      return _stealthKeyPair;
    } catch (error) {
      //console.error(error);
      return;
    }
  }
}
