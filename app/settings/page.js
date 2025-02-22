'use client';

import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  padding: 6rem 1rem 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #4c1d95;
  margin-bottom: 2rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #4c1d95;
  margin-bottom: 1.5rem;
`;

const SettingItem = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #4c1d95;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9d5ff;
  border-radius: 0.5rem;
  background-color: white;
  color: #4c1d95;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #8b5cf6;
  }

  &:checked + span:before {
    transform: translateX(1.5rem);
  }
`;

const ToggleSlider = styled.span`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: #e9d5ff;
  border-radius: 1.5rem;
  transition: all 0.3s;
  margin-right: 0.75rem;

  &:before {
    content: '';
    position: absolute;
    height: 1.25rem;
    width: 1.25rem;
    left: 0.125rem;
    bottom: 0.125rem;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      rideUpdates: true,
      promotionalEmails: false,
    },
    appearance: {
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
    },
    privacy: {
      shareLocation: true,
      shareRideHistory: true,
      allowDataCollection: true,
    },
    accessibility: {
      screenReader: false,
      highContrast: false,
      reducedMotion: false,
    }
  });

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSelect = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to save the settings
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <Title>Settings</Title>
        <SettingsGrid>
          <Section>
            <SectionTitle>Notifications</SectionTitle>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={() => handleToggle('notifications', 'pushNotifications')}
                />
                <ToggleSlider />
                <Label>Push Notifications</Label>
              </Toggle>
            </SettingItem>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={() => handleToggle('notifications', 'emailNotifications')}
                />
                <ToggleSlider />
                <Label>Email Notifications</Label>
              </Toggle>
            </SettingItem>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.notifications.rideUpdates}
                  onChange={() => handleToggle('notifications', 'rideUpdates')}
                />
                <ToggleSlider />
                <Label>Ride Updates</Label>
              </Toggle>
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle>Appearance</SectionTitle>
            <SettingItem>
              <Label>Theme</Label>
              <Select
                value={settings.appearance.theme}
                onChange={(e) => handleSelect('appearance', 'theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
            </SettingItem>
            <SettingItem>
              <Label>Language</Label>
              <Select
                value={settings.appearance.language}
                onChange={(e) => handleSelect('appearance', 'language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </Select>
            </SettingItem>
            <SettingItem>
              <Label>Font Size</Label>
              <Select
                value={settings.appearance.fontSize}
                onChange={(e) => handleSelect('appearance', 'fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle>Privacy</SectionTitle>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.privacy.shareLocation}
                  onChange={() => handleToggle('privacy', 'shareLocation')}
                />
                <ToggleSlider />
                <Label>Share Location</Label>
              </Toggle>
            </SettingItem>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.privacy.shareRideHistory}
                  onChange={() => handleToggle('privacy', 'shareRideHistory')}
                />
                <ToggleSlider />
                <Label>Share Ride History</Label>
              </Toggle>
            </SettingItem>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.privacy.allowDataCollection}
                  onChange={() => handleToggle('privacy', 'allowDataCollection')}
                />
                <ToggleSlider />
                <Label>Allow Data Collection</Label>
              </Toggle>
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle>Accessibility</SectionTitle>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.accessibility.screenReader}
                  onChange={() => handleToggle('accessibility', 'screenReader')}
                />
                <ToggleSlider />
                <Label>Screen Reader</Label>
              </Toggle>
            </SettingItem>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.accessibility.highContrast}
                  onChange={() => handleToggle('accessibility', 'highContrast')}
                />
                <ToggleSlider />
                <Label>High Contrast</Label>
              </Toggle>
            </SettingItem>
            <SettingItem>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.accessibility.reducedMotion}
                  onChange={() => handleToggle('accessibility', 'reducedMotion')}
                />
                <ToggleSlider />
                <Label>Reduced Motion</Label>
              </Toggle>
            </SettingItem>
          </Section>
        </SettingsGrid>

        <div style={{ maxWidth: '300px', margin: '2rem auto' }}>
          <SaveButton onClick={handleSave}>Save Settings</SaveButton>
        </div>
      </ContentWrapper>
    </Container>
  );
} 