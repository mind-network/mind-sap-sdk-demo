export default interface IKeyPair {
  readonly publicKeyHex: string | null; // Public key as hex string with 0x04 prefix
  readonly privateKeyHex: string | null;

  get address(): string;
}
