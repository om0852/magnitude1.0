'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #6b46c1 0%, #4a148c 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
`;

const WebsiteName = styled.h1`
  color: white;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 2;
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  
  span {
    color: #9f7aea;
  }
`;

const FireBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
`;

const SplitContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 2;

  @media (max-width: 968px) {
    flex-direction: column;
    max-width: 420px;
  }
`;

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  min-height: 600px;
  min-width: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 968px) {
    min-height: 300px;
  }
`;

const FormSection = styled.div`
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 968px) {
    padding: 2rem;
  }
`;

const WelcomeText = styled.div`
  margin-bottom: 2rem;
  color: white;

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 2.5rem;
  border: 2px solid ${props => props.error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:focus {
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const InputIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
`;

const ErrorMessage = styled(motion.p)`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: none;
  border-radius: 0.75rem;
  background: #9f7aea;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #805ad5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(159, 122, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const GoogleButton = styled(Button)`
  background: white;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;

  &:hover {
    background: #f8f9fa;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.6);
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }

  span {
    padding: 0 1rem;
    font-size: 0.875rem;
  }
`;

const FireballContainer = styled(motion.div)`
  position: absolute;
  width: 60px;
  height: 60px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.8;
  filter: brightness(1.2);
`;

const generateRandomPath = () => {
  const startX = Math.random() * 100; // Random start position
  const endX = startX + (Math.random() * 40 - 20); // Random end position with slight drift
  const duration = 3 + Math.random() * 2; // Random duration between 3-5 seconds
  const delay = Math.random() * 2; // Random delay between 0-2 seconds
  const scale = 0.8 + Math.random() * 0.4; // Random size between 0.8-1.2

  return {
    startX,
    endX,
    duration,
    delay,
    scale
  };
};

const fireballVariants = {
  initial: { y: -100, opacity: 0 },
  animate: ({ startX, endX, duration, delay }) => ({
    y: ["0vh", "100vh"],
    x: [startX + "vw", endX + "vw"],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeIn",
      times: [0, 0.1, 0.9, 1],
      repeatDelay: Math.random() * 2
    }
  })
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Add your login logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      // Handle successful login
    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      });
      
      if (result?.error) {
        console.error('Google Sign-in Error:', result.error);
        setErrors({ submit: 'Google sign-in failed. Please try again.' });
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setErrors({ submit: 'An error occurred during sign-in.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fireballs = Array.from({ length: 15 }).map((_, i) => ({
    ...generateRandomPath(),
    id: i
  }));

  return (
    <PageContainer>
      <WebsiteName>
        Ride<span>90</span>
      </WebsiteName>

      <FireBackground>
        <AnimatePresence>
          {fireballs.map((fireball) => (
            <FireballContainer
              key={fireball.id}
              custom={fireball}
              variants={fireballVariants}
              initial="initial"
              animate="animate"
              style={{
                scale: fireball.scale
              }}
            >
              <Image
                src="/fire.gif"
                alt="Fireball"
                width={60}
                height={60}
                style={{ 
                  objectFit: 'cover',
                  filter: 'brightness(1.2) contrast(1.1)'
                }}
              />
            </FireballContainer>
          ))}
        </AnimatePresence>
      </FireBackground>

      <SplitContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ImageSection>
          <Image
            src="/login.png"
            alt="Login"
            fill
            style={{ 
              objectFit: 'cover',
              padding: '0rem'
            }}
            priority
          />
        </ImageSection>

        <FormSection>
          <WelcomeText>
            <h1>Welcome Back!</h1>
            <p>Please sign in to continue</p>
          </WelcomeText>

          <form onSubmit={handleLogin}>
            {errors.submit && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '1rem', textAlign: 'center' }}
              >
                {errors.submit}
              </ErrorMessage>
            )}
            <InputGroup>
              <InputIcon>📧</InputIcon>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              {errors.email && (
                <ErrorMessage
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email}
                </ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <InputIcon>🔒</InputIcon>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              {errors.password && (
                <ErrorMessage
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password}
                </ErrorMessage>
              )}
            </InputGroup>

            <Button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <Divider>
              <span>OR</span>
            </Divider>

            <GoogleButton
              type="button"
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.405,3.404-4.545,3.404c-2.627,0-4.545-2.127-4.545-4.545s1.918-4.545,4.545-4.545c1.318,0,2.505,0.536,3.364,1.396l1.431-1.431C16.724,7.732,15.01,7,13.091,7C9.132,7,6,10.132,6,14.091s3.132,7.091,7.091,7.091c4.183,0,7.091-3.182,7.091-7.091v-1.182h-5.545C12.545,12.151,12.545,12.151,12.545,12.151z"
                />
              </svg>
              Sign in with Google
            </GoogleButton>
          </form>
        </FormSection>
      </SplitContainer>
    </PageContainer>
  );
} 