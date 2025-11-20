'use client';

import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "j2WNNKsjX5V1nEKusoae2g",
      token: process.env.NEXT_PUBLIC_PLASMIC_API_TOKEN,
    },
  ],
  preview: true,
});
