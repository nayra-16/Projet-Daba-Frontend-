import React from 'react';
import Hero from '../components/Hero';
import Advantages from '../components/Advantages';
import AboutSection from '../components/AboutSection';
import Expertise from '../components/Expertise';
import FeaturedProducts from '../components/FeaturedProducts';
import WhyChooseUs from '../components/WhyChooseUs';
import CTASection from '../components/CTASection';
import Testimonials from '../components/Testimonials';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <Hero />
      <Advantages />
      <AboutSection />
      <Expertise />
      <FeaturedProducts />
      <WhyChooseUs />
      <CTASection />
      <Testimonials />
    </div>
  );
};

export default Home;
