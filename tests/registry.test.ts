import { JsonRpcSigner } from "@ethersproject/providers";
import { MindSAP } from "../src";
import {
  ALICE_WALLET_PRIVATEKEY,
  BOB_WALLET_PRIVATEKEY,
  getSigner,
  GOERLI_INRFUA,
} from "./config_test";
import logger from "./logger";

const mindSAP = new MindSAP();

test("bob_registry_on_Goerli", async () => {
  const signer = await getSigner(BOB_WALLET_PRIVATEKEY, GOERLI_INRFUA);
  const response = await mindSAP.registry(signer as unknown as JsonRpcSigner);
  logger.info("bob registry response >>>", JSON.stringify(response));
  if (response.code == 0 && response.result == true) {
    logger.info("bob is registered successfully"); 
  } else {
    logger.error("bob is not registered");  
  }
});

test("bob_isRegistry_on_Goerli", async () => {
  const signer = await getSigner(BOB_WALLET_PRIVATEKEY, GOERLI_INRFUA);
  const response = await mindSAP.isRegistry(signer as unknown as JsonRpcSigner);
  logger.info("bob isRegistry response >>>", JSON.stringify(response));
  if (response.code == 0 && response.result == true) {
    logger.info("bob is registered");  
  } else {
    logger.error("bob is not registered"); 
  }
});
