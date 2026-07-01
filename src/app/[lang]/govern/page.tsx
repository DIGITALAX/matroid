import { Metadata } from "next";
import { LOCALES } from "@/app/lib/constants";
import { tParams } from "../layout";
import { getDictionary } from "../dictionaries";
import GovernEntry from "@/app/components/Govern/modules/GovernEntry";

export async function generateMetadata({
  params,
}: {
  params: tParams;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `https://matroid.digitalax.xyz/${lang}/govern/`;

  return {
    title: {
      default: "Matroid | Govern | DIGITALAX",
      template: "%s | DIGITALAX",
    },
    description: "Protocol budget governance.",
    alternates: {
      canonical,
      languages: LOCALES.reduce(
        (acc, item) => {
          acc[item] = `https://matroid.digitalax.xyz/${item}/govern/`;
          return acc;
        },
        {} as { [key: string]: string },
      ),
    },
  };
}

export default async function Govern({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <GovernEntry dict={dict} />;
}
