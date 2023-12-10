import { BRIDGE_PRTOTOCOL, MindSAP } from "../src";
import { SendPayload } from "../src/types";
import {
  ALICE_WALLET_PRIVATEKEY,
  BOB_WALLET_ADDRESS,
  BOB_WALLET_PRIVATEKEY,
  CHARLIE_WALLET_ADDRESS,
  getSigner,
  MUMBAI_INFUA,
  SEPOLIA_INFUA,
  TOKEN_ADDRESS_SEPOLIA,
  TOKEN_ADDRESS_MUMBAI,
  POLYGONSCAN_MUMBAI,
  CCIP_explorer,
  BOB_SA_Address,
  BOB_SA_CipherText

} from "./config_test";
import logger from "./logger";

const mindSAP = new MindSAP();

test("EOA_TO_EOASA_CCIPBridge", async function () {
  const payload: SendPayload = {
    amount: 0.01,
    token: {
      address: TOKEN_ADDRESS_SEPOLIA,
      decimal: 18,
    },
    receive: {
      receipt: BOB_WALLET_ADDRESS,
    },
    bridge: {
      chain: 80001,
      protocol: BRIDGE_PRTOTOCOL.CCIP,
    },
  };
  const signer = getSigner(ALICE_WALLET_PRIVATEKEY, SEPOLIA_INFUA);
  const response = await mindSAP.send(signer, payload);
  logger.info(`EOA_TO_EOASA_CCIPBridge >>>`, JSON.stringify(response, undefined, 4));
  if (response.code == 0) {
    console.log(" please check "+response['result']['transactionHash']+' in '+CCIP_explorer)
  }
});

test("SA_TO_EOA_MUMBAI", async function () {
  const payload: SendPayload = {
    amount: 0.001,
    from: BOB_SA_Address,
    cipherText: BOB_SA_CipherText,
    token: {
      address: TOKEN_ADDRESS_MUMBAI,
      decimal: 18,
    },
    receive: {
      receipt: CHARLIE_WALLET_ADDRESS,
      createSA: false,
    },
  };
  if (!payload.from || !payload.cipherText) return;
  const signer = getSigner(BOB_WALLET_PRIVATEKEY, MUMBAI_INFUA);
  const response = await mindSAP.send(signer, payload);
  logger.info(`EOA_TO_EOASA_CCIPBridge >>>`, JSON.stringify(response, undefined, 4));
  if (response.code == 0) {
    console.info("check on: "+POLYGONSCAN_MUMBAI+response.result)
  }
});
