import { tParams } from "@/app/[lang]/layout";
import { getDictionary } from "@/app/[lang]/dictionaries";
import TxPopupEntry from "./TxPopupEntry";

export default async function TxPopup({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <TxPopupEntry dict={dict} />;
}
