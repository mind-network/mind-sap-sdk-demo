import { JsonRpcSigner } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { SendPayload } from "../types";
import { SEND_SCENES } from "../utils/constants";
import { isValidSA } from "../utils/utilSap";
import SAERC20Client from "../contracts/SAERC20Clients";
import ERC20 from "../contracts/ERC20";
import { MaxUint256 } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { parseChainConfig } from "../utils";

export default class BaseSend {
  readonly signer: JsonRpcSigner | Wallet;
  readonly payload: SendPayload;

  saERC20Client!: SAERC20Client;

  constructor(signer: JsonRpcSigner | Wallet, payload: SendPayload) {
    this.signer = signer;
    this.payload = payload;
  }

  get scenes(): SEND_SCENES {
    const {
      from,
      cipherText,
      receive: { createSA, receipt },
    } = this.payload;
    if (!from) {
      if (isValidSA(receipt)) return SEND_SCENES.EOATOSA;
      if (createSA) return SEND_SCENES.EOATOEOASA;
      throw new Error("This scense not supported");
    }

    if (!isValidSA(from)) throw new Error("From must be SA address");
    if (!cipherText)
      throw new Error("CipherText is not empty when from is SA address");
    if (isValidSA(receipt)) return SEND_SCENES.SATOSA;
    if (createSA) return SEND_SCENES.SATOEOASA;
    return SEND_SCENES.SATOEOA;
  }

  async getERC20Client(): Promise<SAERC20Client> {
    if (!this.saERC20Client) {
      const chainId = await this.signer.getChainId();
      this.saERC20Client = new SAERC20Client(
        this.signer as JsonRpcSigner,
        chainId
      );
    }
    return this.saERC20Client;
  }

  async approveERC20Token(approveAddress?: string) {
    const tokenContract = ERC20.connect(
      this.payload.token.address,
      this.signer
    );
    const amount = this.payload.amount as BigNumber;
    const address = await this.signer.getAddress();
    if (!approveAddress) {
      const chainId = await this.signer.getChainId();
      const chain = parseChainConfig(chainId);
      approveAddress = chain.ERC20ClientAddress;
    }

    const allowance = await tokenContract.allowance(address, approveAddress);

    if (amount.gt(allowance)) {
      const approveTx = await tokenContract.approve(approveAddress, MaxUint256);
      await approveTx.wait();
    }
  }
}
