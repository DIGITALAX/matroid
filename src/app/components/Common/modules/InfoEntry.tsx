"use client";

import { FunctionComponent, JSX } from "react";
import Caja from "../../Create/modules/Caja";
import { usePathname } from "next/navigation";

const InfoEntry: FunctionComponent<{ dict: any; lang: string }> = ({
  dict,
  lang,
}): JSX.Element => {
  const path = usePathname();
  return (
    <Caja title={`*${dict?.info}*`}>
      <div
        dir={path.includes("/ar") ? "rtl" : "ltr"}
        className="relative w-full overflow-y-scroll h-[20rem] text-center items-start justify-center p-6 font-earl"
        dangerouslySetInnerHTML={{
          __html: dict?.infoLogic?.replaceAll("{LANG}", lang) ?? "",
        }}
      ></div>
    </Caja>
  );
};

export default InfoEntry;
