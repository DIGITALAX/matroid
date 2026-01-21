"use client";

import { FunctionComponent, JSX } from "react";
import ActionButton from "./ActionButton";
import { useRouter } from "next/navigation";

const Entry: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  const router = useRouter();
  return (
    <div className="relative w-full flex-1 flex items-center justify-center">
      <div className="relative items-center justify-center px-3 flex w-fit h-fit flex-wrap flex-row gap-3">
        <ActionButton
          label={dict?.create}
          onClick={() => router.push("/create")}
        />
        <ActionButton
          label={dict?.manage}
          onClick={() => router.push("/manage")}
        />
        <ActionButton
          label={dict?.staking}
          onClick={() => window.open("https://staking.digitalax.xyz")}
        />
        <ActionButton label={dict?.info} onClick={() => router.push("/info")} />
      </div>
    </div>
  );
};

export default Entry;
