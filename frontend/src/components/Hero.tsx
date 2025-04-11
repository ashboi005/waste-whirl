'use client';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="hero" className="relative pt-[80px] flex flex-row items-center justify-between px-[40px] min-h-[80vh]">
      <div className="w-1/2 pr-8 md:w-full md:pr-0 md:text-center">
        <h1 className="text-[40px] font-extrabold tracking-[-1.4px]">
          Sell your recyclables<br />
          online with <span className="bg-gradient-to-r from-[#0a9b1a] to-[#17718c] text-transparent bg-clip-text font-inherit font-extrabold">Waste Whirl!</span>
        </h1>
        <span className="text-[#5b5b5b] text-[1.5rem] font-bold tracking-[2px] block mt-4">
          Paper - Plastics - Metals - Appliances
        </span>
        <div className="mt-8">
          <Link href="/auth" className="text-[#036800] bg-[#C6EBC5] px-[15px] py-[10px] rounded-[10px] no-underline transition-colors duration-300 hover:bg-[#A8D8A8] cursor-pointer text-[22px] font-bold">
            Book now
          </Link>
        </div>
      </div>
      <div className="w-1/2 pl-8 md:w-full md:pl-0 md:mt-8">
        <img src="/images/download.png" alt="pickup" className="w-full max-w-xl mx-auto" />
      </div>
      
      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          #hero {
            flex-direction: column;
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </section>
  );
} 