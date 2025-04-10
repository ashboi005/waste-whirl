'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav>
      <img src="/static/images/logo4.png" alt="Waste Whirl" className="logo" />
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li className="close-btn"><i className="fa fa-times" onClick={toggleMenu}></i></li>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/scraprates">Scrap Rates</Link></li>
        <li><a href="#Whyus">Why us?</a></li>
        <li><Link href="/about">About Us</Link></li>
        <li><a href="#contact-us">Contact Us</a></li>
      </ul>
      <Link href="/auth" id="login-btn">Sign Up/Login</Link>
      <div className="hamburger-menu" onClick={toggleMenu}>
        <i className="fa fa-bars"></i>
      </div>
    </nav>
  );
} 