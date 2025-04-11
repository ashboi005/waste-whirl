'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="fixed top-0 w-full h-[60px] py-5 px-5 bg-[#f8f9fa] flex items-center justify-between shadow-md transition-colors duration-300 z-[1000]">
      <img src="/images/logo4.png" alt="Waste Whirl" className="w-[150px] h-auto ml-10 transition-transform duration-300 hover:scale-110 hover:cursor-pointer" />
      <ul className="list-none flex gap-[15px]">
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <Link href="/" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Home</Link>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <Link href="/scraprates" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Scrap Rates</Link>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <a href="#Whyus" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Why us?</a>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <Link href="/about" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">About Us</Link>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <a href="#contact-us" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Contact Us</a>
        </li>
      </ul>
      <Link href="/auth" className="text-[#036800] bg-[#C6EBC5] px-[15px] py-[10px] rounded-[10px] mr-10 no-underline font-bold transition-all duration-300 cursor-pointer hover:bg-[#A8D8A8] hover:scale-110">Sign Up/Login</Link>
      
      {/* Mobile menu - only visible on small screens */}
      <div className="hidden sm:hidden cursor-pointer text-2xl mr-5 hamburger-menu" onClick={toggleMenu}>
        <i className="fa fa-bars"></i>
      </div>
      
      {/* Mobile navigation */}
      <ul className={`list-none fixed top-0 right-0 h-screen w-[250px] bg-[#f8f9fa] transition-all duration-300 ease-in-out text-center pt-[60px] flex-col z-[1001] ${menuOpen ? 'right-0' : 'right-[-100%]'} sm:hidden`}>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110 block close-btn">
          <i className="fa fa-times" onClick={toggleMenu}></i>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <Link href="/" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Home</Link>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <Link href="/scraprates" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Scrap Rates</Link>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <a href="#Whyus" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Why us?</a>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <Link href="/about" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">About Us</Link>
        </li>
        <li className="p-[15px] cursor-pointer transition-transform duration-300 hover:text-[#036800] hover:scale-110">
          <a href="#contact-us" className="no-underline text-black transition-transform duration-300 hover:text-[#036800]">Contact Us</a>
        </li>
      </ul>
    </nav>
  );
} 