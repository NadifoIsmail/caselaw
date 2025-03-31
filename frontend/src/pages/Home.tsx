import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Scale, Shield, Building2, Users, Brain, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  const practiceAreas = [{
    icon: <Scale size={32} />,
    title: "Corporate Law",
    description: "Expert guidance for businesses of all sizes"
  }, {
    icon: <Shield size={32} />,
    title: "Civil Rights",
    description: "Protecting your fundamental rights"
  }, {
    icon: <Building2 size={32} />,
    title: "Real Estate",
    description: "Commercial and residential property law"
  }, {
    icon: <Users size={32} />,
    title: "Family Law",
    description: "Compassionate family legal services"
  }];
  const testimonials = [{
    name: "Sarah Johnson",
    role: "Business Owner",
    content: "Fortis & Associates helped me navigate complex business regulations with ease. Their AI-powered system matched me with the perfect attorney for my case.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200"
  }, {
    name: "Marcus Thompson",
    role: "Real Estate Developer",
    content: "The team's expertise in real estate law is unmatched. They made the entire process smooth and stress-free.",
    image: "https://images.unsplash.com/photo-1578774296842-c45e472b3028?auto=format&fit=crop&q=80&w=200&h=200"
  }];
  return <div className="w-full bg-white">
    {/* hero section */}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          {/* image to cover the entire page and have a low brightness */}
          <img src="https://images.pexels.com/photos/7875949/pexels-photo-7875949.jpeg?auto=format&fit=crop&q=80&w=1260&h=750&dpr=1" alt="Law office" className="w-full h-full object-cover brightness-50" />
        </div>

        {/* display the text on top of the image.  Animate while in view */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration:0.5
        }} className="text-white">
            <h1 className="text-5xl font-bold mb-6">
              Justice Powered by Innovation
            </h1>
            <p className="text-xl mb-8 max-w-2xl">
              Experience legal excellence enhanced by artificial intelligence.
              We match you with the perfect attorney for your specific case.
            </p>
            <Link to="/signup" className="inline-flex items-center px-6 py-3 bg-[#0066ff] text-white rounded-md hover:bg-[#0052cc] transition-colors">
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>

        {/* */}
      </motion.section>

      <section className="py-20 bg-[#f7f7f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} className="flex flex-col md:flex-row items-center gap-12">
          {/* display the text and image as row on desktop devices and column on mobile devices */}
            <div className="flex-1">
              {/* icon */}
              <div className="mb-8">
                <Brain size={40} className="text-[#0066ff]" />
              </div>
              {/* text */}
              <h2 className="text-3xl font-bold mb-6">
                AI-Powered Legal Solutions
              </h2>
              <p className="text-gray-600 mb-6">
                Our innovative AI system analyzes your case details to match you
                with the most qualified attorneys in our network. Experience
                faster, more accurate legal support tailored to your specific
                needs.
              </p>
              <Link to="/services" className="inline-flex items-center text-[#0066ff] hover:underline">
                Learn how it works
                <ChevronRight size={20} />
              </Link>
            </div>
            <div className="flex-1">
              <img src="https://img.freepik.com/free-vector/justice-concept-illustration_114360-2327.jpg?ga=GA1.1.1439759661.1737426593&semt=ais_hybrid" alt="AI Technology" className="rounded-lg shadow-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* popular practice area */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Practice Areas</h2>
            <p className="text-gray-600">
              Expert legal representation across multiple disciplines
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {practiceAreas.map((area, index) => <motion.div key={area.title} initial={{
            y: 20,
            opacity: 0
          }} whileInView={{
            y: 0,
            opacity: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[#0066ff] mb-4">{area.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{area.title}</h3>
                <p className="text-gray-600">{area.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className="py-20 bg-[#f7f7f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Client Success Stories</h2>
            <p className="text-gray-600">What our clients say about us</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => <motion.div key={testimonial.name} initial={{
            y: 20,
            opacity: 0
          }} whileInView={{
            y: 0,
            opacity: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.content}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* contact us section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} className="flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Let our AI-powered system match you with the perfect attorney
                for your case. Experience the future of legal services today.
              </p>
              <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-[#0066ff] text-white rounded-md hover:bg-[#0052cc] transition-colors">
                Schedule a Consultation
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="flex-1">
              <img src="https://img.freepik.com/free-vector/legal-advisers-concept-illustration_114360-20398.jpg?w=740" alt="Legal Consultation" className="w-full max-w-md mx-auto rounded-lg shadow-lg" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>;
}