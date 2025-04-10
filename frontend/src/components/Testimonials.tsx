'use client';
export default function Testimonials() {
  return (
    <section id="Testimonials" className="py-[60px] bg-[#f8f8f8]">
      <h2 className="mb-[40px] text-[2rem] text-center font-bold">Testimonials</h2>
      <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto px-4 lg:grid-cols-2 md:grid-cols-1">
        <div className="bg-white rounded-lg p-6 shadow-md min-h-[300px] transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
          <div className="flex flex-col items-center mb-4">
            <img src="/images/1.png" alt="Avatar" className="w-[60px] h-[60px] rounded-full mb-2" />
            <p className="font-bold">John Doe</p>
          </div>
          <p className="text-center text-gray-700">I was amazed at how easy it was to sell my old newspapers and bottles. The pickup was on time and the payment was instant!</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md min-h-[300px] transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
          <div className="flex flex-col items-center mb-4">
            <img src="/images/2.png" alt="Avatar" className="w-[60px] h-[60px] rounded-full mb-2" />
            <p className="font-bold">Jane Smith</p>
          </div>
          <p className="text-center text-gray-700">Waste Whirl has made recycling a rewarding habit. I love that I can contribute to the environment while making some extra cash.</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md min-h-[300px] transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
          <div className="flex flex-col items-center mb-4">
            <img src="/images/3.png" alt="Avatar" className="w-[60px] h-[60px] rounded-full mb-2" />
            <p className="font-bold">Robert Johnson</p>
          </div>
          <p className="text-center text-gray-700">The staff was professional and polite. The whole process was seamless, and I received a fair price for my recyclables.</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md min-h-[300px] transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
          <div className="flex flex-col items-center mb-4">
            <img src="/images/4.png" alt="Avatar" className="w-[60px] h-[60px] rounded-full mb-2" />
            <p className="font-bold">Emily Chen</p>
          </div>
          <p className="text-center text-gray-700">I've tried other recycling services, but Waste Whirl offers the best rates and the most convenient pickup options by far!</p>
        </div>
      </div>
    </section>
  );
} 