'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    joinDate: "",
    totalRides: 0,
    walletBalance: 0,
    transactions: [], // Initialize empty transactions array
    messages: [], // Initialize empty messages array
    preferences: {
      notifications: false,
      emailUpdates: false,
      darkMode: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [phoneUpdateError, setPhoneUpdateError] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [loginHistoryError, setLoginHistoryError] = useState(null);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(prev => ({
        ...prev,
        ...data,
        preferences: {
          ...prev.preferences,
          ...(data.preferences || {})
        },
        // Format the date
        joinDate: new Date(data.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTabColor = (section) => {
    return activeSection === section 
      ? 'bg-purple-300 hover:bg-purple-300' 
      : 'hover:bg-purple-200 bg-purple-200/50';
  };

  const getTabTextColor = (section, isActive) => {
    return isActive ? 'text-purple-900' : 'text-purple-700';
  };

  const SectionButton = ({ section, label, icon }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 ${
        activeSection === section
          ? `${getTabColor(section)} ${getTabTextColor(section, true)} transform scale-110 shadow-lg font-semibold`
          : `${getTabColor(section)} ${getTabTextColor(section, false)} hover:scale-105`
      }`}
    >
      <span className={getTabTextColor(section, activeSection === section)}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        throw new Error('Failed to add address');
      }

      const data = await response.json();
      setSavedAddresses(prev => [...prev, data]);
      setNewAddress({ label: '', streetAddress: '', city: '', state: '', pincode: '', landmark: '', instructions: '' });
      setShowAddAddressModal(false);
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowEditAddressModal(true);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAddress._id,
          ...editingAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      const updatedAddress = await response.json();
      setSavedAddresses(prev => 
        prev.map(addr => addr._id === updatedAddress._id ? updatedAddress : addr)
      );
      setShowEditAddressModal(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/address?id=${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      setSavedAddresses(prev => prev.filter(addr => addr._id !== addressId));
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/address');
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      const addresses = await response.json();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      alert('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const PasswordChangeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
          <button 
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingPhone(true);
    setPhoneUpdateError('');

    try {
      console.log('Updating phone number:', newPhoneNumber);
      const response = await fetch('/api/user/update-phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: newPhoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update phone number');
      }

      console.log('Phone number updated successfully:', data);
      
      // Update the local state with the new phone number
      setUserData(prev => ({
        ...prev,
        phoneNumber: data.phoneNumber
      }));
      
      // Show success message
      alert('Phone number updated successfully!');
      
      setShowPhoneModal(false);
      setNewPhoneNumber('');
    } catch (error) {
      console.error('Error updating phone number:', error);
      setPhoneUpdateError(error.message);
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const PhoneUpdateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Update Phone Number</h3>
          <button 
            onClick={() => {
              setShowPhoneModal(false);
              setNewPhoneNumber('');
              setPhoneUpdateError('');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handlePhoneUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              New Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter new phone number"
            />
          </div>
          {phoneUpdateError && (
            <p className="text-red-600 text-sm">{phoneUpdateError}</p>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowPhoneModal(false);
                setNewPhoneNumber('');
                setPhoneUpdateError('');
              }}
              className="flex-1 px-4 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingPhone}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
            >
              {isUpdatingPhone ? 'Updating...' : 'Update Phone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddressModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New Address</h3>
          <button 
            onClick={() => setShowAddAddressModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Home, Office, Gym"
              value={newAddress.label}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, label: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter street address"
              value={newAddress.streetAddress}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, streetAddress: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter city"
                value={newAddress.city}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter state"
                value={newAddress.state}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Landmark
              </label>
              <input
                type="text"
                placeholder="Enter landmark"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Additional Instructions
            </label>
            <textarea
              placeholder="Any specific instructions for finding the address"
              value={newAddress.instructions}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, instructions: e.target.value }))}
              rows="2"
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddAddressModal(false)}
              className="flex-1 px-4 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditAddressModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Address</h3>
          <button 
            onClick={() => {
              setShowEditAddressModal(false);
              setEditingAddress(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleUpdateAddress} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Home, Office, Gym"
              value={editingAddress?.label || ''}
              onChange={(e) => setEditingAddress((prev) => ({ ...prev, label: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter street address"
              value={editingAddress?.streetAddress || ''}
              onChange={(e) => setEditingAddress((prev) => ({ ...prev, streetAddress: e.target.value }))}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter city"
                value={editingAddress?.city || ''}
                onChange={(e) => setEditingAddress((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter state"
                value={editingAddress?.state || ''}
                onChange={(e) => setEditingAddress((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter pincode"
                value={editingAddress?.pincode || ''}
                onChange={(e) => setEditingAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                placeholder="Enter landmark"
                value={editingAddress?.landmark || ''}
                onChange={(e) => setEditingAddress((prev) => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Instructions
            </label>
            <textarea
              placeholder="Any specific instructions for finding the address"
              value={editingAddress?.instructions || ''}
              onChange={(e) => setEditingAddress((prev) => ({ ...prev, instructions: e.target.value }))}
              rows="2"
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditAddressModal(false);
                setEditingAddress(null);
              }}
              className="flex-1 px-4 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAddressSection = () => {
    if (savedAddresses.length === 0) {
      return (
        <div className="text-center py-6 bg-purple-50 rounded-xl">
          <p className="text-gray-500">No addresses saved yet</p>
        </div>
      );
    }

    return savedAddresses.map((address) => (
      <div key={address._id} className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">{address.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleEditAddress(address)}
              className="text-purple-600 hover:text-purple-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={() => handleDeleteAddress(address._id)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <p>{address.streetAddress}</p>
          <p>{address.city}, {address.state} - {address.pincode}</p>
          {address.landmark && <p>Landmark: {address.landmark}</p>}
          {address.instructions && (
            <p className="text-gray-500 italic mt-2">{address.instructions}</p>
          )}
        </div>
      </div>
    ));
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            {showAddAddressModal && <AddressModal />}
            {showEditAddressModal && <EditAddressModal />}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img
                  src={userData.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-purple-100 transition-all duration-300 group-hover:opacity-75"
                />
                <button
                  onClick={triggerFileInput}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-gray-500">Member since {userData.joinDate}</p>
                <p className="text-purple-600 font-medium">{userData.totalRides} rides taken</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Email</p>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-purple-600 font-medium">Phone</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900">{userData.phoneNumber || 'Not set'}</p>
                        <button
                          onClick={() => {
                            setNewPhoneNumber(userData.phoneNumber || '');
                            setShowPhoneModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {renderAddressSection()}
              </div>
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-purple-200">Available Balance</p>
                  <h2 className="text-3xl font-bold">₹{userData.walletBalance || 0}</h2>
                </div>
                <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-300 font-medium shadow-sm hover:shadow flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Money
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white bg-opacity-10 rounded-xl p-4">
                  <p className="text-purple-200 text-sm">This Month</p>
                  <p className="text-xl font-semibold mt-1">₹0</p>
                  <p className="text-purple-200 text-sm mt-1">Total Spent</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-4">
                  <p className="text-purple-200 text-sm">Cashback Earned</p>
                  <p className="text-xl font-semibold mt-1">₹0</p>
                  <p className="text-purple-200 text-sm mt-1">This Month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {userData.transactions && userData.transactions.length > 0 ? (
                  userData.transactions.map(transaction => (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'credit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No transactions yet
                  </div>
                )}
              </div>
              {userData.transactions && userData.transactions.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <button className="w-full px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 font-medium">
                    View All Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              {userData.messages && userData.messages.some(m => m.unread) && (
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                  Mark All as Read
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {userData.messages && userData.messages.length > 0 ? (
                userData.messages.map(message => (
                  <div key={message.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${message.unread ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{message.sender}</p>
                            {message.unread && (
                              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{message.message}</p>
                          <p className="text-sm text-gray-500 mt-1">{message.time}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No messages yet
                </div>
              )}
            </div>
          </div>
        );
      case 'manageAccount':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Uber Account</h2>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {userData.accountDetails.membershipLevel} Member
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Status</h3>
                  <p className="text-gray-600">Member since {userData.accountDetails.joinDate}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-purple-600 font-medium">{userData.accountDetails.totalTrips} Total Trips</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-purple-600 font-medium">{userData.accountDetails.rating} Rating</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
                  <div className="space-y-3">
                    {userData.accountDetails.paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {method.type === "Credit Card" ? (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                          <div>
                            <p className="text-gray-900">{method.type}</p>
                            <p className="text-sm text-gray-500">
                              {method.type === "Credit Card" ? `****${method.last4}` : method.id}
                            </p>
                          </div>
                        </div>
                        {method.default && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm">Default</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-medium shadow-sm hover:shadow flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Payment Method
                  </button>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Account Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Account
                    </button>
                    <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Account History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'sendGift':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send a Gift</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Special Offers Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gift Cards</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Digital Gift Card</h4>
                          <p className="text-sm text-gray-500">Send instantly via email</p>
                        </div>
                      </div>
                      <button className="text-purple-600 hover:text-purple-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 2000].map((amount) => (
                          <button
                            key={amount}
                            className="px-4 py-2 border border-purple-200 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200"
                          >
                            ₹{amount}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        placeholder="Enter custom amount"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gift Options</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Recipient Details</h4>
                        <p className="text-sm text-gray-500">Enter gift recipient information</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Recipient's email"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <textarea
                        placeholder="Add a personal message"
                        rows="3"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-medium shadow-sm hover:shadow flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                Send Gift
              </button>
            </div>
          </div>
        );
      case 'business':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Business Account</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Premium Features
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="GST Number"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Business Address"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Features</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">Monthly Invoicing</p>
                            <p className="text-sm text-gray-500">Get consolidated monthly invoices</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">Team Management</p>
                            <p className="text-sm text-gray-500">Add and manage team members</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View All Plans
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Basic', 'Professional', 'Enterprise'].map((plan) => (
                  <div key={plan} className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{plan}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {plan === 'Basic' && 'Perfect for small businesses'}
                      {plan === 'Professional' && 'Ideal for growing companies'}
                      {plan === 'Enterprise' && 'Custom solutions for large organizations'}
                    </p>
                    <button className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium border border-purple-200">
                      Learn More
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive ride updates and alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={userData.preferences.notifications} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Updates</p>
                      <p className="text-sm text-gray-500">Receive ride receipts and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={userData.preferences.emailUpdates} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">App Settings</h3>
                <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Dark Mode</p>
                      <p className="text-sm text-gray-500">Switch to dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={userData.preferences.darkMode} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Language</p>
                    <select className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Last Updated: {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Password & Authentication</h3>
                    <p className="text-gray-600">Manage your password and account security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-600">Change your account password</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Login History</h4>
                        <p className="text-sm text-gray-600">View your recent login activity</p>
                      </div>
                      <button 
                        onClick={() => setShowLoginHistoryModal(true)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
                      >
                        View History
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    {isLoadingHistory ? (
                      <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-700"></div>
                      </div>
                    ) : loginHistory.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {loginHistory.slice(0, 3).map((entry, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm text-gray-600">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">{entry.deviceInfo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      For enhanced security, we recommend enabling two-factor authentication and using a strong, unique password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {showPasswordModal && <PasswordChangeModal />}
            {showLoginHistoryModal && <LoginHistoryModal />}
          </div>
        );
      case 'legal':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Legal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Terms of Service</h3>
                <p className="text-gray-600">Read our terms of service carefully before using our services.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                <p className="text-gray-600">Learn about how we handle your personal information and data.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  const fetchLoginHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setLoginHistoryError(null);
      const response = await fetch('/api/user/login-history');
      if (!response.ok) {
        throw new Error('Failed to fetch login history');
      }
      const data = await response.json();
      setLoginHistory(data);
    } catch (error) {
      console.error('Error fetching login history:', error);
      setLoginHistoryError('Failed to load login history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'security') {
      fetchLoginHistory();
    }
  }, [activeSection]);

  const LoginHistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Login History</h3>
          <button 
            onClick={() => setShowLoginHistoryModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : loginHistoryError ? (
          <div className="text-center py-8">
            <p className="text-red-600">{loginHistoryError}</p>
            <button
              onClick={fetchLoginHistory}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loginHistory.map((entry, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      entry.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {entry.status === 'success' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.status === 'success' ? 'Successful Login' : 'Failed Attempt'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{entry.deviceInfo}</p>
                    <p>{entry.ipAddress}</p>
                    {entry.location && <p>{entry.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-700 to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <h1 className="text-2xl font-bold text-white">
                RIDE<span className="text-purple-200">-</span><span className="text-purple-100">90</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/activity')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 text-white hover:bg-purple-600"
              >
                Activity
              </button>
              <button
                onClick={() => router.push('/account')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  true ? 'bg-white text-purple-700' : 'text-white hover:bg-purple-600'
                }`}
              >
                Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="space-y-2">
                <SectionButton
                  section="profile"
                  label="Profile"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <SectionButton
                  section="wallet"
                  label="Wallet"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <SectionButton
                  section="messages"
                  label="Messages"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                  }
                />
                <SectionButton
                  section="manageAccount"
                  label="Manage Uber Account"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <SectionButton
                  section="sendGift"
                  label="Send a Gift"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  }
                />
                <SectionButton
                  section="business"
                  label="Business Account"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <SectionButton
                  section="preferences"
                  label="Preferences"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                <SectionButton
                  section="security"
                  label="Security"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
                <SectionButton
                  section="legal"
                  label="Legal"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
              </div>
            </div>
            <div className="md:col-span-3">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 