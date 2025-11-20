import CatchAllPage from "./[...slug]/page";

export default function RootPage() {
  return <CatchAllPage params={{ slug: ["home"] }} />;
}
