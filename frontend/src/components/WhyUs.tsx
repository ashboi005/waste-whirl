'use client';
export default function WhyUs() {
  return (
    <section id="Whyus" className="flex flex-col items-center py-[40px] bg-[#28a745]">
      <h2 className="mb-[40px] text-[2rem] text-white">Why us?</h2>
      <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto px-4 lg:grid-cols-2 md:grid-cols-1">
        <div className="flex flex-col items-center p-[20px] bg-[#f9f9f9] rounded-[10px] text-center transition-all duration-300 hover:translate-y-[-10px] hover:bg-[#e0f7fa]">
          <div className="text-[40px] mb-[15px]">💰</div>
          <div className="text-[18px] font-bold mb-[10px]">Best Rates</div>
          <div className="text-[14px] text-[#555]">We provide the best value for your scrap from our network of Recyclers.</div>
        </div>
        
        <div className="flex flex-col items-center p-[20px] bg-[#f9f9f9] rounded-[10px] text-center transition-all duration-300 hover:translate-y-[-10px] hover:bg-[#e0f7fa]">
          <div className="text-[40px] mb-[15px]">👍</div>
          <div className="text-[18px] font-bold mb-[10px]">Convenience</div>
          <div className="text-[14px] text-[#555]">Doorstep pickup according to user's convenient date & time.</div>
        </div>
        
        <div className="flex flex-col items-center p-[20px] bg-[#f9f9f9] rounded-[10px] text-center transition-all duration-300 hover:translate-y-[-10px] hover:bg-[#e0f7fa]">
          <div className="text-[40px] mb-[15px]">🔒</div>
          <div className="text-[18px] font-bold mb-[10px]">Trust</div>
          <div className="text-[14px] text-[#555]">Trained & Verified Pickup Staff with Swapeco Smart Weighing Scale.</div>
        </div>
        
        <div className="flex flex-col items-center p-[20px] bg-[#f9f9f9] rounded-[10px] text-center transition-all duration-300 hover:translate-y-[-10px] hover:bg-[#e0f7fa]">
          <div className="text-[40px] mb-[15px]">🌳</div>
          <div className="text-[18px] font-bold mb-[10px]">Eco-friendly</div>
          <div className="text-[14px] text-[#555]">We ensure responsible recycling of your scrap items.</div>
        </div>
      </div>
    </section>
  );
} 