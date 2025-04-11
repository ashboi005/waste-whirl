'use client';
export default function AboutUs() {
  return (
    <section id="AboutUs" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Image Container */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
              alt="Waste recycling" 
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </div>
          
          {/* Content Container */}
          <div className="w-full md:w-1/2 md:pl-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">About Us</h2>
            <p className="text-lg text-gray-600 mb-6">
              At Waste Whirl, we are committed to creating a cleaner, greener future for our planet. 
              Our mission is to revolutionize waste management by making it easier for everyone to 
              recycle and properly dispose of their waste.
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Vision</h3>
              <p className="text-gray-600">
                We envision a world where waste is not just discarded but transformed into valuable 
                resources, creating a circular economy that benefits both our environment and communities.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Approach</h3>
              <p className="text-gray-600">
                We leverage technology to connect waste generators with collectors, making recycling and 
                waste management more accessible, efficient, and rewarding for everyone involved.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <span className="block text-green-500 text-3xl font-bold">500+</span>
                <span className="text-gray-600">Tons Recycled</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <span className="block text-green-500 text-3xl font-bold">10K+</span>
                <span className="text-gray-600">Happy Customers</span>
              </div>
            </div>
            
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 