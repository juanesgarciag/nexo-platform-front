import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon } from "wagmi/chains";

export const USDC_POLYGON =
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as const;

export const wagmiConfig = getDefaultConfig({
  appName: "NexoPlatform",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [polygon],
  ssr: true,
});
