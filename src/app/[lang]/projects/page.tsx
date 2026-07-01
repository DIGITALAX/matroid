import { Metadata } from "next";
import { LOCALES } from "@/app/lib/constants";
import { tParams } from "../layout";
import { getDictionary } from "../dictionaries";
import ProjectsEntry from "@/app/components/Govern/modules/ProjectsEntry";

export async function generateMetadata({
  params,
}: {
  params: tParams;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `https://matroid.digitalax.xyz/${lang}/projects/`;

  return {
    title: {
      default: "Matroid | Projects | DIGITALAX",
      template: "%s | DIGITALAX",
    },
    description: "Projects plugged into matroid.",
    alternates: {
      canonical,
      languages: LOCALES.reduce(
        (acc, item) => {
          acc[item] = `https://matroid.digitalax.xyz/${item}/projects/`;
          return acc;
        },
        {} as { [key: string]: string },
      ),
    },
  };
}

export default async function Projects({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <ProjectsEntry dict={dict} />;
}
