import { Metadata } from "next";
import { LOCALES } from "@/app/lib/constants";
import { tParams } from "../layout";
import { getDictionary } from "../dictionaries";
import ManageEntry from "@/app/components/Manage/modules/ManageEntry";

export async function generateMetadata({
  params,
}: {
  params: tParams;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `https://matroid.digitalax.xyz/${lang}/manage/`;

  return {
    title: {
      default: "Matroid | Manage | DIGITALAX",
      template: "%s | DIGITALAX",
    },
    description: "To pass the walkaway test. And into another forest we go.",
    alternates: {
      canonical,
      languages: LOCALES.reduce(
        (acc, item) => {
          acc[item] = `https://matroid.digitalax.xyz/${item}/manage/`;
          return acc;
        },
        {} as { [key: string]: string },
      ),
    },
    openGraph: {
      title: "Matroid | Manage",
      description: "To pass the walkaway test. And into another forest we go.",
      url: canonical,
      siteName: "Matroid | Manage",
      images: [
        {
          url: "https://matroid.digitalax.xyz/opengraph-image.png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Matroid | Info",
      description: "To pass the walkaway test. And into another forest we go.",
      site: "@digitalax_",
      creator: "@digitalax_",
      images: ["https://matroid.digitalax.xyz/opengraph-image.png"],
    },
  };
}

export default async function Manage({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <ManageEntry dict={dict} />;
}
