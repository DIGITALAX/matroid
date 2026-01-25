import { Metadata } from "next";
import { LOCALES } from "@/app/lib/constants";
import { tParams } from "../layout";
import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import WalkEntry from "../components/Common/modules/WalkEntry";

export async function generateMetadata({
  params,
}: {
  params: tParams;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `https://matroid.digitalax.xyz/${lang}/walkaway/`;

  return {
    title: {
      default: "Matroid | Walkaway | DIGITALAX",
      template: "%s | DIGITALAX",
    },
    description: "To pass the walkaway test. And into another forest we go.",
    alternates: {
      canonical,
      languages: LOCALES.reduce(
        (acc, item) => {
          acc[item] = `https://matroid.digitalax.xyz/${item}/walkaway/`;
          return acc;
        },
        {} as { [key: string]: string },
      ),
    },
    openGraph: {
      title: "Matroid | Walkaway",
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
      title: "Matroid | Walkaway",
      description: "To pass the walkaway test. And into another forest we go.",
      site: "@digitalax_",
      creator: "@digitalax_",
      images: ["https://matroid.digitalax.xyz/opengraph-image.png"],
    },
  };
}
export default async function Walkaway() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper page={<WalkEntry dict={dict} />} dict={dict} />;
}
