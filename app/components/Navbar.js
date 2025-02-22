'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const NavContainer = styled.nav`
  background-color: white;
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
  color: #6D28D9;
`;

const BrandSecondary = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #312E81;
`;

const DesktopMenu = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    margin-left: 1.5rem;
    gap: 2rem;
  }
`;

const StyledLink = styled(Link)`
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #6D28D9;
  }
`;

const LoginButton = styled.button`
  background-color: #6D28D9;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  transition: background-color 0.3s;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #5B21B6;
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
  color: #374151;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    color: #6D28D9;
    background-color: #F5F3FF;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  display: ${props => props.$isOpen ? 'block' : 'none'};
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
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 0.5rem;

  &:hover {
    color: #6D28D9;
  }
`;

const MobileLoginButton = styled(LoginButton)`
  width: 100%;
  margin-top: 1rem;
`;

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                            <StyledLink href="/">Home</StyledLink>
                            <StyledLink href="/service">Service</StyledLink>
                            <StyledLink href="/activity">Activity</StyledLink>
                            <StyledLink href="/account">Account</StyledLink>
                            <StyledLink href="/about">About Us</StyledLink>
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