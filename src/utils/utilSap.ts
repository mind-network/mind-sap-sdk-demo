import { JsonRpcSigner } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Point, Signature, utils as nobleUtils } from "@noble/secp256k1";
import { isHexString } from "@ethersproject/bytes";
import { getKeys } from "../contracts/SAPRegistry";
import KeypairECC, { RandomNumber } from "../keypair/KeypairECC";
import { isPublicKeyExist } from ".";

export function assertValidPrivateKey(key: string) {
  const isCorrectLength = key.length === 64 || key.length === 66;
  const isCorrectFormat = typeof key === "string" && isCorrectLength;
  if (!isCorrectFormat)
    throw new Error("Must provide private key as hex string");

  if (key.length === 66) key = key.slice(2);
  if (!nobleUtils.isValidPrivateKey(key))
    throw new Error("Invalid private key");
}

export function assertValidPoint(point: string) {
  const isCorrectLength = point.length === 66 || point.length === 68;
  const isCorrectFormat = typeof point === "string" && isCorrectLength;
  if (!isCorrectFormat)
    throw new Error("Must provide uncompressed public key as hex string");

  const pointInstance = Point.fromHex(
    point.length === 66 ? point : point.slice(2)
  );
  pointInstance.assertValidity();
}

export async function assertSABelongToSigner(
  signer: JsonRpcSigner | Wallet,
  SA: string | undefined
) {
  if (!SA) {
    return;
  }
  if (!isHexString(SA) || SA.length !== 42) {
    throw new Error("Invalid SA address, must be a hex string");
  }

  //TODO: check
}

export function isValidSA(receipt: string) {
  if (typeof receipt !== "string" || !receipt.match(/^0xcafe[0-9A-Fa-f]*$/)) {
    return false;
  }
  return true;
}

export async function createSA(receipt: string) {
  const keys = await getKeys(receipt);
  if (!isPublicKeyExist(keys.opPubKey)) {
    throw new Error(
      `Could not retrieve public keys for recipient ID ${receipt}`
    );
  }
  const opKeypair = new KeypairECC({ key: keys.opPubKey });
  const encKeypair = new KeypairECC({ key: keys.encPubKey });
  //generate a random sk seed
  const sk = new RandomNumber().asBuffer;
  //The highest bit of the byte is set to 0
  sk[0] &= 0x7f;
  const randomKeypair = new KeypairECC({ key: `0x${sk.toString("hex")}` });
  if (!randomKeypair.publicKeyHex || !randomKeypair.privateKeyHex) {
    throw new Error("stealthKeyPair generation failed");
  }
  const stealthKeyPair = opKeypair.addPublicKey(randomKeypair.publicKeyHex);
  const skCipher = encKeypair.encrypt(sk);
  return {
    stealthKeyPair,
    skCipher,
  };
}
