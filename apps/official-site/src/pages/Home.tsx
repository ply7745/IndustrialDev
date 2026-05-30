import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Factory, 
  Package, 
  ShieldCheck, 
  Cog, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const Home = () => {
  const solutions = [
    {
      icon: <Factory className="w-8 h-8 text-primary-500" />,
      title: 'MES制造执行系统',
      description: '全面的生产过程管理，提升生产效率和品质控制能力。',
      link: '/solutions#mes'
    },
    {
      icon: <Package className="w-8 h-8 text-primary-500" />,
      title: 'WMS仓储管理系统',
      description: '智能化仓储管理，优化库存周转率，降低仓储成本。',
      link: '/solutions#wms'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary-500" />,
      title: 'QMS质量管理系统',
      description: '全流程质量管控，确保产品质量稳定可靠。',
      link: '/solutions#qms'
    },
    {
      icon: <Cog className="w-8 h-8 text-primary-500" />,
      title: 'EMS设备管理系统',
      description: '设备全生命周期管理，最大化设备利用率。',
      link: '/solutions#ems'
    }
  ];

  const features = [
    '10年+ 数字化工厂实施经验',
    '50+ 制造企业成功案例',
    '专业技术团队 100+ 人',
    '7×24 小时技术支持'
  ];

  const cases = [
    {
      name: '宁波某汽车零部件制造企业',
      description: '通过MES系统实现生产效率提升40%',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'
    },
    {
      name: '杭州某智能装备制造企业',
      description: 'WMS系统让仓储管理效率提升50%',
      image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop'
    },
    {
      name: '温州某电气制造企业',
      description: 'QMS系统助力品质不良率降低30%',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-primary-300 text-sm">专注数字化工厂10年</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                让工厂更智能，让生产更高效
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">数字化转型</span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl">
                宁波感叹号科技，专注于数字化工厂信息系统开发，为制造企业提供一站式数字化解决方案。
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/contact" 
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center gap-2"
                >
                  免费咨询 <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/solutions" 
                  className="border border-gray-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/5 transition-all"
                >
                  了解更多
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 size={18} className="text-primary-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=600&fit=crop" 
                  alt="智能工厂" 
                  className="rounded-2xl shadow-2xl border border-dark-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop" 
                alt="团队协作" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-primary-500 to-secondary-500 p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold text-white">10+</div>
                <div className="text-white/90">年行业经验</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">关于感叹号科技</h2>
              <p className="text-gray-400 text-lg">
                宁波感叹号科技有限公司成立于2014年，是一家专注于数字化工厂信息系统开发的高新技术企业。我们致力于为制造企业提供全方位的数字化转型解决方案。
              </p>
              <p className="text-gray-400">
                凭借丰富的行业经验和专业的技术团队，我们已成功服务50+制造企业，帮助客户实现生产效率提升、成本降低和品质改善。
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 text-primary-400 font-semibold hover:text-primary-300 transition-colors"
              >
                了解更多 <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-dark-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">核心解决方案</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              我们提供完整的数字化工厂解决方案，覆盖生产、仓储、质量、设备等核心领域
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <Link 
                key={index} 
                to={solution.link} 
                className="bg-dark-800 border border-dark-700 rounded-2xl p-8 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/10 transition-all group"
              >
                <div className="mb-6 p-4 bg-dark-700/50 rounded-xl w-fit group-hover:bg-primary-500/10 transition-colors">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                <p className="text-gray-400 mb-6">{solution.description}</p>
                <div className="flex items-center gap-2 text-primary-400 font-medium group-hover:text-primary-300">
                  查看详情 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section className="py-20 bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">成功案例</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              我们已帮助众多制造企业实现数字化转型，取得显著成效
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {cases.map((item, index) => (
              <div key={index} className="bg-dark-900 rounded-2xl overflow-hidden border border-dark-700 group hover:border-primary-500/50 transition-all">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-900">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                准备好开始数字化转型了吗？
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                联系我们，获取免费咨询服务，让我们一起探讨如何帮助您的企业实现智能化升级
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all"
              >
                立即咨询 <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
