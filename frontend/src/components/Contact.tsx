'use client';
export default function Contact() {
  return (
    <section id="contact-us" className="grid grid-cols-2 gap-8 p-[40px] bg-[#f4f4f4] md:grid-cols-1">
      <div className="flex flex-col items-center justify-center gap-[20px]">
        <div className="w-[70%]">
          <h2 className="text-[#4CAF50] text-2xl font-bold">CALL US</h2>
          <p className="text-[#4CAF50] text-[20px] my-[10px]">📞 +91-7009023965, +91-9814536074</p>
        </div>
        <div className="w-[70%]">
          <h2 className="text-[#4CAF50] text-2xl font-bold">LOCATION</h2>
          <p className="text-[#4CAF50] text-[20px] my-[10px]">📍 21 Basant Avenue, Amritsar, Punjab, 143001</p>
        </div>
        <div className="w-[70%]">
          <h2 className="text-[#4CAF50] text-2xl font-bold">BUSINESS HOURS</h2>
          <p className="text-[#4CAF50] text-[20px] my-[10px]">🕒 Mon – Fri : 10 am – 8 pm, Sat,Sun : Closed</p>
        </div>
      </div>

      <div className="contact-form">
        <h2 className="text-[#4CAF50] text-2xl font-bold mb-4">CONTACT US</h2>
        <form action="/submit_contact_form" method="post">
          <label htmlFor="name" className="block mb-2">Enter your Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className="w-full p-[10px] mb-[15px] border border-[#ccc] rounded-[4px]" 
            required 
          />
          
          <label htmlFor="email" className="block mb-2">Enter a valid email address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="w-full p-[10px] mb-[15px] border border-[#ccc] rounded-[4px]" 
            required 
          />
          
          <label htmlFor="message" className="block mb-2">Message</label>
          <textarea 
            id="message" 
            name="message" 
            rows={4} 
            className="w-full p-[10px] mb-[15px] border border-[#ccc] rounded-[4px]" 
            required
          ></textarea>
          
          <button 
            type="submit" 
            className="bg-[#4CAF50] text-white px-[20px] py-[10px] border-none rounded-[4px] cursor-pointer hover:bg-[#45a049]"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
} 