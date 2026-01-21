"use client";

import { idiomaAIndice, Idiomas, indiceAIdioma } from "@/app/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { FunctionComponent, useState } from "react";
import {
  PiArrowFatLinesLeftFill,
  PiArrowFatLinesRightFill,
} from "react-icons/pi";

const FooterEntry: FunctionComponent<{ dict: any }> = ({ dict }) => {
  const path = usePathname();
  const router = useRouter();
  const [chosenLanguage, setChosenLanguage] = useState<number>(
    idiomaAIndice[
      (path.match(/(?<=\/)(en|es|ar|pt)(?=\/)/)?.[0] ?? "en") as Idiomas
    ],
  );
  const changeLanguage = (lang: string) => {
    const segments = path.split("/");
    segments[1] = lang;
    const newPath = segments.join("/");

    document.cookie = `NEXT_LOCALE=${lang}; path=/; SameSite=Lax`;

    router.push(newPath);
  };

  return (
    <div className="absolute bottom-0 w-full h-fit flex items-center justify-center flex-row gap-3 mt-auto">
      <div className="relative text-white font-dosis uppercase w-fit h-fit flex items-center justify-center flex-row gap-2">
        <div
          className="relative flex items-center justify-center w-fit h-fit active:scale-95 cursor-pointer"
          onClick={() => {
            const newIdioma = chosenLanguage > 0 ? chosenLanguage - 1 : 3;
            changeLanguage(indiceAIdioma[newIdioma]);
            setChosenLanguage(newIdioma);
          }}
        >
          <PiArrowFatLinesLeftFill color="white" size={20} />
        </div>
        <div className="relative w-fit h-fit flex items-center justify-center">
          {indiceAIdioma[chosenLanguage]}
        </div>
        <div
          className="relative flex items-center justify-center w-fit h-fit active:scale-95 cursor-pointer"
          onClick={() => {
            const newIdioma = chosenLanguage < 3 ? chosenLanguage + 1 : 0;
            changeLanguage(indiceAIdioma[newIdioma]);
            setChosenLanguage(newIdioma);
          }}
        >
          <PiArrowFatLinesRightFill color="white" size={20} />
        </div>
      </div>
    </div>
  );
};

export default FooterEntry;
