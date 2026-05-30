import React from 'react';
import { Users, Target, Lightbulb, Award, CheckCircle2 } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: '客户至上',
      description: '以客户需求为导向，提供超出期望的解决方案和服务'
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: '持续创新',
      description: '紧跟技术前沿，不断探索和应用新技术'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: '精益求精',
      description: '追求卓越品质，关注每一个细节'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '合作共赢',
      description: '与客户、合作伙伴共同成长，实现双赢'
    }
  ];

  const milestones = [
    { year: '2014', title: '公司成立', description: '宁波感叹号科技有限公司正式成立' },
    { year: '2016', title: '首个MES系统上线', description: '为宁波某汽配企业成功实施MES系统' },
    { year: '2018', title: '产品线完善', description: '推出WMS、QMS、EMS等完整解决方案' },
    { year: '2020', title: '服务50+客户', description: '累计服务50+制造企业，获得广泛认可' },
    { year: '2022', title: '高新技术企业', description: '获评国家高新技术企业' },
    { year: '2024', title: '持续创新', description: '推出AI赋能的数字化工厂解决方案' }
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neon-blue mb-6">关于我们</h1>
            <p className="text-gray-300 text-lg">
              专注于数字化工厂信息系统开发，助力制造企业实现智能制造转型升级
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-neon-blue">公司简介</h2>
              <p className="text-gray-300 text-lg">
                宁波感叹号科技有限公司成立于2014年，是一家专注于数字化工厂信息系统开发的高新技术企业。
              </p>
              <p className="text-gray-400">
                我们拥有一支经验丰富的专业技术团队，核心成员均具有10年以上制造业信息化经验。凭借对制造行业的深刻理解和技术实力，我们为客户提供从需求调研、系统设计、实施部署到培训运维的全流程服务。
              </p>
              <p className="text-gray-400">
                公司秉承"客户至上、持续创新"的理念，已成功为50+制造企业提供数字化转型解决方案，帮助客户实现生产效率提升40%以上，品质不良率降低30%以上。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-glass p-8 rounded-2xl border border-primary-500/30 text-center">
                <div className="text-4xl font-bold text-neon-cyan mb-2">10+</div>
                <div className="text-gray-400">年行业经验</div>
              </div>
              <div className="bg-glass p-8 rounded-2xl border border-primary-500/30 text-center">
                <div className="text-4xl font-bold text-neon-cyan mb-2">50+</div>
                <div className="text-gray-400">服务客户</div>
              </div>
              <div className="bg-glass p-8 rounded-2xl border border-primary-500/30 text-center">
                <div className="text-4xl font-bold text-neon-cyan mb-2">100+</div>
                <div className="text-gray-400">专业团队</div>
              </div>
              <div className="bg-glass p-8 rounded-2xl border border-primary-500/30 text-center">
                <div className="text-4xl font-bold text-neon-cyan mb-2">40%</div>
                <div className="text-gray-400">效率提升</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-4">核心价值观</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              我们的价值观指引着我们的发展方向和行为准则
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-glass border border-primary-500/30 rounded-2xl p-8 hover:border-neon-cyan hover:shadow-neon transition-all hover-glow"
              >
                <div className="mb-6 p-4 bg-dark-700/50 rounded-xl w-fit">
                  <div className="text-neon-cyan">{value.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-4">发展历程</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              见证我们的成长与蜕变
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-24 text-right">
                    <div className="text-neon-cyan font-bold text-2xl">{milestone.year}</div>
                  </div>
                  <div className="flex-shrink-0 w-4 h-4 mt-2 bg-neon-blue rounded-full shadow-neon"></div>
                  <div className="flex-1 bg-glass border border-primary-500/30 rounded-xl p-6 hover:border-neon-cyan transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                    <p className="text-gray-400">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neon-blue mb-8">我们的优势</h2>
              <div className="space-y-6">
                {[
                  '行业经验丰富：10年+制造业信息化经验',
                  '专业技术团队：核心成员均为行业专家',
                  '完整解决方案：覆盖数字化工厂全领域',
                  '本地化服务：7×24小时快速响应',
                  '成功案例众多：50+制造企业验证',
                  '持续创新能力：紧跟技术前沿'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 size={24} className="text-neon-blue flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=500&fit=crop" 
                alt="团队" 
                className="rounded-2xl shadow-neon-lg border border-primary-500/30"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
