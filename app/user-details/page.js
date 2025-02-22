'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Image from 'next/image';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #6b46c1 0%, #4a148c 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const WebsiteName = styled.h1`
  color: white;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  
  span: {
    color: #9f7aea;
  }
`;

const FormContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled(Input).attrs({ as: 'textarea' })`
  min-height: 100px;
  resize: vertical;
`;

const ErrorMessage = styled(motion.p)`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  border: none;
  border-radius: 0.75rem;
  background: #9f7aea;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: 1 / -1;

  &:hover {
    background: #805ad5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(159, 122, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default function UserDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    occupation: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 10) {
        newErrors.dateOfBirth = 'You must be at least 10 years old';
      }

      // Validate that date is not in the future
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/update-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: session?.user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      router.push('/dashboard'); // Redirect to dashboard after successful update
    } catch (error) {
      console.error('Error updating user details:', error);
      setErrors({ submit: 'Failed to update user details. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to calculate max date for the date input
  const getMaxDate = () => {
    const today = new Date();
    const minAge = 10;
    const maxDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split('T')[0];
  };

  if (status === 'loading') {
    return <PageContainer>Loading...</PageContainer>;
  }

  return (
    <PageContainer>
      <WebsiteName>
        Ride<span>90</span>
      </WebsiteName>

      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Complete Your Profile</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Full Name</Label>
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Enter your full name"
            />
            {errors.fullName && <ErrorMessage>{errors.fullName}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Alternate Phone (Optional)</Label>
            <Input
              type="tel"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              error={errors.alternatePhone}
              placeholder="Enter alternate phone number"
            />
            {errors.alternatePhone && <ErrorMessage>{errors.alternatePhone}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              max={getMaxDate()}
            />
            {errors.dateOfBirth && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.dateOfBirth}
              </ErrorMessage>
            )}
          </InputGroup>

          <InputGroup style={{ gridColumn: '1 / -1' }}>
            <Label>Address</Label>
            <TextArea
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter your full address"
            />
            {errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>City</Label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="Enter your city"
            />
            {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>State</Label>
            <Input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              placeholder="Enter your state"
            />
            {errors.state && <ErrorMessage>{errors.state}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>ZIP Code</Label>
            <Input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              error={errors.zipCode}
              placeholder="Enter ZIP code"
            />
            {errors.zipCode && <ErrorMessage>{errors.zipCode}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Occupation</Label>
            <Input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              error={errors.occupation}
              placeholder="Enter your occupation"
            />
            {errors.occupation && <ErrorMessage>{errors.occupation}</ErrorMessage>}
          </InputGroup>

          {errors.submit && (
            <ErrorMessage style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              {errors.submit}
            </ErrorMessage>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Saving...' : 'Save Details'}
          </Button>
        </Form>
      </FormContainer>
    </PageContainer>
  );
} 