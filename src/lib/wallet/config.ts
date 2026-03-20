import { http } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  subWallet,
  trustWallet,
  coinbaseWallet,
  braveWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

// Re-export from chains.ts so other files can import ogGalileoTestnet from here
export { ogGalileoTestnet } from "./chains";
import { ogGalileoTestnet } from "./chains";

// ─── Wagmi + RainbowKit config ────────────────────────────────────────────────
const walletConnectProjectId = (
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ""
).trim();
const hasWalletConnectProjectId = walletConnectProjectId.length > 0;

const walletGroups = [
  {
    groupName: "Popular",
    wallets: [
      metaMaskWallet,
      okxWallet,
      phantomWallet,
      trustWallet,
      coinbaseWallet,
      braveWallet,
    ],
  },
  {
    groupName: "More",
    wallets: [
      rabbyWallet,
      subWallet,
      ...(hasWalletConnectProjectId ? [walletConnectWallet] : []),
      injectedWallet,
    ],
  },
];

export const wagmiConfig = getDefaultConfig({
  appName: "ZeroViza",
  projectId: hasWalletConnectProjectId
    ? walletConnectProjectId
    : "00000000000000000000000000000000",
  chains: [ogGalileoTestnet],
  wallets: walletGroups,
  transports: {
    [ogGalileoTestnet.id]: http("https://evmrpc-testnet.0g.ai"),
  },
  ssr: false,
  multiInjectedProviderDiscovery: true,
});
