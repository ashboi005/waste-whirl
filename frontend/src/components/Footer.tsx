'use client';
export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          {/* Company Information */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Waste Whirl</h3>
            <p className="mb-4 text-gray-300">Turning waste into wealth, one pickup at a time.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#AboutUs" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#Services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#HowItWorks" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#Contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Scrap Collection</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Paper Recycling</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Metal Recycling</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">E-Waste Management</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Plastic Recycling</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="w-full md:w-1/4">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="mb-2 text-gray-300">
              <i className="fas fa-map-marker-alt mr-2"></i> 123 Green Street, Eco City
            </p>
            <p className="mb-2 text-gray-300">
              <i className="fas fa-phone-alt mr-2"></i> +91 123 456 7890
            </p>
            <p className="mb-2 text-gray-300">
              <i className="fas fa-envelope mr-2"></i> info@wastewhirl.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">© {new Date().getFullYear()} Waste Whirl. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 