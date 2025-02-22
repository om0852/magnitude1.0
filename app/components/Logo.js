import { motion } from 'framer-motion';
import styled from 'styled-components';

// Import Gaglin font from Google Fonts
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Gaglin:wght@400;700&display=swap');
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  position: relative;
`;

const TextContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.05rem;
`;

const UnderlineContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 4px;
  margin-top: 0.2rem;
  overflow: hidden;
  transform-style: preserve-3d;
`;

const Underline = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.8) 50%,
    transparent 100%
  );
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
  transform-style: preserve-3d;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    transform: translateZ(2px);
  }
`;

const Letter = styled(motion.span)`
  font-size: 1.8rem;
  font-weight: 800;
  position: relative;
  display: inline-block;
  font-family: 'Gaglin', sans-serif;
  color: white;
  transition: transform 0.3s ease;
`;

const Dash = styled(Letter)`
  margin: 0 0.2rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
`;

const Number = styled(Letter)`
  color: rgba(255, 255, 255, 0.9);
`;

const LightningContainer = styled(motion.div)`
  margin: 0 0.2rem;
  display: flex;
  align-items: center;
  transform-style: preserve-3d;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
`;

const Logo = () => {
  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.610, 0.355, 1.000],
        opacity: { duration: 0.6 }
      }
    }),
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    hidden: { 
      scale: 0.8,
    },
    visible: {
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.215, 0.610, 0.355, 1.000],
        staggerChildren: 0.1
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    }
  };

  const lightningVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -45
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.4,
        duration: 0.5,
        ease: "backOut"
      }
    },
    hover: {
      scale: 1.2,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.3,
        rotate: {
          duration: 0.2,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }
    }
  };

  const underlineVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0
    },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scaleX: 1.1,
      y: 2,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <GlobalStyle />
      <LogoContainer
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={containerVariants}
      >
        <TextContainer>
          {['R', 'I', 'D', 'E'].map((letter, i) => (
            <Letter
              key={i}
              data-text={letter}
              custom={i}
              variants={letterVariants}
              whileHover="hover"
            >
              {letter}
            </Letter>
          ))}
          
          <LightningContainer
            variants={lightningVariants}
            whileHover="hover"
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  transition: { 
                    delay: 0.5,
                    duration: 1,
                    ease: "easeInOut"
                  }
                }}
                style={{
                  stroke: "url(#lightningGradient)",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  fill: "url(#lightningFill)"
                }}
              />
              <defs>
                <linearGradient
                  id="lightningGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <linearGradient
                  id="lightningFill"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFA500" stopOpacity="0.9" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
            </motion.svg>
          </LightningContainer>

          {['9', '0'].map((number, i) => (
            <Number
              key={i}
              data-text={number}
              custom={i + 5}
              variants={letterVariants}
              whileHover="hover"
            >
              {number}
            </Number>
          ))}
        </TextContainer>

        <UnderlineContainer>
          <Underline
            variants={underlineVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          />
        </UnderlineContainer>
      </LogoContainer>
    </>
  );
};

export default Logo;