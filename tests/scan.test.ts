import { MindSAP } from "../src";
import {
  BOB_WALLET_PRIVATEKEY,
  getSigner,
  GOERLI_INRFUA,
  MUMBAI_INFUA,
} from "./config_test";
import logger from "./logger";

const mindSAP = new MindSAP();

test("scan on the chain", async () => {
  const signer = getSigner(BOB_WALLET_PRIVATEKEY, MUMBAI_INFUA);
  const chainId = await signer.getChainId();
  const response = await mindSAP.scan(signer, {});
  logger.info("scan on the chain %s >>>", chainId, JSON.stringify(response, undefined, 4));
  if (response.code == 0) {
    if (response.result.length > 0) {
      console.log("List Bob's SA")
      var c = 0
      for (let i = 0; i < response.result.length; i++) {
        let obj = response.result[i];
        console.log("Bob's SA-"+i+": "+obj['sa']+"\n"+
          "\t\t"+'ciphertext: '+obj['ciphertext']+"\n"+
          "\t\t"+'txHash: '+obj['txHash']+"\n"+
          "\t\t"+'token: '+obj['token']+"\n"+
          "\t\t"+'amount: '+obj['amount'])
        c = i
      }
      console.log("found Bob has "+c+" sa")
    } else {
      console.log("Bob's is registered, but no SA yet")
    }
  } else {
    console.error("Bob is not registered")
  }
});
