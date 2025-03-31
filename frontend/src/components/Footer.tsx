// import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { motion } from "framer-motion";


export function Footer() {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-[#f7f7f8] text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <h3 className="text-xl font-bold mb-4">Fortis & Associates</h3>
            <p className="text-gray-700">
              Innovative legal solutions powered by artificial intelligence
            </p>
          </motion.div>

          {/* important links */}
          <motion.div 
          initial={{
          opacity: 0,
          y: 20 }}
          whileInView={{
          opacity: 1,
          y: 0 }}
          transition={{
          duration: 0.5,
          delay: 0.2}}>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-700 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-700 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* social media links */}
          <motion.div
           initial={{
          opacity: 0,
          y: 20  }}
          whileInView={{
          opacity: 1,
          y: 0 }}
          transition={{
          duration: 0.5,
          delay: 0.4  }}>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-700 hover:text-gray-900">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                <Instagram size={24} />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 pt-4  text-center">
          <p className="text-gray-700">
            © {currentYear} Fortis & Associates. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
}