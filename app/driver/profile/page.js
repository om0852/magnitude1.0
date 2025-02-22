'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaUser, FaIdCard, FaWallet, FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  padding: 2rem;
`;

const ProfileCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #9f7aea, #6b46c1);
  padding: 2rem;
  color: white;
  text-align: center;

  .avatar-container {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    opacity: 0.9;
  }
`;

const Form = styled.form`
  padding: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4a5568;
    font-weight: 500;
  }

  .input-container {
    position: relative;
    
    svg {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9f7aea;
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #000000;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #9f7aea, #6b46c1);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ImageUploadContainer = styled.div`
  position: relative;
  cursor: pointer;
  
  input[type="file"] {
    display: none;
  }

  .upload-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 0.8rem;
    padding: 0.25rem;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    text-align: center;
  }
`;

export default function DriverProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    drivingLicense: '',
    vehicleNumber: '',
    vehicleModel: '',
    walletAddress: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    profileImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Fetch driver profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/driver/profile');
      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          ...data.data,
          email: session?.user?.email || data.data.email
        }));
        if (data.data.profileImage) {
          setImagePreview(data.data.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous errors when user starts typing
    setError('');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement image upload to cloud storage
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/driver/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Show success message or redirect
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <PageContainer>Loading...</PageContainer>;
  }

  return (
    <PageContainer>
      <ProfileCard>
        {error && (
          <div style={{ 
            padding: '1rem', 
            margin: '1rem', 
            background: '#FEE2E2', 
            color: '#DC2626',
            borderRadius: '0.5rem',
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}
        
        <ProfileHeader>
          <ImageUploadContainer>
            <label htmlFor="profile-image">
              <div className="avatar-container">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%',
                      objectFit: 'cover' 
                    }} 
                  />
                ) : (
                  <FaUser size={48} color="#6b46c1" />
                )}
                <div className="upload-overlay">
                  Change Photo
                </div>
              </div>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </ImageUploadContainer>
          <h1>{formData.fullName || 'Driver Name'}</h1>
          <p>Driver Profile</p>
        </ProfileHeader>

        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <label>Full Name</label>
              <div className="input-container">
                <FaUser size={16} />
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Email</label>
              <div className="input-container">
                <FaEnvelope size={16} />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Phone Number</label>
              <div className="input-container">
                <FaPhone size={16} />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Driving License Number</label>
              <div className="input-container">
                <FaIdCard size={16} />
                <Input
                  type="text"
                  name="drivingLicense"
                  value={formData.drivingLicense}
                  onChange={handleChange}
                  placeholder="Enter driving license number"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Vehicle Number</label>
              <div className="input-container">
                <FaCar size={16} />
                <Input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="Enter vehicle number"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Vehicle Model</label>
              <div className="input-container">
                <FaCar size={16} />
                <Input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="Enter vehicle model"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Wallet Address</label>
              <div className="input-container">
                <FaWallet size={16} />
                <Input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  placeholder="Enter wallet address"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Address</label>
              <div className="input-container">
                <FaMapMarkerAlt size={16} />
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Emergency Contact</label>
              <div className="input-container">
                <FaPhone size={16} />
                <Input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Enter emergency contact number"
                  required
                />
              </div>
            </FormGroup>
          </FormGrid>

          <SaveButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </SaveButton>
        </Form>
      </ProfileCard>
    </PageContainer>
  );
} 