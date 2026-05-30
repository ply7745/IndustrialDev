import React from 'react';
import { 
  Factory, 
  Package, 
  ShieldCheck, 
  Cog, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Solutions = () => {
  const solutions = [
    {
      id: 'mes',
      icon: <Factory className="w-12 h-12 text-primary-500" />,
      title: 'MES制造执行系统',
      description: '全面的生产过程管理系统，帮助企业实现生产过程的透明化、数字化和智能化。',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop',
      features: [
        '生产计划与排程管理',
        '生产过程监控与数据采集',
        '物料追踪与管理',
        '质量管理与追溯',
        '设备状态监控',
        '生产数据分析与报表'
      ],
      benefits: [
        '提升生产效率 30-50%',
        '降低生产成本 15-25%',
        '缩短生产周期 20-40%',
        '提高产品质量'
      ]
    },
    {
      id: 'wms',
      icon: <Package className="w-12 h-12 text-primary-500" />,
      title: 'WMS仓储管理系统',
      description: '智能化仓储管理系统，实现仓储作业的高效、精准和可视化管理。',
      image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=500&fit=crop',
      features: [
        '入库管理与质检',
        '出库管理与发货',
        '库位管理与库存盘点',
        '物料条码与RFID管理',
        '仓储作业调度',
        '库存分析与预警'
      ],
      benefits: [
        '提升仓储效率 40-60%',
        '降低库存积压 20-30%',
        '减少库存损耗 50%+',
        '提高库存准确率'
      ]
    },
    {
      id: 'qms',
      icon: <ShieldCheck className="w-12 h-12 text-primary-500" />,
      title: 'QMS质量管理系统',
      description: '全流程质量管理系统，确保产品质量稳定可靠，持续改进质量水平。',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
      features: [
        '进料检验管理',
        '过程检验管理',
        '成品检验管理',
        '不合格品处理',
        '质量数据分析',
        '质量追溯体系'
      ],
      benefits: [
        '降低不良率 20-40%',
        '提高客户满意度',
        '快速质量追溯',
        '持续质量改进'
      ]
    },
    {
      id: 'ems',
      icon: <Cog className="w-12 h-12 text-primary-500" />,
      title: 'EMS设备管理系统',
      description: '设备全生命周期管理系统，最大化设备利用率，延长设备使用寿命。',
      image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=500&fit=crop',
      features: [
        '设备档案管理',
        '设备维护保养',
        '设备维修管理',
        '设备状态监控',
        '备品备件管理',
        '设备数据分析'
      ],
      benefits: [
        '提高设备利用率 20-30%',
        '降低维护成本 15-25%',
        '延长设备使用寿命',
        '减少设备停机时间'
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">核心解决方案</h1>
            <p className="text-lg text-gray-400">
              我们提供完整的数字化工厂解决方案，覆盖生产、仓储、质量、设备等核心领域，助力制造企业实现智能化升级
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Details */}
      {solutions.map((solution, index) => (
        <section 
          key={solution.id} 
          id={solution.id}
          className={`py-20 ${index % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900'}`}
        >
          <div className="container mx-auto px-4">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <img 
                  src={solution.image} 
                  alt={solution.title} 
                  className="rounded-2xl shadow-xl"
                />
              </div>
              <div className="space-y-8">
                <div className="p-4 bg-dark-700/50 rounded-xl w-fit">
                  {solution.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{solution.title}</h2>
                <p className="text-gray-400 text-lg">{solution.description}</p>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">核心功能</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {solution.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 size={18} className="text-primary-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">客户收益</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {solution.benefits.map((benefit, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-xl p-4 text-center">
                        <div className="text-primary-400 font-semibold">{benefit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Integrated Solution */}
      <section className="py-20 bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">一体化解决方案</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              我们的各个系统可以无缝集成，形成完整的数字化工厂解决方案
            </p>
          </div>
          
          <div className="bg-dark-900 rounded-3xl p-8 md:p-12 border border-dark-700">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {solutions.map((solution, index) => (
                <div key={index} className="text-center">
                  <div className="p-4 bg-dark-800 rounded-xl w-fit mx-auto mb-4">
                    {solution.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{solution.title}</h3>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dark-700 pt-8 text-center">
              <p className="text-gray-400 text-lg mb-6">
                数据互通，流程协同，实现企业数字化转型的全面升级
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all"
              >
                获取完整方案 <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
