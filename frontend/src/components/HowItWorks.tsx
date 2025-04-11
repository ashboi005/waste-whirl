'use client';
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="text-center py-[50px] px-[20px] bg-[#f8f8f8]">
      <h2 className="mb-[40px] text-[2rem]">How it works</h2>
      <div className="flex flex-row gap-6 max-w-6xl mx-auto px-4 md:flex-col md:items-center">
        <div className="flex-1 bg-[#28a745] text-white p-[20px] rounded-[10px] transition-transform duration-300 hover:translate-y-[-10px] hover:shadow-lg md:w-[90%] md:mb-6">
          <img src="/images/planner.png" alt="Schedule a pickup" className="w-[180px] h-[150px] mb-[20px] mx-auto" />
          <h3 className="text-[1.5rem] mb-[10px]">Schedule a pickup</h3>
        </div>
        
        <div className="flex-1 bg-[#28a745] text-white p-[20px] rounded-[10px] transition-transform duration-300 hover:translate-y-[-10px] hover:shadow-lg md:w-[90%] md:mb-6">
          <img src="/images/del.png" alt="Pickup at your address" className="w-[180px] h-[150px] mb-[20px] mx-auto" />
          <h3 className="text-[1.5rem] mb-[10px]">Pickup at your address</h3>
        </div>
        
        <div className="flex-1 bg-[#28a745] text-white p-[20px] rounded-[10px] transition-transform duration-300 hover:translate-y-[-10px] hover:shadow-lg md:w-[90%]">
          <img src="/images/credit.png" alt="Receive payment" className="w-[180px] h-[150px] mb-[20px] mx-auto" />
          <h3 className="text-[1.5rem] mb-[10px]">Receive payment</h3>
        </div>
      </div>
    </section>
  );
} 