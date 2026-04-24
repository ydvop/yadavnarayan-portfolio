import { Navigation } from "@/components/sections/Navigation";
import { Hero } from "@/components/sections/Hero";
import { OrangeStatement } from "@/components/sections/OrangeStatement";
import { SelectedWorks } from "@/components/sections/SelectedWorks";
import { ShortFormContent } from "@/components/sections/ShortFormContent";
import { Tools } from "@/components/sections/Tools";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { VideoModal } from "@/components/ui/VideoModal";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <OrangeStatement />
      <SelectedWorks />
      <ShortFormContent />
      <Tools />
      <Contact />
      <Footer />
      <VideoModal />
    </main>
  );
}
