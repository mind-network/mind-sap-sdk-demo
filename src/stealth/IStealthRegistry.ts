import { Contract } from "@ethersproject/contracts";
import { TransactionReceipt } from "@ethersproject/providers";
import { SetStealthKeysPayload, GetStealthKeysResponse } from "../types";

export default interface IStealthRegistry {
  readonly contract: Contract;
  getStealthKeys(address: string): Promise<GetStealthKeysResponse>;
  setStealthKeys(payload: SetStealthKeysPayload): Promise<TransactionReceipt>;
  stealthGenerate(address: string): Promise<any>;
}
