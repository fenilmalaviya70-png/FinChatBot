/**
 * About Page Component
 * Premium About Us page with team, mission, and features
 */

import {
  Sparkles,
  Target,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Brain,
  Globe,
  Award,
  Heart,
  Code,
  Rocket,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import Navbar from '../components/layout/Navbar';
import CustomCursor from '../components/layout/CustomCursor';

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms analyze financial data with precision and speed.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level security ensures your financial data stays protected.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant insights and calculations in real-time.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Accurate Calculations',
      description: 'Zero hallucination with exact financial calculations using agentic tools.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const team = [
    {
      name: 'AI Research Team',
      role: 'Machine Learning Engineers',
      description: 'Building cutting-edge AI models for financial analysis',
      icon: Brain,
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Product Team',
      role: 'Product Designers & Managers',
      description: 'Crafting intuitive experiences for financial professionals',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Engineering Team',
      role: 'Full-Stack Engineers',
      description: 'Building robust, scalable infrastructure',
      icon: Code,
      color: 'from-green-500 to-teal-600'
    },
    {
      name: 'Finance Team',
      role: 'Financial Analysts',
      description: 'Ensuring accuracy and compliance in financial calculations',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Accuracy Rate', icon: Target },
    { value: '10K+', label: 'Analyses Daily', icon: Zap },
    { value: '50+', label: 'Countries', icon: Globe },
    { value: '4.9/5', label: 'User Rating', icon: Award }
  ];

  const values = [
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'We put our users first in every decision we make.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data security and privacy are our top priorities.'
    },
    {
      icon: Rocket,
      title: 'Innovation',
      description: 'Constantly pushing boundaries with cutting-edge technology.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Working together to build the future of finance.'
    }
  ];

  return (
    <SettingsProvider>
      <ThemeProvider>
        <AboutPageContent />
      </ThemeProvider>
    </SettingsProvider>
  );
};

const AboutPageContent = () => {
  const navigate = useNavigate();
  const { customCursor } = useSettings();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms analyze financial data with precision and speed.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level security ensures your financial data stays protected.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant insights and calculations in real-time.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Accurate Calculations',
      description: 'Zero hallucination with exact financial calculations using agentic tools.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const team = [
    {
      name: 'AI Research Team',
      role: 'Machine Learning Engineers',
      description: 'Building cutting-edge AI models for financial analysis',
      icon: Brain,
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Product Team',
      role: 'Product Designers & Managers',
      description: 'Crafting intuitive experiences for financial professionals',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Engineering Team',
      role: 'Full-Stack Engineers',
      description: 'Building robust, scalable infrastructure',
      icon: Code,
      color: 'from-green-500 to-teal-600'
    },
    {
      name: 'Finance Team',
      role: 'Financial Analysts',
      description: 'Ensuring accuracy and compliance in financial calculations',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Accuracy Rate', icon: Target },
    { value: '10K+', label: 'Analyses Daily', icon: Zap },
    { value: '50+', label: 'Countries', icon: Globe },
    { value: '4.9/5', label: 'User Rating', icon: Award }
  ];

  const values = [
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'We put our users first in every decision we make.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data security and privacy are our top priorities.'
    },
    {
      icon: Rocket,
      title: 'Innovation',
      description: 'Constantly pushing boundaries with cutting-edge technology.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Working together to build the future of finance.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900">
      {customCursor && <CustomCursor />}
      {/* Navbar */}
      <Navbar onMenuClick={() => { }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background blobs (static) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 rounded-xl shadow-md hover:shadow-lg transition-shadow hover:bg-gray-50 dark:hover:bg-dark-700"
          >
            <ArrowLeft className="w-5 h-5 text-primary-500" />
            <span className="text-gray-700 dark:text-gray-300">Back to Chat</span>
          </button>

          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                About FinChat AI
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Revolutionizing financial analysis with cutting-edge AI technology.
              We're building the future of intelligent financial decision-making.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg transition-colors"
              >
                Get Started
              </button>
              <button
                className="px-6 py-3 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium shadow-lg transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-dark-800 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary-500" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              To democratize financial intelligence by making advanced AI-powered
              analysis accessible to everyone, from individual investors to
              enterprise organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A diverse group of experts passionate about transforming financial analysis
              through artificial intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center flex-shrink-0`}>
                    <member.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-900 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center p-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Financial Analysis?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals using FinChat AI to make smarter financial decisions.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white hover:bg-gray-50 text-primary-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Start Analyzing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-dark-700">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 FinChat AI. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Built with ❤️ using React, FastAPI, and cutting-edge AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
