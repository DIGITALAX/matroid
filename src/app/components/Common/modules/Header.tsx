import { tParams } from "@/app/[lang]/layout";
import { getDictionary } from "@/app/[lang]/dictionaries";
import HeaderEntry from "./HeaderEntry";

export default async function Header({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <HeaderEntry dict={dict} />;
}
