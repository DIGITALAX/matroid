"use client";

import { FunctionComponent, JSX } from "react";
import { usePathname } from "next/navigation";
import { formatUnits } from "viem";
import Caja from "@/app/components/Create/modules/Caja";
import { useProjects } from "@/app/lib/hooks/useProjects";
import {
  useProjectMetas,
  resolveUri,
} from "@/app/lib/hooks/useProjectMetas";

const short = (a?: string | null): string =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

const mona = (v?: string | null): string => {
  try {
    return v ? Number(formatUnits(BigInt(v), 18)).toFixed(2) : "0";
  } catch {
    return "0";
  }
};

const timeLeft = (end: bigint | undefined, dict: any): string => {
  if (end === undefined) return "";
  const secs = Number(end) - Math.floor(Date.now() / 1000);
  if (secs <= 0) return dict?.epochEnded;
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const span =
    d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  return `${span} ${dict?.timeLeftLabel}`;
};

const ProjectsEntry: FunctionComponent<{ dict: any }> = ({
  dict,
}): JSX.Element => {
  const path = usePathname();
  const { items, loading, currentEpoch, epochEnd } = useProjects();
  const metas = useProjectMetas(items.map(({ project }) => project));

  return (
    <Caja title={`*${dict?.projects}*`}>
      <div
        className="relative w-full overflow-y-scroll h-[20rem] flex flex-col gap-4 p-2 font-earl text-black"
        dir={path.includes("/ar") ? "rtl" : "ltr"}
      >
        {currentEpoch !== undefined && (
          <div className="relative flex flex-row flex-wrap gap-2 items-center text-xs">
            <span className="relative flex border-2 border-black bg-white/80 px-2 py-0.5">
              {dict?.epochNow} {String(currentEpoch)} ·{" "}
              {timeLeft(epochEnd, dict)}
            </span>
          </div>
        )}

        {loading && (
          <span className="relative flex text-xs opacity-70">
            {dict?.loadingProjects}
          </span>
        )}

        {items.length ? (
          items.map(({ project, score }) => {
            const meta = metas[project.id] || project.metadata || {};
            const title = meta.title || short(project.id);
            const link = meta.link || undefined;
            const image = resolveUri(meta.image);
            return (
              <div
                key={project.id}
                className="relative flex flex-row gap-2 border-2 border-black bg-white/60 p-2 text-xs"
              >
                {image && (
                  <div className="relative flex w-16 h-16 border-2 border-black shrink-0 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      draggable={false}
                      className="relative flex w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="relative flex flex-col gap-1 w-full">
                  <div className="relative flex flex-row flex-wrap gap-2 items-center">
                    <span className="font-digiB uppercase text-sm">
                      {title}
                    </span>
                    <span className="opacity-60">{short(project.id)}</span>
                    {meta.languages?.length ? (
                      <span className="opacity-60 uppercase">
                        {meta.languages.join(" / ")}
                      </span>
                    ) : null}
                    {link && (
                      <span
                        className="ml-auto underline cursor-pointer hover:opacity-80"
                        onClick={() => window.open(link)}
                      >
                        {link.replace(/^https:\/\//, "")}
                      </span>
                    )}
                  </div>
                  {meta.description && (
                    <div className="relative flex opacity-80">
                      {meta.description}
                    </div>
                  )}
                  {project.metadataUri && (
                    <div className="relative flex opacity-50 break-all">
                      {project.metadataUri}
                    </div>
                  )}
                  <div className="relative flex">
                    {dict?.projIn} {mona(project.monaIn)} MONA ·{" "}
                    {dict?.projUsers} {project.monaUniqueUsers ?? "0"} ·{" "}
                    {dict?.projTx} {project.monaTxCount ?? "0"}
                  </div>
                  <div className="relative flex">
                    {dict?.projScore}{" "}
                    {typeof score === "bigint" ? String(score) : "—"}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          !loading && (
            <span className="relative flex text-xs opacity-70">
              {dict?.noProjectsFound}
            </span>
          )
        )}
      </div>
    </Caja>
  );
};

export default ProjectsEntry;
