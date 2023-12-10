import { JsonRpcSigner, TransactionReceipt } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

/**
 * EOA -> EOA(SA);
 * EOA -> SA
 * SA -> EOA  withdraw
 * SA -> EOA(SA)
 * SA -> SA
 */
export interface ISend {
  send(): Promise<TransactionReceipt>;
}
