import Link from 'next/link';
import { MdFacebook, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#2A2A2A] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">EShop</h3>
            <p className="text-sm text-gray-400 mb-4">
              თქვენი სანდო ონლაინ მაღაზია საუკეთესო პროდუქტებით და შეუდარებელი მომსახურებით.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#FF6B3D] transition-colors" aria-label="Facebook">
                <MdFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF6B3D] transition-colors" aria-label="Instagram">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF6B3D] transition-colors" aria-label="Twitter">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF6B3D] transition-colors" aria-label="LinkedIn">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">სწრაფი ლინკები</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  ჩვენ შესახებ
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  პროდუქტები
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  კატეგორიები
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  კონტაქტი
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">მომხმარებელთა სერვისი</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  ხშირად დასმული კითხვები
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  მიწოდება
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  დაბრუნება
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#FF6B3D] transition-colors">
                  კონფიდენციალურობა
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">კონტაქტი</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MdLocationOn className="text-[#FF6B3D] text-xl flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">თბილისი, საქართველო</span>
              </li>
              <li className="flex items-center space-x-3">
                <MdPhone className="text-[#FF6B3D] text-xl flex-shrink-0" />
                <span className="text-sm text-gray-400">+995 555 123 456</span>
              </li>
              <li className="flex items-center space-x-3">
                <MdEmail className="text-[#FF6B3D] text-xl flex-shrink-0" />
                <span className="text-sm text-gray-400">info@eshop.ge</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EShop. ყველა უფლება დაცულია.
          </p>
        </div>
      </div>
    </footer>
  );
}
