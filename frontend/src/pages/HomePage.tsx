import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BookOpen, Clock, BarChart2, Users, ArrowRight, Send, Youtube, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-[#0A1F44]" />,
      title: 'MHT-CET Focused',
      description: 'Questions crafted specifically for MHT-CET by students who cracked it from COEP.',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#0A1F44]" />,
      title: 'Timed Mock Tests',
      description: 'Simulate real MHT-CET exam conditions with our timed test environment.',
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-[#0A1F44]" />,
      title: 'Instant Score Reports',
      description: 'Get your score immediately after each test and track your improvement over time.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#0A1F44]" />,
      title: 'COEPian Guidance',
      description: 'Learn from students of COEP Technological University — one of Maharashtra\'s finest.',
    },
  ];

  const benefits = [
    '100% Free — no hidden fees, ever',
    'Image-based questions just like the real MHT-CET',
    'Short notes & study material on Telegram',
    'Video explanations on YouTube',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#0A1F44] overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/assets/generated/hero-bg.dim_1440x600.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white/90 text-sm font-medium">By COEPians, For Aspirants</span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Free MHT-CET<br />
              <span className="text-white/70">Mock Tests</span>
            </h1>

            <p className="text-white/80 text-base md:text-lg font-medium mb-3">
              Created by COEPians – COEP Technological University, one of the top engineering colleges in Maharashtra
            </p>

            <p className="text-white/60 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
              Practice smarter with free full-length mock tests designed to mirror the actual MHT-CET exam. 
              Build confidence, sharpen your speed, and walk into the exam hall fully prepared — all at zero cost.
            </p>

            {/* Benefits list */}
            <ul className="mb-10 space-y-2">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-white/75 text-sm">
                  <CheckCircle className="w-4 h-4 text-white/60 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="inline-flex items-center gap-2 bg-white text-[#0A1F44] font-bold px-8 py-3.5 rounded hover:bg-white/90 transition-colors text-base shadow-lg"
              >
                Start Practicing Now
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="https://t.me/Conceptdelta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white text-white font-semibold px-6 py-3.5 rounded hover:bg-white/10 transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                Short Notes &amp; Free Test Series
              </a>

              <a
                href="https://youtube.com/@conceptdelta2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/50 text-white/80 font-semibold px-6 py-3.5 rounded hover:bg-white/10 hover:border-white hover:text-white transition-colors text-sm"
              >
                <Youtube className="w-4 h-4" />
                More Guidance on YouTube
              </a>
            </div>
          </div>
        </div>
        {/* Decorative bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
              Why Practice with Concept Delta?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Smart practice beats hard work. Our free mock tests are built to help you score higher on MHT-CET.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-[#0A1F44]/10 rounded-lg p-6 hover:shadow-navy transition-shadow"
              >
                <div className="w-12 h-12 bg-[#0A1F44]/5 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-[#0A1F44] text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0A1F44]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Your MHT-CET Prep Starts Here
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of aspirants already using Concept Delta's free mock tests to crack MHT-CET. 
            No sign-up fees. No paywalls. Just smart, focused practice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="inline-flex items-center gap-2 bg-white text-[#0A1F44] font-bold px-8 py-3.5 rounded hover:bg-white/90 transition-colors"
            >
              Start Practicing Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://t.me/Conceptdelta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white text-white font-semibold px-6 py-3.5 rounded hover:bg-white/10 transition-colors"
            >
              <Send className="w-4 h-4" />
              Short Notes &amp; Free Test Series
            </a>
            <a
              href="https://youtube.com/@conceptdelta2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/50 text-white/80 font-semibold px-6 py-3.5 rounded hover:bg-white/10 hover:border-white hover:text-white transition-colors"
            >
              <Youtube className="w-4 h-4" />
              More Guidance on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#0A1F44]/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/concept-delta-logo.dim_128x128.png"
                alt="Concept Delta"
                className="w-6 h-6 object-contain"
              />
              <span className="font-heading font-bold text-[#0A1F44]">Concept Delta</span>
              <span className="text-gray-400 text-sm">© {new Date().getFullYear()}</span>
            </div>
            <p className="text-gray-400 text-sm">
              Built with{' '}
              <span className="text-[#0A1F44]">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A1F44] font-medium hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
