export interface TxModal {
  open: boolean;
  status: "proving" | "wallet" | "pending" | "success" | "error";
  label?: string;
  hash?: `0x${string}`;
  message?: string;
}
