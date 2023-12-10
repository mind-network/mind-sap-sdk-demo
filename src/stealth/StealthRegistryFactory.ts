import { StealthRegistryPayload } from "../types";
import { KEYPAIR_TYPE } from "../utils/constants";
import IStealthRegistry from "./IStealthRegistry";
import StealthRegistryECC from "./StealthRegistryECC";

export default class StealthRegistryFactory {
  static create(
    type: KEYPAIR_TYPE | undefined | null,
    payload: StealthRegistryPayload
  ): IStealthRegistry {
    const { signerOrProvider, chainConfig } = payload;
    switch (type) {
      case KEYPAIR_TYPE.ECC:
        return new StealthRegistryECC(signerOrProvider, chainConfig);
      default:
        return new StealthRegistryECC(signerOrProvider, chainConfig);
    }
  }
}
