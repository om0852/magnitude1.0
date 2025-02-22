'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
    gap: 2rem;
    align-items: center;
  }
`;

const StyledLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${props => props.$isActive ? '80%' : '0'};
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  ${props => props.$isActive && `
    color: white;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  `}

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);

    &::after {
      width: 80%;
    }
  }
`;

const LoginButton = styled.button`
  background-color: ${props => props.$isLoggedIn ? 'rgba(255, 255, 255, 0.9)' : 'white'};
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

const UserInfo = styled.div`
  color: white;
  margin-right: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

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
                            <StyledLink href="/" $isActive={pathname === "/"}>Home</StyledLink>
                            <StyledLink href="/service" $isActive={pathname === "/service"}>Service</StyledLink>
                            <StyledLink href="/activity" $isActive={pathname === "/activity"}>Activity</StyledLink>
                            <StyledLink href="/account" $isActive={pathname === "/account"}>Account</StyledLink>
                            <StyledLink href="/about" $isActive={pathname === "/about"}>About Us</StyledLink>
                        </DesktopMenu>
                    </LogoContainer>

                    <LoginButtonContainer>
                        {status === 'authenticated' ? (
                            <>
                                <UserInfo>{session.user.name}</UserInfo>
                                <LoginButton $isLoggedIn onClick={handleLogout}>
                                    Logout
                                </LoginButton>
                            </>
                        ) : (
                            <LoginButton onClick={handleLogin}>
                                Login
                            </LoginButton>
                        )}
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
                    <MobileLink href="/settings">Settings</MobileLink>
                    <MobileLink href="/contact">Contact</MobileLink>
                    <MobileLink href="/about">About Us</MobileLink>
                    {status === 'authenticated' ? (
                        <>
                            <div style={{ color: 'white', padding: '0.5rem 0.75rem' }}>
                                {session.user.name}
                            </div>
                            <MobileLoginButton onClick={handleLogout}>
                                Logout
                            </MobileLoginButton>
                        </>
                    ) : (
                        <MobileLoginButton onClick={handleLogin}>
                            Login
                        </MobileLoginButton>
                    )}
                </MobileMenuContent>
            </MobileMenu>
        </NavContainer>
    );
};

export default Navbar;