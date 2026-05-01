"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { USDC_POLYGON } from "@/lib/wagmi";

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

export default function WalletConnect() {
  const { address, isConnected } = useAccount();

  const { data: matic } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const { data: usdcRaw } = useReadContract({
    address: USDC_POLYGON,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const usdc =
    usdcRaw !== undefined
      ? Number(formatUnits(usdcRaw as bigint, 6))
      : null;

  return (
    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
      {isConnected && (
        <div className="hidden md:flex text-xs text-neutral-400 gap-3 tabular-nums">
          <span>
            USDC:{" "}
            <span className="text-neutral-100 font-medium">
              {usdc !== null ? usdc.toFixed(2) : "—"}
            </span>
          </span>
          <span>
            MATIC:{" "}
            <span className="text-neutral-100 font-medium">
              {matic ? Number(matic.formatted).toFixed(4) : "—"}
            </span>
          </span>
        </div>
      )}
      <ConnectButton showBalance={false} chainStatus="icon" />
    </div>
  );
}
