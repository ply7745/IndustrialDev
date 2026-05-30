import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        message: ''
      });
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neon-blue mb-6">联系我们</h1>
            <p className="text-gray-300 text-lg">
              期待与您合作，共同开启数字化转型之旅
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-glass border border-primary-500/30 rounded-2xl p-8">
                <div className="p-4 bg-dark-700/50 rounded-xl w-fit mb-6">
                  <div className="text-neon-cyan"><Phone size={28} /></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">电话咨询</h3>
                <p className="text-gray-300 mb-2">0574-12345678</p>
                <p className="text-gray-400 text-sm">工作日 9:00-18:00</p>
              </div>
              
              <div className="bg-glass border border-primary-500/30 rounded-2xl p-8">
                <div className="p-4 bg-dark-700/50 rounded-xl w-fit mb-6">
                  <div className="text-neon-cyan"><Mail size={28} /></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">电子邮件</h3>
                <p className="text-gray-300 mb-2">contact@ganthanhao.com</p>
                <p className="text-gray-400 text-sm">24小时内回复</p>
              </div>
              
              <div className="bg-glass border border-primary-500/30 rounded-2xl p-8">
                <div className="p-4 bg-dark-700/50 rounded-xl w-fit mb-6">
                  <div className="text-neon-cyan"><MapPin size={28} /></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">公司地址</h3>
                <p className="text-gray-300">浙江省宁波市鄞州区科技园区创新大厦A座18层</p>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-glass border border-primary-500/30 rounded-2xl p-8 md:p-12">
                <h2 className="text-2xl font-bold text-white mb-8">在线咨询</h2>
                
                {submitSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={48} className="text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">提交成功！</h3>
                    <p className="text-gray-300">我们的客户经理将在24小时内与您联系</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">姓名 *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-dark-700/50 border border-primary-500/30 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                          placeholder="请输入您的姓名"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">公司名称 *</label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          required
                          className="w-full bg-dark-700/50 border border-primary-500/30 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                          placeholder="请输入公司名称"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">联系电话 *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full bg-dark-700/50 border border-primary-500/30 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                          placeholder="请输入联系电话"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">电子邮箱</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-dark-700/50 border border-primary-500/30 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                          placeholder="请输入电子邮箱"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">需求描述</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-dark-700/50 border border-primary-500/30 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors resize-none"
                        placeholder="请描述您的需求..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-neon transition-all border border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>提交中...</>
                      ) : (
                        <>立即提交 <Send size={20} /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-dark-700/50 rounded-2xl border border-primary-500/30 overflow-hidden">
            <div className="h-80 bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-neon-blue mx-auto mb-4" />
                <p className="text-gray-400">地图加载中...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Clock size={24} className="text-neon-cyan" />
              服务时间
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-glass border border-primary-500/30 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">工作日</h3>
              <p className="text-neon-blue text-xl font-semibold">9:00 - 18:00</p>
            </div>
            <div className="bg-glass border border-primary-500/30 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">周六</h3>
              <p className="text-gray-300">10:00 - 16:00</p>
            </div>
            <div className="bg-glass border border-primary-500/30 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">紧急支持</h3>
              <p className="text-gray-300">7×24小时</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
