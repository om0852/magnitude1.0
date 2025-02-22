'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaUser, FaCar, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #9f7aea, #6b46c1);
  padding: 2rem;
  color: white;
  text-align: center;

  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    opacity: 0.9;
  }
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const RoleOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RoleCard = styled.div`
  border: 2px solid ${props => props.selected ? '#9f7aea' : '#e2e8f0'};
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? 'rgba(159, 122, 234, 0.1)' : 'white'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 2rem;
    color: ${props => props.selected ? '#9f7aea' : '#718096'};
    margin-bottom: 1rem;
  }

  h3 {
    color: ${props => props.selected ? '#9f7aea' : '#2d3748'};
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    font-size: 0.875rem;
  }
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #9f7aea, #6b46c1);
  color: white;
  border: none;
  width: 100%;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Form = styled.form`
  margin-top: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

  &::placeholder {
    color: #a0aec0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #000000;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

export default function UserDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    occupation: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session.user.name || '',
        email: session.user.email || ''
      }));
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select a role first');
      setError('Please select a role first');
      return;
    }

    setLoading(true);
    setError('');
    const loadingToast = toast.loading('Updating your profile...');

    try {
      // First update the role
      const roleResponse = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!roleResponse.ok) {
        const roleData = await roleResponse.json();
        throw new Error(roleData.error || 'Failed to update role');
      }

      // Then update user details
      const detailsResponse = await fetch('/api/user/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        throw new Error(detailsData.error || 'Failed to update details');
      }

      toast.success('Profile updated successfully!', {
        id: loadingToast,
        duration: 3000,
      });

      // Redirect based on role after a short delay
      setTimeout(() => {
        router.push(selectedRole === 'driver' ? '/driver/profile' : '/user/profile');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Something went wrong', {
        id: loadingToast,
        duration: 4000,
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <PageContainer>Loading...</PageContainer>;
  }

  return (
    <PageContainer>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          success: {
            style: {
              background: '#10B981',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
          },
          loading: {
            style: {
              background: '#6B7280',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
          },
        }}
      />
      <Card>
        <CardHeader>
          <h1>Welcome to Magnitude</h1>
          <p>Please complete your profile</p>
        </CardHeader>

        <CardBody>
          <RoleOptions>
            <RoleCard
              selected={selectedRole === 'user'}
              onClick={() => setSelectedRole('user')}
            >
              <FaUser />
              <h3>Passenger</h3>
              <p>Book rides and travel with comfort</p>
            </RoleCard>

            <RoleCard
              selected={selectedRole === 'driver'}
              onClick={() => setSelectedRole('driver')}
            >
              <FaCar />
              <h3>Driver</h3>
              <p>Earn money by driving with us</p>
            </RoleCard>
          </RoleOptions>

          {error && <ErrorMessage>{error}</ErrorMessage>}

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
                    disabled
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
                <label>Alternate Phone</label>
                <div className="input-container">
                  <FaPhone size={16} />
                  <Input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    placeholder="Enter alternate phone number"
                  />
                </div>
              </FormGroup>

              <FormGroup>
                <label>Date of Birth</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Gender</label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </Select>
              </FormGroup>

              <FormGroup style={{ gridColumn: '1 / -1' }}>
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
                <label>City</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>State</label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter your state"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Pincode</label>
                <Input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Occupation</label>
                <Input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Enter your occupation"
                />
              </FormGroup>
            </FormGrid>

            <ContinueButton type="submit" disabled={loading || !selectedRole}>
              {loading ? 'Please wait...' : 'Save & Continue'}
            </ContinueButton>
          </Form>
        </CardBody>
      </Card>
    </PageContainer>
  );
} 