#!/bin/bash

echo "▶ Cleaning old Plasmic artifacts…"

rm -rf plasmic.json
rm -rf components/plasmic
rm -rf pages/plasmic-host
rm -rf .plasmic

echo "✔ Old Plasmic artifacts removed."

echo "▶ Ensuring components folder exists…"
mkdir -p components

echo "▶ Ensuring app router structure exists…"
mkdir -p app/[...slug]

echo "▶ Creating app/layout.jsx"
cat << 'EOF' > app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
EOF

echo "✔ layout.jsx created."

echo "▶ Creating app/[...slug]/page.jsx"
cat << 'EOF' > app/[...slug]/page.jsx
import { PLASMIC } from "../../components/plasmic-init";
import { PlasmicComponent } from "@plasmicapp/loader-nextjs";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const slug = params?.slug?.join("/") || "index"; // Change "index" if homepage is named differently
  const page = await PLASMIC.maybeFetchComponentData(slug);

  if (!page) {
    return notFound();
  }

  return <PlasmicComponent component={page.displayName} />;
}
EOF

echo "✔ Dynamic Plasmic loader route added."

echo "▶ Checking plasmic-init.js presence…"
if [ ! -f components/plasmic-init.js ] && [ ! -f components/plasmic-init.jsx ] && [ ! -f components/plasmic-init.ts ]; then
  echo "⚠ No plasmic-init file found. Creating an empty placeholder."
  cat << 'EOI' > components/plasmic-init.js
// Placeholder — fill with your real Plasmic loader config
export const PLASMIC = {};
EOI
else
  echo "✔ plasmic-init file found — leaving it untouched."
fi

echo " "
echo "🎉 Plasmic Loader setup completed for Dealinstinct!"
echo "➡ Next: Update components/plasmic-init.js with your Plasmic loader configuration."
echo "➡ Then run: npm run dev"
