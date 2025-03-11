import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticlesBackground = ({ darkMode }) => {
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        particles: {
          number: { value: 50 },
          color: { value: darkMode ? '#8A9A8B' : '#606F60' },
          opacity: { value: 0.5 },
          size: { value: 1 },
          move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
          },
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: 'repulse' }
          }
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
};

export default ParticlesBackground;