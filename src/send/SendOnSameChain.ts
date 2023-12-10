import { JsonRpcSigner, TransactionReceipt } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { SendPayload } from "../types";
import { ISend } from "./ISend";
import BaseSend from "./BaseSend";
import { SEND_SCENES } from "../utils/constants";
import { createSA } from "../utils/utilSap";
import { BigNumber } from "@ethersproject/bignumber";
import { isNativeToken, parseChainConfig } from "../utils";
import { MindSAP } from "../MindSAP";
import { defaultAbiCoder } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import { parseUnits } from "@ethersproject/units";
import { arrayify, splitSignature } from "@ethersproject/bytes";
import axios from "axios";

export default class SendOnSameChain extends BaseSend implements ISend {
  constructor(signer: JsonRpcSigner | Wallet, payload: SendPayload) {
    super(signer, payload);
  }

  async send(): Promise<TransactionReceipt> {
    switch (this.scenes) {
      case SEND_SCENES.EOATOEOASA:
        return await this._EOATOEOASA();
      case SEND_SCENES.SATOEOA:
        return await this._SATOEOA();
      // case SEND_SCENES.EOATOSA:
      //   break;
      // case SEND_SCENES.SATOEOASA:
      //   break;
      // case SEND_SCENES.SATOSA:
      //   break;
    }
    throw new Error("This scenario is not supported for now");
  }

  async _EOATOEOASA(): Promise<TransactionReceipt> {
    const { stealthKeyPair, skCipher } = await createSA(
      this.payload.receive.receipt
    );
    const _skCipher = "0x" + skCipher.toString("hex");
    const saDest = stealthKeyPair.address;
    const amount = (this.payload.amount as BigNumber).toBigInt();
    const token = this.payload.token.address;
    const erc20client = await this.getERC20Client();
    if (!isNativeToken(token)) {
      //need approve
      await this.approveERC20Token();
    }
    const res = await erc20client.contract.transferEOAtoSA(
      saDest,
      token,
      amount,
      _skCipher,
      isNativeToken(token) ? { value: amount } : { gasLimit: 5000000 }
    );
    return await res.wait();
  }

  async _SATOEOA(): Promise<TransactionReceipt> {
    const {
      from,
      cipherText,
      receive: { receipt },
      token: { address, decimal },
      amount,
    } = this.payload;
    const chainId = await this.signer.getChainId();
    const chain = parseChainConfig(chainId);
    if (!from || !cipherText) throw new Error("Invalid from and ciphertext");
    const { opKeypair, encKeypair } = await MindSAP.generatePrivateKeys(
      this.signer as JsonRpcSigner
    );
    const stealthKeyPair = MindSAP.isSAForUser(opKeypair, encKeypair, {
      sa: from,
      ciphertext: cipherText,
    });
    if (!stealthKeyPair || !BigNumber.from(from).eq(stealthKeyPair.address))
      throw new Error("SA not from current signer");
    const wallet = new Wallet(stealthKeyPair.privateKeyHex as string);

    const clientContract = await this.getERC20Client();
    const nonce = (await clientContract.contract.getSANounce(
      from
    )) as BigNumber;

    const message = defaultAbiCoder.encode(
      [
        "uint256",
        "address",
        "address",
        "address",
        "uint256",
        "uint256",
        "address",
        "uint256",
      ],
      [
        chainId,
        getAddress(chain.ERC20ClientAddress),
        getAddress(receipt),
        getAddress(address),
        (amount as BigNumber)._hex,
        nonce._hex,
        getAddress("0x79Be957bf7e3003aFd0e78f04Bacbc93D3ef2fB7"), //relayerWalletAddress
        0,
      ]
    );
    const msgBytes = arrayify(message);

    const sigStr = await wallet.signMessage(msgBytes);

    const WithdrawalInputs = {
      stealthAddr: stealthKeyPair.address,
      target: getAddress(receipt),
      amount: (amount as BigNumber)._hex,
      nonce: nonce._hex,
      signature: sigStr,
      sponsorFee: 0,
    };

    const res = await axios.post(
      `https://saprelayer.mindnetwork.xyz/tokens/${address}/relay?chainId=${chainId}`,
      WithdrawalInputs
    );
    return res.data;
  }
}
