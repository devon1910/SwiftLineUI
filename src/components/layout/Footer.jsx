import React  from "react";
import { useFeedback } from "../../services/utils/useFeedback";
export const Footer = () => {
  const {triggerFeedback } = useFeedback();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Copyright - visible on all screen sizes */}
      <div className="bg-black text-white py-3">
        <div className="container mx-auto px-4 text-center text-xs">
          <button 
            onClick={() => triggerFeedback(null)} 
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 animate-pulse transition duration-200 ease-in-out"
          >
            Give Feedback
          </button>
          <p className="mt-2">© {new Date().getFullYear()} <span className="font-bold">Swiftline</span>. All rights reserved. Designed and Built by <a href="https://www.linkedin.com/in/davidson-ekpokpobe/" target="_blank">Davidson Ekpokpobe</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// {/* Main Footer - only visible on larger screens */}
// <div className="hidden md:block container mx-auto py-8 px-4">
// <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//   <div>
//     <h3 className="text-sm font-semibold text-gray-900 mb-4">About</h3>
//     <ul className="space-y-2">
//       <li><Link to="/about" className="text-sm text-gray-600 hover:text-green-700">About Us</Link></li>
//       <li><Link to="/how-it-works" className="text-sm text-gray-600 hover:text-green-700">How It Works</Link></li>
//       <li><Link to="/blog" className="text-sm text-gray-600 hover:text-green-700">Blog</Link></li>
//     </ul>
//   </div>

//   <div>
//     <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
//     <ul className="space-y-2">
//       <li><Link to="/help" className="text-sm text-gray-600 hover:text-green-700">Help Center</Link></li>
//       <li><Link to="/contact" className="text-sm text-gray-600 hover:text-green-700">Contact Us</Link></li>
//       <li><Link to="/faq" className="text-sm text-gray-600 hover:text-green-700">FAQ</Link></li>
//     </ul>
//   </div>

//   <div>
//     <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
//     <ul className="space-y-2">
//       <li><Link to="/terms" className="text-sm text-gray-600 hover:text-green-700">Terms of Service</Link></li>
//       <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-green-700">Privacy Policy</Link></li>
//       <li><Link to="/cookies" className="text-sm text-gray-600 hover:text-green-700">Cookie Policy</Link></li>
//     </ul>
//   </div>

//   <div>
//     <h3 className="text-sm font-semibold text-gray-900 mb-4">Connect</h3>
//     <div className="flex space-x-4">
//       <a href="https://twitter.com" className="text-gray-600 hover:text-green-700">
//         <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//           <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//         </svg>
//       </a>
//       <a href="https://facebook.com" className="text-gray-600 hover:text-green-700">
//         <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//           <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
//         </svg>
//       </a>
//       <a href="https://instagram.com" className="text-gray-600 hover:text-green-700">
//         <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//           <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
//         </svg>
//       </a>
//     </div>
//   </div>
// </div>
// </div>

// {/* Mobile Footer - compact version for mobile */}
// <div className="container mx-auto py-4 px-4 md:hidden">
// <div className="flex flex-wrap justify-between gap-4">
//   <div className="w-full">
//     <Link to="/" className="flex items-center justify-center mb-4">
//       <img src="/logo.png" alt="Swiftline" className="h-8" />
//       <span className="ml-2 text-lg font-semibold text-gray-900">Swiftline</span>
//     </Link>
//   </div>

//   <div className="w-1/2">
//     <Link to="/about" className="text-xs text-gray-600 block mb-2">About Us</Link>
//     <Link to="/help" className="text-xs text-gray-600 block mb-2">Help Center</Link>
//     <Link to="/terms" className="text-xs text-gray-600 block">Terms</Link>
//   </div>

//   <div className="w-1/2 text-right">
//     <Link to="/privacy" className="text-xs text-gray-600 block mb-2">Privacy</Link>
//     <Link to="/contact" className="text-xs text-gray-600 block mb-2">Contact</Link>
//     <Link to="/faq" className="text-xs text-gray-600 block">FAQ</Link>
//   </div>
// </div>
// </div>
