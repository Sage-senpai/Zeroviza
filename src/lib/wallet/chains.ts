/**
 * Chain definitions — server and client safe.
 * Import from here instead of config.ts in server-side code
 * to avoid pulling in RainbowKit's client-only getDefaultConfig.
 */

import { defineChain } from "viem";

export const ogGalileoTestnet = defineChain({
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Scan",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});
