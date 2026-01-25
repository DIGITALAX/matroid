"use client";

import { FunctionComponent, JSX } from "react";
import { MdOutlineArrowOutward } from "react-icons/md";
import Caja from "./Caja";
import { usePathname } from "next/navigation";

const CreateEntry: FunctionComponent<{ dict: any; lang: string }> = ({
  dict,
  lang,
}): JSX.Element => {
  const path = usePathname();
  return (
    <Caja title={`*${dict?.create}*`}>
      <div className="relative w-full overflow-y-scroll h-[20rem] flex text-center items-center justify-start p-6 font-earl flex-col gap-6">
        <div
          className={`relative text-center w-fit h-fit flex`}
          dir={path.includes("/ar") ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{
            __html: dict?.createLogic1?.replaceAll("{LANG}", lang),
          }}
        ></div>
        <div className="relative items-center justify-center w-fit h-fit flex flex-col gap-3">
          <div className="relative text-center w-fit h-fit flex">
            {dict?.createLogic2}
          </div>
          <div
            className="relative w-fit h-fit gap-2 flex items-center justify-center text-center flex-row cursor-pointer hover:opacity-80"
            onClick={() =>
              window.open("https://matroid.digitalax.xyz/llms.txt")
            }
          >
            <div className="relative w-fit h-fit flex">LLMS.txt</div>
            <MdOutlineArrowOutward
              className="relative w-fit h-fit flex"
              color="black"
            />
          </div>
        </div>
      </div>
    </Caja>
  );
};

export default CreateEntry;
