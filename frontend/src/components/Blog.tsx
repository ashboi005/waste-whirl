'use client';
import Link from 'next/link';

export default function Blog() {
  return (
    <section id="Blog" className="py-[40px] bg-white">
      <h2 className="mb-[40px] text-[2rem] text-center text-[#333]">Our Blog</h2>
      <div className="flex flex-row gap-6 max-w-6xl mx-auto px-4 md:flex-col md:items-center">
        <div className="flex-1 bg-[#f9f9f9] rounded-[10px] overflow-hidden shadow-md transition-transform duration-300 hover:translate-y-[-10px] hover:shadow-lg md:w-[90%] md:mb-6">
          <img src="/images/b1.jpg" alt="Blog Image 1" className="w-full h-[180px] object-cover" />
          <div className="p-[20px]">
            <h3 className="text-[1.25rem] mb-[15px] text-[#333]">NEED OF WASTE DISPOSAL</h3>
            <p className="text-[14px] text-[#555]">In every household, rags are indispensable for cleaning up spills, wiping down surfaces, and performing various other tasks.
            However, improper disposal of used rags can pose...</p>
            <Link href="/blog1" className="block mt-[20px] font-bold text-[#28a745] no-underline">
              Read More »
            </Link>
          </div>
        </div>
        
        <div className="flex-1 bg-[#f9f9f9] rounded-[10px] overflow-hidden shadow-md transition-transform duration-300 hover:translate-y-[-10px] hover:shadow-lg md:w-[90%] md:mb-6">
          <img src="/images/b2.jpg" alt="Blog Image 2" className="w-full h-[180px] object-cover" />
          <div className="p-[20px]">
            <h3 className="text-[1.25rem] mb-[15px] text-[#333]">METHODS OF WASTE DISPOSAL</h3>
            <p className="text-[14px] text-[#555]">In today's world, effective waste disposal is critical for maintaining a clean and sustainable environment.
            As our population grows, so does the amount of waste we produce, making it essential...</p>
            <Link href="/blog2" className="block mt-[20px] font-bold text-[#28a745] no-underline">
              Read More »
            </Link>
          </div>
        </div>
        
        <div className="flex-1 bg-[#f9f9f9] rounded-[10px] overflow-hidden shadow-md transition-transform duration-300 hover:translate-y-[-10px] hover:shadow-lg md:w-[90%]">
          <img src="/images/logo4.png" alt="Blog Image 3" className="w-full h-[180px] object-contain bg-white p-4" />
          <div className="p-[20px]">
            <h3 className="text-[1.25rem] mb-[15px] text-[#333]">WASTE WHIRL AS AN INITIATIVE</h3>
            <p className="text-[14px] text-[#555]">Empowering Communities: Connecting Ragpickers with Waste Disposal Needs
            In a world increasingly focused on sustainability, an innovative website is bridging the gap between ragpickers and individuals looking...</p>
            <Link href="/blog4" className="block mt-[20px] font-bold text-[#28a745] no-underline">
              Read More »
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 