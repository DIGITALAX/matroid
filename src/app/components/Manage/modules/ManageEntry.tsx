"use client";

import { FunctionComponent, JSX } from "react";
import Caja from "../../Create/modules/Caja";
import { usePathname } from "next/navigation";

const ManageEntry: FunctionComponent<{ dict: any }> = ({
  dict,
}): JSX.Element => {
  const path = usePathname();
  return (
    <Caja title={`*${dict?.manage}*`}>
      <div
        dir={path.includes("/ar") ? "rtl" : "ltr"}
        className="relative w-full overflow-y-scroll h-[20rem] text-center items-center flex justify-center p-6 font-earl"
      >
        {dict?.comingSoon}
      </div>
    </Caja>
  );
};

export default ManageEntry;
