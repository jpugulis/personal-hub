import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TerritoryIndex from "@/components/TerritoryIndex";
import LatestRoutes from "@/components/LatestRoutes";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <TerritoryIndex />
      <LatestRoutes />
      <Footer />
    </>
  );
}
