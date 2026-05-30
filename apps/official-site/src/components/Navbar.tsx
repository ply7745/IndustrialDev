import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">!</span>
            </div>
            <span className="text-white font-bold text-xl">感叹号科技</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">首页</Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">关于我们</Link>
            <Link to="/solutions" className="text-gray-300 hover:text-white transition-colors">解决方案</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">联系我们</Link>
            <Link 
              to="/contact" 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
            >
              免费咨询
            </Link>
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)} 
              className="block text-gray-300 hover:text-white py-2"
            >
              首页
            </Link>
            <Link 
              to="/about" 
              onClick={() => setIsOpen(false)} 
              className="block text-gray-300 hover:text-white py-2"
            >
              关于我们
            </Link>
            <Link 
              to="/solutions" 
              onClick={() => setIsOpen(false)} 
              className="block text-gray-300 hover:text-white py-2"
            >
              解决方案
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)} 
              className="block text-gray-300 hover:text-white py-2"
            >
              联系我们
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)} 
              className="block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2.5 rounded-full font-medium text-center"
            >
              免费咨询
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
