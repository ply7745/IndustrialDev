import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Factory, 
  Package, 
  ShieldCheck, 
  Cog,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const Solutions = () => {
  const solutions = [
    {
      id: 'mes',
      icon: <Factory className="w-12 h-12" />,
      title: 'MES制造执行系统',
      description: '全面的生产过程管理，提升生产效率和品质控制能力。',
      features: [
        '生产计划与排程管理',
        '生产过程监控与追溯',
        '物料管理与追溯',
        '设备状态监控',
        '质量数据采集与分析',
        '人员绩效管理',
        '报表与数据分析'
      ],
      benefits: [
        '生产效率提升30-50%',
        '产品追溯能力100%',
        '质量不良率降低20-40%',
        '设备利用率提升20%'
      ],
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop'
    },
    {
      id: 'wms',
      icon: <Package className="w-12 h-12" />,
      title: 'WMS仓储管理系统',
      description: '智能化仓储管理，优化库存周转率，降低仓储成本。',
      features: [
        '入库管理与质检',
        '出库管理与拣货',
        '库位管理与盘点',
        '库存实时监控',
        '批次管理与追溯',
        '报表与数据分析',
        'AGV/机器人集成'
      ],
      benefits: [
        '仓储效率提升40-60%',
        '库存准确率99.9%',
        '库存周转率提升30%',
        '仓储成本降低20%'
      ],
      image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=500&fit=crop'
    },
    {
      id: 'qms',
      icon: <ShieldCheck className="w-12 h-12" />,
      title: 'QMS质量管理系统',
      description: '全流程质量管控，确保产品质量稳定可靠。',
      features: [
        '来料检验管理',
        '过程检验管理',
        '成品检验管理',
        '不合格品管理',
        '质量追溯与分析',
        'SPC统计过程控制',
        '质量报表与看板'
      ],
      benefits: [
        '质量不良率降低30-50%',
        '质量追溯能力100%',
        '质量问题响应速度提升80%',
        '客户满意度提升20%'
      ],
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop'
    },
    {
      id: 'ems',
      icon: <Cog className="w-12 h-12" />,
      title: 'EMS设备管理系统',
      description: '设备全生命周期管理，最大化设备利用率。',
      features: [
        '设备档案管理',
        '设备维护保养计划',
        '设备维修管理',
        '设备状态监控',
        '备品备件管理',
        '设备数据分析',
        '能耗管理'
      ],
      benefits: [
        '设备利用率提升20-30%',
        '设备故障停机时间降低40%',
        '维护成本降低25%',
        '设备寿命延长15%'
      ],
      image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=500&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neon-blue mb-6">解决方案</h1>
            <p className="text-gray-300 text-lg">
              我们提供完整的数字化工厂解决方案，覆盖生产、仓储、质量、设备等核心领域
            </p>
          </div>
        </div>
      </section>

      {solutions.map((solution, index) => (
        <section 
          key={solution.id} 
          id={solution.id}
          className={`py-20 ${index % 2 === 0 ? 'bg-dark-900' : 'bg-dark-800'} relative overflow-hidden`}
        >
          <div className="absolute inset-0 cyber-grid opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="relative">
                <img 
                  src={solution.image} 
                  alt={solution.title} 
                  className="rounded-2xl shadow-neon-lg border border-primary-500/30"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-500/20 rounded-full blur-2xl"></div>
              </div>
              
              <div className="space-y-8">
                <div className="p-4 bg-dark-700/50 rounded-xl w-fit">
                  <div className="text-neon-cyan">{solution.icon}</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{solution.title}</h2>
                <p className="text-gray-300 text-lg">{solution.description}</p>
                
                <div>
                  <h3 className="text-xl font-bold text-neon-blue mb-4">核心功能</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {solution.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 size={18} className="text-neon-cyan flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-neon-blue mb-4">客户收益</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {solution.benefits.map((benefit, idx) => (
                      <div key={idx} className="bg-glass border border-primary-500/30 rounded-xl p-4">
                        <div className="text-white font-medium">{benefit}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-neon transition-all border border-primary-400"
                >
                  获取方案 <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-4">实施服务流程</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              我们提供全流程的实施服务，确保项目成功落地
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: '01', title: '需求调研', desc: '深入了解客户业务流程与需求' },
              { step: '02', title: '方案设计', desc: '制定定制化的解决方案' },
              { step: '03', title: '系统开发', desc: '按方案进行系统开发配置' },
              { step: '04', title: '实施上线', desc: '现场部署与用户培训' },
              { step: '05', title: '运维支持', desc: '持续优化与技术支持' }
            ].map((item, index) => (
              <div key={index} className="bg-glass border border-primary-500/30 rounded-2xl p-6 text-center hover:border-neon-cyan transition-all hover-glow">
                <div className="text-4xl font-bold text-neon-blue mb-3">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border border-primary-400 shadow-neon-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                需要定制化解决方案？
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                每个企业的情况都不同，我们可以根据您的具体需求定制专属解决方案
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all border-2 border-white"
              >
                联系我们 <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
