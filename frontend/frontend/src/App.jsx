import React from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="icon">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

const Navbar = () => (
  <nav className="glass" style={{ padding: '1.25rem 0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="neu-inset" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <img src="/chatbotlogo.svg" alt="Logo" style={{ width: '100%', height: '100%' }} />
        </div>
        <span style={{ letterSpacing: '2px', textShadow: '0 0 10px rgba(219, 0, 0, 0.2)' }}>RED BOT</span>
      </div>
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <ThemeToggle />
        <button className="primary">Get Started</button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <header style={{ padding: '120px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    {/* Decorative Background Elements for Glassmorphism depth */}
    <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(219,0,0,0.1) 0%, transparent 70%)', zIndex: -1 }}></div>
    <div style={{ position: 'absolute', bottom: '0', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(219,0,0,0.05) 0%, transparent 70%)', zIndex: -1 }}></div>

    <div className="container">
      <div className="glass" style={{ padding: '4rem 2rem', borderRadius: '32px', display: 'inline-block', width: '100%', maxWidth: '900px' }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: '1', color: 'var(--text)' }}>
          Design <span style={{ color: 'var(--primary)' }}>Transcended.</span>
        </h1>
        <p style={{ fontSize: '1.3rem', maxWidth: '650px', margin: '0 auto 3rem', color: 'var(--text-muted)' }}>
          The perfect harmony of <span style={{ color: 'var(--text)', fontWeight: '600' }}>Neumorphic softness</span> and
          <span style={{ color: 'var(--text)', fontWeight: '600' }}> Glassmorphic depth</span>. Built for the future.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button className="primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>Start Building</button>
          <button style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>Our Vision</button>
        </div>
      </div>
    </div>
  </header>
);

const FeatureCard = ({ title, description, icon }) => (
  <div className="neu-flat" style={{ padding: '2.5rem', textAlign: 'left', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div className="neu-inset" style={{ width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
      {icon}
    </div>
    <h3 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>{title}</h3>
    <p style={{ lineHeight: '1.7', color: 'var(--text-muted)' }}>{description}</p>
  </div>
);

const Features = () => (
  <section id="features" style={{ padding: '120px 0' }}>
    <div className="container">
      <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '4rem', fontWeight: '800' }}>The Soft Touch</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
        <FeatureCard
          icon="✨"
          title="Organic Depth"
          description="Neumorphic elements create a tactile feel that makes the interface feel alive and interactive."
        />
        <FeatureCard
          icon="🫧"
          title="Frosted Layering"
          description="Our Glassmorphism implementation adds a layer of sophistication and modern transparency."
        />
        <FeatureCard
          icon="🎨"
          title="Unified Aesthetic"
          description="A carefully curated blend of shadows and blurs that provides a premium enterprise experience."
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ padding: '60px 0', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
    <div className="container" style={{ textAlign: 'center' }}>
      <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        Made with <span style={{ color: 'var(--primary)' }}>❤️</span> by RED BOT AI
      </p>
    </div>
  </footer>
);

function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
