import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { eip712WalletActions } from "viem/zksync";
import { paymasterFields, paymasterReady } from "./paymaster";
import { config } from "@/app/providers";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const KEY = "matroid-anon-burner-key";

const DEV_FAUCETS: Record<number, `0x${string}` | undefined> = {
  31337: process.env.NEXT_PUBLIC_DEV_FAUCET_31337 as `0x${string}` | undefined,
  260: process.env.NEXT_PUBLIC_DEV_FAUCET_260 as `0x${string}` | undefined,
};

const chainFor = () =>
  config.chains.find((c) => c.id === DEFAULT_NETWORK.chainId) ??
  config.chains[0];

const transport = () => http(DEFAULT_NETWORK.rpcUrl);

const devFaucetReady = (): boolean =>
  Boolean(DEV_FAUCETS[DEFAULT_NETWORK.chainId]);

export const anonReady = (): boolean => paymasterReady() || devFaucetReady();

const anonKey = (): `0x${string}` => {
  let k = window.localStorage.getItem(KEY) as `0x${string}` | null;
  if (!k) {
    k = generatePrivateKey();
    window.localStorage.setItem(KEY, k);
  }
  return k;
};

const ensureDevFunds = async (burner: `0x${string}`): Promise<void> => {
  const faucetKey = DEV_FAUCETS[DEFAULT_NETWORK.chainId];
  if (!faucetKey) return;
  const chain = chainFor();
  const pub = createPublicClient({ chain, transport: transport() });
  const balance = await pub.getBalance({ address: burner });
  if (balance >= parseEther("0.05")) return;
  const faucet = createWalletClient({
    account: privateKeyToAccount(faucetKey),
    chain,
    transport: transport(),
  });
  const hash = await faucet.sendTransaction({
    to: burner,
    value: parseEther("1"),
  });
  await pub.waitForTransactionReceipt({ hash });
};

export const anonWriteContract = async (params: {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args: readonly unknown[];
}): Promise<`0x${string}`> => {
  const account = privateKeyToAccount(anonKey());
  const chain = chainFor();
  if (paymasterReady()) {
    const client = createWalletClient({
      account,
      chain,
      transport: transport(),
    }).extend(eip712WalletActions());
    return client.writeContract({
      ...params,
      ...paymasterFields(),
    } as never);
  }
  await ensureDevFunds(account.address);
  const client = createWalletClient({
    account,
    chain,
    transport: transport(),
  });
  return client.writeContract(params as never);
};
