import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import AboutUs from '../components/AboutUs';
import WhyUs from '../components/WhyUs';
import Testimonials from '../components/Testimonials';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Fab from '../components/Fab';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <AboutUs />
      <WhyUs />
      <Testimonials />
      <Blog />
      <Contact />
      <Fab />
      <Footer />
    </>
  );
}
