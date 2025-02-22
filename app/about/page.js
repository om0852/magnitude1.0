'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const teamMembers = [
    {
      name: 'OM SACHIN SALUNKE',
      role: 'LEADER\nAND\nBLOCKCHAIN DEVELOPER',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Om&backgroundColor=b794f4&skinColor=f8b788&glasses=variant02&glassesProbability=100&hair=short16&hairColor=000000&shirt=polo&shirtColor=fda4af',
      github: 'https://github.com/om0852'
    },
    {
      name: 'NISHANT NAVNATH TALEKAR ',
      role: 'BACK-END \n DEVELOPER',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nishant&backgroundColor=9f7aea&skinColor=ffdfbf&hair=short02&hairColor=000000&shirt=polo&shirtColor=6366f1&eyes=variant26&beard=variant01&beardProbability=100',
      github: 'https://github.com/nishant1195'
    },
    {
      name: 'ATHARVA KAILAS KADAM ',
      role: 'FRONT-END \n DEVELOPER',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Atharva&backgroundColor=805ad5&skinColor=e3b7a0&glasses=variant04&glassesProbability=100&hair=short01&hairColor=000000&shirt=polo&shirtColor=34d399&glassesColor=000000&mouth=variant02',
      github: 'https://github.com/AtharvaKailasKadam'
    },
    {
      name: 'PRITI DINESH SHARMA ',
      role: 'TESTER \n AND \n DOCUMENTATION',
      image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priti&backgroundColor=6b46c1&skinColor=ffdfbf&glasses=variant02&glassesProbability=100&hair=long19&hairColor=000000&shirt=polo&shirtColor=fb7185&glassesColor=4b5563&mouth=variant02',
      github: 'https://github.com/pritisharma1511'
    }
  ];

  const values = [
    {
      title: 'Safety First',
      description: 'We prioritize the safety and security of our riders and drivers above all else.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Innovation',
      description: 'Continuously improving our technology to provide the best ride-sharing experience.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Community',
      description: 'Building strong connections between riders and drivers in our community.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Sustainability',
      description: 'Committed to reducing environmental impact through eco-friendly practices.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const TabButton = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
        activeTab === tab
          ? 'bg-purple-100 text-purple-700 shadow-sm'
          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'mission':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">Our Mission</h3>
            <div className="transform transition-all duration-500 hover:scale-105 bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl shadow-lg hover:shadow-2xl border border-purple-100 hover:border-purple-200">
              <p className="text-gray-600 leading-relaxed">
                At Ride90, our mission is to revolutionize urban transportation by providing safe, reliable, and sustainable ride-sharing solutions. We believe in connecting people and communities through seamless mobility services that prioritize both convenience and environmental responsibility.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="transform transition-all duration-500 hover:-translate-y-2 group">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl border border-purple-100 hover:border-purple-200 relative overflow-hidden group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-purple-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg shadow-inner">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-purple-700">Vision</h4>
                    </div>
                    <p className="text-gray-600">
                      To be the leading innovative force in transforming how people move within their cities, creating a more connected and sustainable future.
                    </p>
                  </div>
                </div>
              </div>

              <div className="transform transition-all duration-500 hover:-translate-y-2 group">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl border border-purple-100 hover:border-purple-200 relative overflow-hidden group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-purple-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg shadow-inner">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-purple-700">Goals</h4>
                    </div>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform duration-200">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm"></span>
                        Reduce urban congestion
                      </li>
                      <li className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform duration-200">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm"></span>
                        Minimize environmental impact
                      </li>
                      <li className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform duration-200">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm"></span>
                        Enhance community connectivity
                      </li>
                      <li className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform duration-200">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm"></span>
                        Provide economic opportunities
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'values':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">Our Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="transform transition-all duration-500 hover:-translate-y-2 group">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl border border-purple-100 hover:border-purple-200 relative overflow-hidden group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-purple-50 flex gap-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 shadow-inner transform transition-transform group-hover:scale-110">
                        {value.icon}
                      </div>
                    </div>
                    <div className="relative">
                      <h4 className="text-lg font-semibold text-purple-700 mb-2 group-hover:translate-x-1 transition-transform duration-200">
                        {value.title}
                      </h4>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">Our Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <a 
                  key={index} 
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-all duration-500 hover:-translate-y-2 group cursor-pointer"
                >
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl border border-purple-100 hover:border-purple-200 text-center relative overflow-hidden group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-purple-50">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto mb-4 relative rounded-full overflow-hidden bg-purple-100 transform transition-transform group-hover:scale-105 shadow-lg group-hover:shadow-xl">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                      <h4 className="text-base font-medium text-gray-800 group-hover:text-purple-700 transition-colors duration-200 tracking-wider">{member.name}</h4>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-purple-300 to-purple-500 mx-auto my-3 transform origin-left transition-transform group-hover:scale-x-150"></div>
                      <p className="text-purple-600 font-semibold mb-3 whitespace-pre-line text-sm tracking-wide">{member.role}</p>
                      <div className="flex items-center justify-center mt-4 text-gray-500 group-hover:text-purple-600 transition-colors duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="bg-gradient-to-r from-purple-800 to-purple-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-24 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">About <span className="tracking-wider">RIDE<span className="text-purple-300">-</span><span className="text-purple-200">90</span></span></h1>
            <p className="text-purple-100 text-lg max-w-3xl mx-auto tracking-wide">
              Transforming Urban Mobility Through Innovative Ride-Sharing Solutions That Connect Communities And Promote Sustainable Transportation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="flex gap-2 p-4 border-b border-purple-100 bg-purple-200">
            <TabButton 
              tab="mission" 
              label="Mission"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <TabButton 
              tab="values" 
              label="Values"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
            <TabButton 
              tab="team" 
              label="Team"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 