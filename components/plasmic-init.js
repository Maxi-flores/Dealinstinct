'use client';

import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "kom9pjXFQGjyBNuxy7ERXZ",
      token: process.env.NEXT_PUBLIC_PLASMIC_API_TOKEN,
    },
  ],
  preview: true,
});
