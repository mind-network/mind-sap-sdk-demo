import { ChainConfig } from "../types";

export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; //

export const ERC20ClientAddress = "0xA19eE10Ed543745dd315e33C8934C7907e827Ca1";

export const CCIPBridgeAddress = "0x3C059e9E015e3913640A8A58859C6321e3e31189";

export const CCIPBridgeDestination: Record<number, bigint> = {
  80001: BigInt("12532609583862916517"),
};

export const chainConfigs: Record<number, ChainConfig> = {
  5: {
    chainId: 5,
    ERC20ClientAddress,
    startBlock: 10177737,
    subgraphUrl: "",
  }, //goerlie
  11155111: {
    chainId: 11155111,
    ERC20ClientAddress: "",
    startBlock: 10177737,
    subgraphUrl: "",
  }, // Sepolia
  80001: {
    chainId: 80001,
    ERC20ClientAddress: "0xA19eE10Ed543745dd315e33C8934C7907e827Ca1",
    startBlock: 43360593,
    subgraphUrl: "",
  }, // Mumbai
};

export enum KEYPAIR_TYPE {
  ECC,
}

export enum BRIDGE_PRTOTOCOL {
  CCIP,
}

export enum SEND_SCENES {
  EOATOEOASA,
  EOATOSA,
  SATOSA,
  SATOEOASA,
  SATOEOA,
}
