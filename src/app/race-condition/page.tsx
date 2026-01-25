import { Metadata } from "next";
import { LOCALES } from "@/app/lib/constants";
import { tParams } from "../layout";
import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import RaceEntry from "../components/Common/modules/RaceEntry";

export async function generateMetadata({
  params,
}: {
  params: tParams;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `https://matroid.digitalax.xyz/${lang}/race-condition/`;

  return {
    title: {
      default: "Matroid | Race Condition | DIGITALAX",
      template: "%s | DIGITALAX",
    },
    description: "To pass the walkaway test. And into another forest we go.",
    alternates: {
      canonical,
      languages: LOCALES.reduce(
        (acc, item) => {
          acc[item] = `https://matroid.digitalax.xyz/${item}/race-condition/`;
          return acc;
        },
        {} as { [key: string]: string },
      ),
    },
    openGraph: {
      title: "Matroid | Race Condition",
      description: "To pass the walkaway test. And into another forest we go.",
      url: canonical,
      siteName: "Matroid",
      images: [
        {
          url: "https://matroid.digitalax.xyz/opengraph-image.png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Matroid | Race Condition",
      description: "To pass the walkaway test. And into another forest we go.",
      site: "@digitalax_",
      creator: "@digitalax_",
      images: ["https://matroid.digitalax.xyz/opengraph-image.png"],
    },
  };
}
export default async function RaceCondition() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper page={<RaceEntry dict={dict}/>} dict={dict} />;
}
