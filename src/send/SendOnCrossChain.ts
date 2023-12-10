import { JsonRpcSigner, TransactionReceipt } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  BRIDGE_PRTOTOCOL,
  CCIPBridgeAddress,
  CCIPBridgeDestination,
  SEND_SCENES,
} from "../utils/constants";
import { SendPayload } from "../types";
import BaseSend from "./BaseSend";
import { ISend } from "./ISend";
import { createSA } from "../utils/utilSap";
import { BigNumber } from "@ethersproject/bignumber";
import SAPBridge from "../contracts/SAPBridge";
import { isNativeToken } from "../utils";

export default class SendOnCrossChain extends BaseSend implements ISend {
  constructor(signer: JsonRpcSigner | Wallet, payload: SendPayload) {
    super(signer, payload);
  }

  async send(): Promise<TransactionReceipt> {
    const chainId = await this.signer.getChainId();
    const receiveChainId = this.payload.bridge?.chain;
    const protocol = this.payload.bridge?.protocol;

    if (
      chainId !== 11155111 ||
      receiveChainId !== 80001 ||
      protocol !== BRIDGE_PRTOTOCOL.CCIP
    ) {
      throw new Error(
        "cross chain just supports Sepolia to Mumbai and token is USDC and protocal is CCIP for now"
      );
    }

    if (!isNativeToken(this.payload.token.address)) {
      //need approve
      await this.approveERC20Token(CCIPBridgeAddress);
    }
    switch (this.scenes) {
      case SEND_SCENES.EOATOEOASA:
        return await this._EOATOEOASA();
      // case SEND_SCENES.SATOEOA:
      //   break;
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
    const contract = SAPBridge.connect(
      CCIPBridgeAddress,
      this.signer as JsonRpcSigner
    );
    const res = await contract.send(
      BigInt("12532609583862916517"),
      saDest,
      token,
      amount,
      _skCipher,
      {
        gasLimit: 5000000,
      }
    );
    return await res.wait();
  }
}
