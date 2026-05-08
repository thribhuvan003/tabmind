import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Privacy from "./components/Privacy";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Privacy />
      <Footer />
    </main>
  );
}
