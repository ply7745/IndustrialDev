import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-primary-500/20 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center animate-pulse-glow shadow-neon">
                <span className="text-white font-bold text-xl">!</span>
              </div>
              <span className="text-neon-blue font-bold text-xl">感叹号科技</span>
            </div>
            <p className="text-gray-400 mb-6">
              专注于数字化工厂信息系统开发，助力制造企业实现智能制造转型升级。
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">快速链接</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />首页</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />关于我们</Link></li>
              <li><Link to="/solutions" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />解决方案</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />联系我们</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">解决方案</h4>
            <ul className="space-y-3">
              <li><Link to="/solutions#mes" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />MES制造执行系统</Link></li>
              <li><Link to="/solutions#wms" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />WMS仓储管理系统</Link></li>
              <li><Link to="/solutions#qms" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />QMS质量管理系统</Link></li>
              <li><Link to="/solutions#ems" className="text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2"><ChevronRight size={16} />EMS设备管理系统</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">联系方式</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-neon-cyan mt-1 flex-shrink-0" />
                <span className="text-gray-400">0574-12345678</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-neon-cyan mt-1 flex-shrink-0" />
                <span className="text-gray-400">contact@ganthanhao.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-neon-cyan mt-1 flex-shrink-0" />
                <span className="text-gray-400">浙江省宁波市鄞州区科技园区</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-500/20 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 宁波感叹号科技有限公司 版权所有
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
