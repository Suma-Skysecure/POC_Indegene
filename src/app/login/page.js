"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Blue-Green Twisted Wave Animation (Canvas)
const DigitalWaveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width, height;

    // Particle Class
    const particles = [];
    const numParticles = 180;

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.velocity = Math.random() * 0.5 + 0.2;
        this.size = Math.random() * 2 + 0.5;
        this.frequency = Math.random() * 0.02 + 0.01;
      }

      update(time) {
        this.x += this.velocity;
        this.y += Math.sin(this.x * this.frequency + time) * 0.5;
        if (this.x > width) {
          this.x = 0;
          this.y = Math.random() * height;
        }
      }

      draw() {
        const diagonal = (this.x + (height - this.y)) / (width + height);
        let r, g, b, a;
        if (diagonal < 0.5) {
          r = 34; g = 197; b = 94; // Green
        } else {
          r = 59; g = 130; b = 246; // Blue
        }
        a = Math.random() * 0.6 + 0.2;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Lines
    const lines = [];
    const numLines = 40;

    // Functions
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Re-init lines on resize
      lines.length = 0;
      for (let i = 0; i < numLines; i++) {
        lines.push({
          y: (height / numLines) * i,
          offset: i * 0.5,
        });
      }
    };

    // Initial setup
    resize();
    window.addEventListener('resize', resize);

    // Init Particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    let time = 0;
    const draw = () => {
      // Background Gradient (Full Screen)
      const bgGradient = ctx.createLinearGradient(0, height, width, 0);
      bgGradient.addColorStop(0, '#022c22'); // dark green
      bgGradient.addColorStop(0.4, '#0f172a'); // slate-900
      bgGradient.addColorStop(1, '#172554'); // dark blue

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Draw Lines
      ctx.lineWidth = 1;
      lines.forEach((line) => {
        const lineGrad = ctx.createLinearGradient(0, height, width, 0);
        lineGrad.addColorStop(0, 'rgba(74, 222, 128, 0.3)');
        lineGrad.addColorStop(1, 'rgba(96, 165, 250, 0.3)');
        ctx.strokeStyle = lineGrad;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y = line.y + Math.sin(x * 0.005 + time + line.offset) * 50
            + Math.sin(x * 0.01 + time * 0.5) * 30;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Draw Particles
      particles.forEach(p => {
        p.update(time);
        p.draw();
      });

      // Overlay
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900 z-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex">
      {/* Background Animation Layer */}
      <DigitalWaveBackground />

      {/* Main Container - Full Screen Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

        {/* Left Side - Brand Content */}
        {/* Takes up space but lets background show through */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between text-white h-screen pointer-events-none">
          {/* Logo - Top Left */}
          <div className="pointer-events-auto">
            <img
              alt="Indegene"
              src="https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg"
              className="h-12 w-auto"
            />
          </div>

          {/* Bottom Text Content */}
          <div className="mb-8 pointer-events-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
              Welcome to <br />
              <span className="text-white">
                Indegene Admin Portal
              </span>
            </h1>
            <p className="text-gray-200 text-lg leading-relaxed max-w-lg drop-shadow-md mb-8">
              Streamline your governance, manage tools efficiently, and access powerful insights all in one secure platform. Monitor shadow IT, optimize licenses, track vendor spend, and enforce policies with enterprise-grade control.
            </p>


          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 h-screen">
          {/* Floating White Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl p-10 md:p-14 relative flex flex-col justify-center min-h-[750px] md:-ml-24">

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
              <p className="text-gray-500">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-900">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 text-gray-900"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-end">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all"
              >
                Login
              </button>

            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-500">Don't have an account?</span>
              <a href="#" className="font-bold text-gray-900 hover:underline ml-1">
                Sign Up
              </a>
            </div>

            <div className="text-center text-gray-400 text-xs mt-8">
              © 2026 Indegene Inc.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
