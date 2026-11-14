import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sprout,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StakeholderPortalsSection: React.FC = () => {
  const portals = [
    {
      id: 'farmer-portal',
      role: 'FARMER',
      title: 'Farmer Producer Portal',
      subtitle: 'For Agricultural Landholders & Producers',
      description: 'Delineate field boundaries on high-resolution satellite GIS, upload Patta documents with AI OCR auto-fill, and track official UAV harvest yield certificates.',
      accentColor: '#008C45',
      icon: Sprout,
      badge: 'PRODUCER ACCESS',
      capabilities: [
        'Satellite GIS cadastral parcel demarcation',
        'AI document scanner for Bhulekh RoR (Patta)',
        'Autonomous UAV survey requests',
        'Harvest yield tonnage verification records'
      ],
      buttonText: 'Enter Farmer Portal',
      linkPath: '/login'
    },
    {
      id: 'official-portal',
      role: 'OFFICIAL',
      title: 'Official Inspection Portal',
      subtitle: 'For Revenue & Agriculture Officers',
      description: 'Review farmer cadastral submissions, verify spatial parcel boundaries, inspect UAV flight orthomosaics, and approve official harvest yield certificates.',
      accentColor: '#0284C7',
      icon: Building2,
      badge: 'GOVERNMENT INSPECTION',
      capabilities: [
        'Cadastral boundary audit & LGD verification',
        'UAV flight orthomosaic & NDVI analysis',
        'Volumetric grain heap mass auditing',
        'Issuance of official yield certificates'
      ],
      buttonText: 'Launch Official Portal',
      linkPath: '/login'
    },
    {
      id: 'admin-portal',
      role: 'ADMIN',
      title: 'Operations & Admin Console',
      subtitle: 'For State Mission Directors & Operators',
      description: 'Comprehensive governance console managing UAV flight fleet telemetry, role-based user access approvals, PostGIS spatial repositories, and audit logs.',
      accentColor: '#475569',
      icon: ShieldCheck,
      badge: 'SYSTEM GOVERNANCE',
      capabilities: [
        'Official access request approvals queue',
        'UAV flight mission fleet telemetry status',
        'PostGIS spatial database management',
        'Audit logging & compliance security trail'
      ],
      buttonText: 'Access Admin Console',
      linkPath: '/login'
    }
  ];

  return (
    <section id="stakeholders" className="py-24 bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#008C45] mb-3"
          >
            <Users className="w-3.5 h-3.5" />
            <span>ROLE-BASED STAKEHOLDER GATEWAYS</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl text-[#0f2e1e] tracking-tight"
          >
            Agricultural Stakeholder Portal Access
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-gray-600 font-normal leading-relaxed"
          >
            Secure, role-aware Digital Public Infrastructure tailored for producers, departmental revenue inspectors, and system administrators.
          </motion.p>
        </div>

        {/* 3 Portal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portals.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="rounded-2xl border border-gray-200/90 bg-[#F8FAFC] p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200/70">
                    <span 
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider"
                      style={{ 
                        backgroundColor: `${p.accentColor}12`,
                        color: p.accentColor,
                        border: `1px solid ${p.accentColor}30`
                      }}
                    >
                      {p.badge}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: p.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-[#008C45] transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <span className="text-[11px] text-gray-500 font-medium block">
                        {p.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-600 leading-relaxed font-normal">
                    {p.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-gray-200/60 space-y-2">
                    {p.capabilities.map((cap) => (
                      <div key={cap} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 
                          className="w-3.5 h-3.5 shrink-0 mt-0.5" 
                          style={{ color: p.accentColor }} 
                        />
                        <span className="leading-tight">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 pt-4 border-t border-gray-200/70">
                  <Link
                    to={p.linkPath}
                    state={{ defaultRole: p.role }}
                    className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:opacity-95"
                    style={{ backgroundColor: p.accentColor }}
                  >
                    <span>{p.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
