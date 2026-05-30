import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send,
  Clock
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('感谢您的留言！我们会尽快与您联系。');
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: '联系电话',
      content: '0574-12345678'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: '电子邮箱',
      content: 'contact@ganthanhao.com'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: '公司地址',
      content: '浙江省宁波市鄞州区科技园区'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '工作时间',
      content: '周一至周五 9:00-18:00'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,212,255,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neon-blue mb-6">联系我们</h1>
            <p className="text-lg text-gray-300">
              无论您有任何问题或需求，欢迎随时与我们联系，我们将竭诚为您服务
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-neon-blue mb-8">联系方式</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-glass border border-primary-500/30 rounded-xl p-6 hover:border-neon-cyan transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-dark-700/50 rounded-lg border border-primary-500/30 text-neon-cyan">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{info.title}</h3>
                        <p className="text-gray-400">{info.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-glass border border-neon-blue/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">快速服务</h3>
                <p className="text-gray-400 text-sm mb-4">
                  我们提供7×24小时技术支持服务，确保您的系统稳定运行
                </p>
                <div className="text-neon-cyan font-semibold text-lg">
                  0574-12345678
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-glass border border-primary-500/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-neon-blue mb-6">在线留言</h2>
                <p className="text-gray-400 mb-8">
                  请填写以下表单，我们会在1-2个工作日内与您联系
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">姓名 *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-dark-700/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                        placeholder="请输入您的姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">公司名称</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark-700/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                        placeholder="请输入公司名称"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">联系电话 *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-dark-700/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                        placeholder="请输入联系电话"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">电子邮箱 *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-dark-700/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                        placeholder="请输入电子邮箱"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">留言内容 *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-dark-700/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                      placeholder="请描述您的需求或问题..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-neon transition-all flex items-center justify-center gap-2 border border-primary-400"
                  >
                    提交留言 <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neon-blue mb-4">公司位置</h2>
            <p className="text-gray-400">欢迎您来公司考察参观</p>
          </div>
          <div className="bg-glass border border-primary-500/30 rounded-2xl overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
              <p className="text-gray-300 text-lg">浙江省宁波市鄞州区科技园区</p>
              <p className="text-gray-500 text-sm mt-2">（实际项目中可嵌入真实地图）</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
