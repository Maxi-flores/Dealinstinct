import "./globals.css";
import { PLASMIC } from "@/components/plasmic-init";
import { PlasmicRootProvider } from "@plasmicapp/loader-nextjs";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PlasmicRootProvider loader={PLASMIC}>
          {children}
        </PlasmicRootProvider>
      </body>
    </html>
  );
}
