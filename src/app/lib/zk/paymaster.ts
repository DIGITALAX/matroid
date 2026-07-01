import { getGeneralPaymasterInput } from "viem/zksync";

const PAYMASTER = process.env.NEXT_PUBLIC_PAYMASTER as
  | `0x${string}`
  | undefined;

export const paymasterReady = (): boolean =>
  Boolean(PAYMASTER && /^0x[0-9a-fA-F]{40}$/.test(PAYMASTER));

export const paymasterFields = ():
  | { paymaster: `0x${string}`; paymasterInput: `0x${string}` }
  | Record<string, never> => {
  if (!paymasterReady()) return {};
  return {
    paymaster: PAYMASTER as `0x${string}`,
    paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
  };
};
