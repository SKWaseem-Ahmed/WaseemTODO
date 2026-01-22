import React from 'react';
import { motion } from 'framer-motion';

const GlassOrb = ({ size, x, y, delay, duration, color }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: `radial-gradient(circle at 30% 30%, ${color}80, ${color}40, transparent)`,
      boxShadow: `
        inset 0 0 40px ${color}40,
        0 0 60px ${color}30,
        0 0 100px ${color}20
      `,
      backdropFilter: 'blur(2px)',
    }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }}
  />
);

const GlassRing = ({ size, x, y, delay, duration, color }) => (
  <motion.div
    className="absolute rounded-full border-2"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      borderColor: `${color}50`,
      background: `linear-gradient(135deg, ${color}20, transparent)`,
      boxShadow: `
        inset 0 0 20px ${color}20,
        0 0 30px ${color}15
      `,
    }}
    animate={{
      rotate: [0, 360],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      ease: "linear",
      delay: delay,
    }}
  />
);

const FloatingBlob = ({ size, x, y, delay, duration, color }) => (
  <motion.div
    className="absolute"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: `linear-gradient(135deg, ${color}60, ${color}30)`,
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      filter: 'blur(20px)',
    }}
    animate={{
      borderRadius: [
        '30% 70% 70% 30% / 30% 30% 70% 70%',
        '70% 30% 30% 70% / 70% 70% 30% 30%',
        '30% 70% 70% 30% / 30% 30% 70% 70%',
      ],
      y: [0, -20, 0],
      x: [0, 20, 0],
      rotate: [0, 45, 0],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }}
  />
);

export default function BackgroundScene() {
  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #e0f4fc 100%)'
      }}
    >
      {/* Blobs */}
      <FloatingBlob size={300} x="10%" y="20%" delay={0} duration={8} color="#88d4e5" />
      <FloatingBlob size={250} x="70%" y="60%" delay={1} duration={10} color="#7dd3e8" />
      <FloatingBlob size={200} x="80%" y="10%" delay={0.5} duration={9} color="#a5e9f7" />
      <FloatingBlob size={180} x="20%" y="70%" delay={1.5} duration={11} color="#9eebf8" />
      
      {/* Orbs */}
      <GlassOrb size={150} x="15%" y="30%" delay={0} duration={6} color="#06b6d4" />
      <GlassOrb size={100} x="75%" y="25%" delay={0.5} duration={7} color="#0891b2" />
      <GlassOrb size={120} x="60%" y="70%" delay={1} duration={8} color="#22d3ee" />
      <GlassOrb size={80} x="30%" y="80%" delay={1.5} duration={5} color="#67e8f9" />
      <GlassOrb size={90} x="85%" y="50%" delay={2} duration={6.5} color="#0284c7" />
      
      {/* Rings */}
      <GlassRing size={200} x="5%" y="50%" delay={0} duration={20} color="#06b6d4" />
      <GlassRing size={160} x="65%" y="15%" delay={2} duration={25} color="#0891b2" />
      <GlassRing size={120} x="45%" y="60%" delay={1} duration={15} color="#22d3ee" />
      
      {/* Light rays */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 80%, rgba(8, 145, 178, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
