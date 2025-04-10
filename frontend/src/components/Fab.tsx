'use client';
import { useState } from 'react';

export default function Fab() {
  const [active, setActive] = useState(false);
  return (
    <div className={`fab-container ${active ? 'active' : ''}`}>
      <div className="fab-icons">
        <a href="https://wa.me/9814536074" target="_blank"><i className="fa fa-whatsapp"></i></a>
        <a href="https://www.instagram.com/itsash_0805" target="_blank"><i className="fa fa-instagram"></i></a>
        <a href="https://www.linkedin.com/in/yourlinkedinprofile" target="_blank"><i className="fa fa-linkedin"></i></a>
      </div>
      <div className="fab-button" onClick={() => setActive(!active)}>+</div>
    </div>
  );
} 