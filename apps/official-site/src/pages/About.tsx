import React from 'react';
import { 
  Users, 
  Target, 
  Award, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '2014', title: '公司成立', description: '宁波感叹号科技有限公司正式成立' },
    { year: '2016', title: '产品发布', description: '第一代MES系统正式上线' },
    { year: '2018', title: '快速发展', description: '服务客户超过20家，团队规模50人+' },
    { year: '2020', title: '全面升级', description: '推出完整数字化工厂解决方案' },
    { year: '2022', title: '行业领先', description: '成为宁波地区数字化工厂解决方案领先供应商' },
    { year: '2024', title: '持续创新', description: '服务客户50+，持续技术创新' }
  ];

  const team = [
    { name: '张总', role: '创始人 & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { name: '李总', role: '技术总监', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
    { name: '王总', role: '市场总监', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
    { name: '陈总', role: '运营总监', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' }
  ];

  const values = [
    { icon: <Target className="w-10 h-10" />, title: '客户至上', description: '以客户需求为导向，提供最佳解决方案' },
    { icon: <Award className="w-10 h-10" />, title: '追求卓越', description: '持续创新，追求技术和服务的卓越品质' },
    { icon: <Users className="w-10 h-10" />, title: '团队协作', description: '发挥团队力量，共同创造价值' },
    { icon: <TrendingUp className="w-10 h-10" />, title: '创新驱动', description: '以技术创新引领行业发展' }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,212,255,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neon-blue mb-6">关于我们</h1>
            <p className="text-lg text-gray-300">
              专注数字化工厂10年，致力于为制造企业提供全方位的数字化转型解决方案
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-neon-blue">公司简介</h2>
              <p className="text-gray-300 text-lg">
                宁波感叹号科技有限公司成立于2014年，是一家专注于数字化工厂信息系统开发的高新技术企业。我们拥有一支经验丰富、技术精湛的专业团队，致力于为制造企业提供全方位的数字化转型解决方案。
              </p>
              <p className="text-gray-400">
                经过10年的发展，我们已成功服务50+制造企业，帮助客户实现生产效率提升、成本降低和品质改善。我们的产品涵盖MES制造执行系统、WMS仓储管理系统、QMS质量管理系统、EMS设备管理系统等多个领域。
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="bg-glass border border-primary-500/30 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-neon-blue mb-2">10+</div>
                  <div className="text-gray-400">年行业经验</div>
                </div>
                <div className="bg-glass border border-primary-500/30 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-neon-blue mb-2">50+</div>
                  <div className="text-gray-400">服务客户</div>
                </div>
                <div className="bg-glass border border-primary-500/30 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-neon-blue mb-2">100+</div>
                  <div className="text-gray-400">专业团队</div>
                </div>
                <div className="bg-glass border border-primary-500/30 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-neon-blue mb-2">10+</div>
                  <div className="text-gray-400">产品模块</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&h=600&fit=crop" 
                alt="公司办公环境" 
                className="rounded-2xl shadow-xl border border-primary-500/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-4">核心价值观</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              我们秉承这些价值观，为客户创造最大价值
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-glass border border-primary-500/30 rounded-2xl p-8 text-center hover:border-neon-cyan hover:shadow-neon transition-all">
                <div className="mb-6 flex justify-center text-neon-cyan">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-4">发展历程</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              十年耕耘，十年成长
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex gap-6 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="bg-glass border border-primary-500/30 rounded-xl p-6 hover:border-neon-cyan transition-all">
                      <div className="text-2xl font-bold text-neon-blue mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-neon-cyan rounded-full border-4 border-dark-900 shadow-neon"></div>
                    {index < milestones.length - 1 && <div className="w-0.5 h-full bg-primary-500/30"></div>}
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-4">核心团队</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              专业的团队，为您提供专业的服务
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full aspect-square object-cover rounded-2xl border border-primary-500/30 group-hover:border-neon-cyan transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-neon-blue">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
