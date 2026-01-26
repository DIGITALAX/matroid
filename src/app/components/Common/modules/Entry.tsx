"use client";

import { FunctionComponent, JSX } from "react";
import ActionButton from "./ActionButton";
import { useRouter, usePathname } from "next/navigation";

const Entry: FunctionComponent<{ dict: any; lang?: string }> = ({
  dict,
}): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.match(/^\/([a-z]{2})(\/|$)/)?.[1] ?? "en";
  return (
    <div className="relative w-full flex-1 flex items-center justify-center">
      <div className="relative items-center justify-center px-3 flex w-fit h-fit flex-wrap flex-row gap-3 max-w-sm">
        <ActionButton
          label={dict?.raceCondition}
          onClick={() => router.push(`/${lang}/race-condition`)}
        />
        <ActionButton
          label={dict?.create}
          onClick={() => router.push(`/${lang}/create`)}
        />
        <ActionButton
          label={dict?.manage}
          onClick={() => router.push(`/${lang}/manage`)}
        />
        <ActionButton
          label={dict?.staking}
          onClick={() => window.open(`https://staking.digitalax.xyz/${lang}`)}
        />
        <ActionButton label={dict?.info} onClick={() => router.push(`/${lang}/info`)} />
        <ActionButton
          label={dict?.walk}
          onClick={() => router.push(`/${lang}/walkaway`)}
        />
      </div>
    </div>
  );
};

export default Entry;
