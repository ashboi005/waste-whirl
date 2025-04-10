'use client';
import { useState } from 'react';

export default function Fab() {
  const [active, setActive] = useState(false);
  
  const toggleFabMenu = () => setActive(!active);

  return (
    <div className={`fab-container fixed bottom-[20px] right-[20px] flex flex-col items-center ${active ? 'active' : ''}`}>
      <div className={`fab-icons ${active ? 'flex' : 'hidden'} flex-col items-center mb-[10px]`}>
        <a 
          href="https://wa.me/9814536074" 
          target="_blank" 
          rel="noreferrer" 
          className="w-[48px] h-[48px] rounded-full bg-[#4CAF50] text-white flex justify-center items-center mb-[10px] shadow-md transition-transform duration-300 cursor-pointer no-underline hover:bg-[#45a049]"
        >
          <i className="fa fa-whatsapp text-[24px]"></i>
        </a>
        <a 
          href="https://www.instagram.com/itsash_0805" 
          target="_blank" 
          rel="noreferrer" 
          className="w-[48px] h-[48px] rounded-full bg-[#4CAF50] text-white flex justify-center items-center mb-[10px] shadow-md transition-transform duration-300 cursor-pointer no-underline hover:bg-[#45a049]"
        >
          <i className="fa fa-instagram text-[24px]"></i>
        </a>
        <a 
          href="https://www.linkedin.com/in/yourlinkedinprofile" 
          target="_blank" 
          rel="noreferrer" 
          className="w-[48px] h-[48px] rounded-full bg-[#4CAF50] text-white flex justify-center items-center mb-[10px] shadow-md transition-transform duration-300 cursor-pointer no-underline hover:bg-[#45a049]"
        >
          <i className="fa fa-linkedin text-[24px]"></i>
        </a>
      </div>
      <div 
        className={`fab-button w-[56px] h-[56px] rounded-full bg-[#4CAF50] text-white flex justify-center items-center shadow-md cursor-pointer transition-transform duration-300 text-[40px] hover:bg-[#45a049] ${active ? 'transform rotate-45' : ''}`} 
        onClick={toggleFabMenu}
      >+</div>
    </div>
  );
} 