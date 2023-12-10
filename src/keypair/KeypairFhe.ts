import IKeyPair from "./IKeypair";

export default class KeypairFhe implements IKeyPair {
  publicKeyHex: string | null;
  privateKeyHex: string | null;

  constructor() {
    this.publicKeyHex = "";
    this.privateKeyHex = "";
    throw new Error("not implemented");
  }

  get address(): string {
    throw new Error("Method not implemented.");
  }

  static getSeedBySignature(signature: string): [string, string] {
    throw new Error("not implemented");
  }
}
