import { KeypairECCPayload } from "../types";
import { KEYPAIR_TYPE } from "../utils/constants";
import IKeypair from "./IKeypair";
import KeypairECC from "./KeypairECC";

export default class KeypairFactory {
  //   static getSeedBySignature: Record<KEYPAIR_TYPE, Function> = {
  //     [KEYPAIR_TYPE.ECC]: KeypairECC.getSeedBySignature,
  //   };

  static create(type?: KEYPAIR_TYPE, payload?: KeypairECCPayload): IKeypair {
    switch (type) {
      case KEYPAIR_TYPE.ECC:
        return new KeypairECC(payload);
      default:
        return new KeypairECC(payload);
    }
  }
}
