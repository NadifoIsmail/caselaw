import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false);
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState(false);
  const [isMobileSignupOpen, setIsMobileSignupOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return <header className={`w-full fixed top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-sm shadow-sm" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-gray-800">
              case flow
            </Link>
          </motion.div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-gray-900">
              Services
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => {
              setIsLoginDropdownOpen(!isLoginDropdownOpen);
              setIsSignupDropdownOpen(false);
            }} className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center">
                Login
                {isLoginDropdownOpen ? <ChevronUp size={20} className="ml-1" /> : <ChevronDown size={20} className="ml-1" />}
              </button>
              <AnimatePresence>
                {isLoginDropdownOpen && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link to="/login?type=client" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsLoginDropdownOpen(false)}>
                      Client
                    </Link>
                    <Link to="/login?type=lawyer" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsLoginDropdownOpen(false)}>
                      Attorney
                    </Link>
                  </motion.div>}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button onClick={() => {
              setIsSignupDropdownOpen(!isSignupDropdownOpen);
              setIsLoginDropdownOpen(false);
            }} className="px-4 py-2 bg-[#0066ff] text-white rounded-md hover:bg-[#0052cc] flex items-center">
                Sign Up
                {isSignupDropdownOpen ? <ChevronUp size={20} className="ml-1" /> : <ChevronDown size={20} className="ml-1" />}
              </button>
              <AnimatePresence>
                {isSignupDropdownOpen && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link to="/signup?type=client" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsSignupDropdownOpen(false)}>
                      Client
                    </Link>
                    <Link to="/signup?type=lawyer" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsSignupDropdownOpen(false)}>
                      Attorney
                    </Link>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-gray-900">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: "auto"
        }} exit={{
          opacity: 0,
          height: 0
        }} className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                  Home
                </Link>
                <Link to="/services" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                  Services
                </Link>
                <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                  Contact
                </Link>
                <div className="relative">
                  <button onClick={() => setIsMobileLoginOpen(!isMobileLoginOpen)} className="w-full flex justify-between items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    <span>Login</span>
                    {isMobileLoginOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {isMobileLoginOpen && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: "auto"
                }} exit={{
                  opacity: 0,
                  height: 0
                }} className="pl-6">
                        <Link to="/login?type=client" className="block px-3 py-2 text-gray-700 hover:text-gray-900" onClick={() => {
                    setIsMobileLoginOpen(false);
                    setIsOpen(false);
                  }}>
                          Login as Client
                        </Link>
                        <Link to="/login?type=attorney" className="block px-3 py-2 text-gray-700 hover:text-gray-900" onClick={() => {
                    setIsMobileLoginOpen(false);
                    setIsOpen(false);
                  }}>
                          Login as Attorney
                        </Link>
                      </motion.div>}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <button onClick={() => setIsMobileSignupOpen(!isMobileSignupOpen)} className="w-full flex justify-between items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    <span>Sign Up</span>
                    {isMobileSignupOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {isMobileSignupOpen && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: "auto"
                }} exit={{
                  opacity: 0,
                  height: 0
                }} className="pl-6">
                        <Link to="/signup?type=client" className="block px-3 py-2 text-gray-700 hover:text-gray-900" onClick={() => {
                    setIsMobileSignupOpen(false);
                    setIsOpen(false);
                  }}>
                          Sign up as Client
                        </Link>
                        <Link to="/signup?type=attorney" className="block px-3 py-2 text-gray-700 hover:text-gray-900" onClick={() => {
                    setIsMobileSignupOpen(false);
                    setIsOpen(false);
                  }}>
                          Sign up as Attorney
                        </Link>
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </header>;
}