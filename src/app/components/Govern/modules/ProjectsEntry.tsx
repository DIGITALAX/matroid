"use client";

import { FunctionComponent, JSX, useState } from "react";
import { usePathname } from "next/navigation";
import { formatUnits } from "viem";
import Caja from "@/app/components/Create/modules/Caja";
import { useProjects } from "@/app/lib/hooks/useProjects";

const PROJECT_LINKS: { [k: string]: string } = {};

const short = (a?: string | null): string =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

const mona = (v?: string | null): string => {
  try {
    return v ? Number(formatUnits(BigInt(v), 18)).toFixed(2) : "0";
  } catch {
    return "0";
  }
};

const ProjectsEntry: FunctionComponent<{ dict: any }> = ({
  dict,
}): JSX.Element => {
  const path = usePathname();
  const [epoch, setEpoch] = useState<string>("0");
  const { items, loading, scorerReady } = useProjects(
    /^\d+$/.test(epoch) ? BigInt(epoch) : 0n,
  );

  return (
    <Caja title={`*${dict?.projects}*`}>
      <div
        className="relative w-full overflow-y-scroll h-[20rem] flex flex-col gap-4 p-2 font-earl text-black"
        dir={path.includes("/ar") ? "rtl" : "ltr"}
      >
        <div className="relative flex flex-row gap-2 items-center text-xs">
          <span className="opacity-70">epoch</span>
          <input
            value={epoch}
            onChange={(e) => setEpoch(e.target.value)}
            className="relative flex w-20 border-2 border-black bg-white/80 px-2 py-0.5 text-black"
          />
          <span className="opacity-70">{scorerReady ? "" : "scorer not set"}</span>
        </div>

        {loading && (
          <span className="relative flex text-xs opacity-70">loading…</span>
        )}

        {items.length ? (
          items.map(({ project, score }) => {
            const title = project.metadata?.title || short(project.id);
            const link =
              PROJECT_LINKS[(project.metadata?.title || "").toLowerCase()];
            return (
              <div
                key={project.id}
                className="relative flex flex-col gap-1 border-2 border-black bg-white/60 p-2 text-xs"
              >
                <div className="relative flex flex-row gap-2 items-center">
                  <span className="font-digiB uppercase text-sm">{title}</span>
                  <span className="opacity-60">{short(project.id)}</span>
                  {link && (
                    <span
                      className="ml-auto underline cursor-pointer hover:opacity-80"
                      onClick={() => window.open(link)}
                    >
                      open
                    </span>
                  )}
                </div>
                {project.metadata?.description && (
                  <div className="relative flex opacity-80">
                    {project.metadata.description}
                  </div>
                )}
                <div className="relative flex">
                  in {mona(project.monaIn)} MONA · users{" "}
                  {project.monaUniqueUsers ?? "0"} · tx{" "}
                  {project.monaTxCount ?? "0"}
                </div>
                <div className="relative flex">
                  score {typeof score === "bigint" ? String(score) : "—"}
                </div>
              </div>
            );
          })
        ) : (
          !loading && (
            <span className="relative flex text-xs opacity-70">
              {dict?.noProjects}
            </span>
          )
        )}
      </div>
    </Caja>
  );
};

export default ProjectsEntry;
