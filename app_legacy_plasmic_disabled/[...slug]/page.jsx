'use client';

import { useEffect, useState } from "react";
import { PLASMIC } from "@/components/plasmic-init";
import { PlasmicComponent } from "@plasmicapp/loader-nextjs";

export default function Page({ params }) {
  const [data, setData] = useState(null);
  const slug = params?.slug?.join("/") || "home";

  useEffect(() => {
    async function load() {
      const res = await PLASMIC.maybeFetchComponentData(slug);
      setData(res);
    }
    load();
  }, [slug]);

  if (!data) return <div>Loading Plasmic...</div>;

  return <PlasmicComponent loader={PLASMIC} component={slug} />;
}
