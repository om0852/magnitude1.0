'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const NavContainer = styled.nav`
  background: linear-gradient(135deg, 
    #6b21a8 0%,    /* Purple 800 */
    #7e22ce 50%,   /* Purple 700 */
    #9333ea 100%   /* Purple 600 */
  );
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  z-index: 50;
`;

const NavInner = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  @media (min-width: 640px) { padding: 0 1.5rem; }
  @media (min-width: 1024px) { padding: 0 2rem; }
`;

const NavFlex = styled.div`
  display: flex;
  justify-content: space-between;
  height: 4rem;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LogoWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const LogoText = styled.div`
  display: flex;
  align-items: center;
`;

const BrandPrimary = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
`;

const BrandSecondary = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
`;

const DesktopMenu = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    margin-left: 1.5rem;
    gap: 1rem;
    align-items: center;
    background: rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    border-radius: 1rem;
    backdrop-filter: blur(10px);
  }
`;

const StyledLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
`;

const LoginButton = styled.button`
  background-color: white;
  color: #6D28D9;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }
`;

const LoginButtonContainer = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: white;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  background-color: #6b21a8;
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuContent = styled.div`
  padding: 0.5rem;
  @media (min-width: 640px) {
    padding: 0.75rem;
  }
`;

const MobileLink = styled(Link)`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 0.5rem;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MobileLoginButton = styled(LoginButton)`
  width: 100%;
  margin-top: 1rem;
`;

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('/');

    return (
        <NavContainer>
            <NavInner>
                <NavFlex>
                    <LogoContainer>
                        <LogoWrapper>
                            <LogoText>
                                <BrandPrimary>Ride</BrandPrimary>
                                <BrandSecondary>90</BrandSecondary>
                            </LogoText>
                        </LogoWrapper>

                        <DesktopMenu>
                            <StyledLink href="/" className={activeTab === '/' ? 'active' : ''} onClick={() => setActiveTab('/')}>Home</StyledLink>
                            <StyledLink href="/service" className={activeTab === '/service' ? 'active' : ''} onClick={() => setActiveTab('/service')}>Service</StyledLink>
                            <StyledLink href="/activity" className={activeTab === '/activity' ? 'active' : ''} onClick={() => setActiveTab('/activity')}>Activity</StyledLink>
                            <StyledLink href="/account" className={activeTab === '/account' ? 'active' : ''} onClick={() => setActiveTab('/account')}>Account</StyledLink>
                            <StyledLink href="/about" className={activeTab === '/about' ? 'active' : ''} onClick={() => setActiveTab('/about')}>About Us</StyledLink>
                        </DesktopMenu>
                    </LogoContainer>

                    <LoginButtonContainer>
                        <LoginButton>Login</LoginButton>
                    </LoginButtonContainer>

                    <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <span className="sr-only">Open main menu</span>
                        {!isMenuOpen ? (
                            <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        ) : (
                            <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </MobileMenuButton>
                </NavFlex>
            </NavInner>

            <MobileMenu $isOpen={isMenuOpen}>
                <MobileMenuContent>
                    <MobileLink href="/">Home</MobileLink>
                    <MobileLink href="/service">Service</MobileLink>
                    <MobileLink href="/activity">Activity</MobileLink>
                    <MobileLink href="/account">Account</MobileLink>
                    <MobileLink href="/about">About Us</MobileLink>
                    <MobileLoginButton>Login</MobileLoginButton>
                </MobileMenuContent>
            </MobileMenu>
        </NavContainer>
    );
};

export default Navbar;