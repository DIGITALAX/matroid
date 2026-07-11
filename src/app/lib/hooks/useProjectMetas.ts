import { useEffect, useState } from "react";
import { INFURA_GATEWAY } from "@/app/lib/constants";
import { ProjectListItem, ProjectMetadata } from "@/app/lib/types/matroid";

export const resolveUri = (raw?: string | null): string | undefined => {
  const uri = (raw || "").trim();
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    const cid = uri.slice(7).replace(/^ipfs\//, "");
    return `${INFURA_GATEWAY}/ipfs/${cid}`;
  }
  if (uri.startsWith("https://")) return uri;
  if (uri.startsWith("ar://")) return `https://arweave.net/${uri.slice(5)}`;
  return undefined;
};

const validMeta = (c: ProjectMetadata | null): boolean =>
  Boolean(c && typeof c === "object" && (c.title || c.description || c.image));

export const useProjectMetas = (
  projects: ProjectListItem[],
): Record<string, ProjectMetadata> => {
  const [metas, setMetas] = useState<Record<string, ProjectMetadata>>({});
  const key = projects
    .map((p) => `${p.id}:${p.metadataUri ?? ""}:${p.metadata?.title ?? ""}`)
    .join("|");

  useEffect(() => {
    let active = true;
    const run = async () => {
      const next: Record<string, ProjectMetadata> = {};
      await Promise.all(
        projects.map(async (p) => {
          const base: ProjectMetadata = {
            title: p.metadata?.title,
            description: p.metadata?.description,
            image: p.metadata?.image,
            link: p.metadata?.link,
            languages: p.metadata?.languages,
          };
          if (!base.title) {
            const url = resolveUri(p.metadataUri);
            if (url) {
              try {
                const res = await fetch(url);
                const json = (await res.json()) as ProjectMetadata;
                if (validMeta(json)) {
                  base.title = base.title || json.title;
                  base.description = base.description || json.description;
                  base.image = base.image || json.image;
                  base.link = base.link || json.link;
                  base.languages = base.languages?.length
                    ? base.languages
                    : json.languages;
                }
              } catch (err) {
                console.log("project metadata fetch failed", err);
              }
            }
          }
          next[p.id] = base;
        }),
      );
      if (active) setMetas(next);
    };
    run();
    return () => {
      active = false;
    };
  }, [key]);

  return metas;
};
