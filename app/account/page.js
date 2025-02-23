'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { data: session, status } = useSession();
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
    phone: "",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    joinDate: "",
    totalRides: 0,
    walletBalance: 0,
    transactions: [],
    messages: [],
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
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      rideUpdates: true,
      promotionalEmails: false,
    },
    appearance: {
      theme: 'light',
      language: 'en'
    },
    privacy: {
      shareLocation: true,
      shareRideHistory: true,
      allowDataCollection: true,
    }
  });

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/user/profile');
      if (response.data) {
      setUserData(prev => ({
        ...prev,
          ...response.data,
        // Format the date
          joinDate: new Date(response.data.joinDate).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })
      }));
        setSavedAddresses(response.data.savedAddresses || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.response?.data?.error || 'Failed to fetch user data');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await axios.post('/api/user/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setUserData(prev => ({
            ...prev,
            profileImage: response.data.imageUrl
          }));
          toast.success('Profile image updated successfully');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to update profile image');
      }
    }
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      const response = await axios.post('/api/user/addresses', addressData);
      if (response.data.success) {
        setSavedAddresses(prev => [...prev, response.data.address]);
      setShowAddAddressModal(false);
        toast.success('Address added successfully');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const handleEditAddress = async (addressId, addressData) => {
    try {
      const response = await axios.put(`/api/user/addresses/${addressId}`, addressData);
      if (response.data.success) {
      setSavedAddresses(prev => 
          prev.map(addr => addr.id === addressId ? response.data.address : addr)
      );
      setShowEditAddressModal(false);
        toast.success('Address updated successfully');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(`/api/user/addresses/${addressId}`);
      if (response.data.success) {
        setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
        toast.success('Address deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      const response = await axios.put('/api/user/preferences', {
        [key]: value
      });
      
      if (response.data.success) {
      setUserData(prev => ({
        ...prev,
          preferences: {
            ...prev.preferences,
            [key]: value
          }
        }));
        toast.success('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  if (loading) {
      return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      );
    }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error loading profile</p>
          <p>{error}</p>
            <button
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
            </button>
          </div>
      </div>
    );
  }

        return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-300">
                <img
                  src={userData.profileImage}
                  alt="Profile"
                    className="w-full h-full object-cover"
                />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-purple-600 hover:text-purple-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-purple-200">{userData.email}</p>
                <p className="text-purple-200 text-sm mt-1">Member since {userData.joinDate}</p>
              </div>
            </div>
                    </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
                        <button
                onClick={() => setActiveSection('profile')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeSection === 'profile'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
                        </button>
              <button
                onClick={() => setActiveSection('addresses')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeSection === 'addresses'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Addresses
                </button>
                          <button
                onClick={() => setActiveSection('preferences')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeSection === 'preferences'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Preferences
                          </button>
            </nav>
              </div>

          {/* Content Sections */}
          <div className="p-6">
            {activeSection === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Account Overview</h3>
                <div className="space-y-4">
                          <div>
                        <label className="text-sm text-purple-700">Total Rides</label>
                        <p className="text-2xl font-bold text-purple-900">{userData.totalRides}</p>
                          </div>
                          <div>
                        <label className="text-sm text-purple-700">Wallet Balance</label>
                        <p className="text-2xl font-bold text-purple-900">₹{userData.walletBalance}</p>
                </div>
              </div>
            </div>

                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                    <div>
                        <label className="text-sm text-purple-700">Phone Number</label>
                        <p className="text-gray-900">{userData.phone || 'Not added'}</p>
                    </div>
                    <div>
                        <label className="text-sm text-purple-700">Email</label>
                        <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                </div>
              </div>

                {userData.transactions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Recent Transactions</h3>
                    <div className="bg-white rounded-lg border border-gray-200">
                      {userData.transactions.map((transaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border-b last:border-b-0"
                        >
                      <div>
                            <p className="font-medium text-gray-900">{transaction.type}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                      </div>
                          <div className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : '-'}₹{Math.abs(transaction.amount)}
                    </div>
                          </div>
                        ))}
                    </div>
                      </div>
                    )}
                  </div>
            )}

            {activeSection === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-purple-900">Saved Addresses</h3>
              <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                    Add New Address
              </button>
                </div>
            
              <div className="space-y-4">
                  {savedAddresses.map((address, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center"
                    >
                  <div>
                        <p className="font-medium text-gray-900">{address.label}</p>
                        <p className="text-gray-600">{address.address}</p>
                  </div>
                      <div className="flex space-x-2">
          <button 
                          onClick={() => {
                            setEditingAddress(address);
                            setShowEditAddressModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          Edit
          </button>
            <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
                          Delete
            </button>
                </div>
              </div>
            ))}
          </div>
      </div>
            )}
            
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                {/* Preferences content */}
          </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      {showAddAddressModal && <AddressModal />}
      {showEditAddressModal && <EditAddressModal />}
      {showPasswordModal && <PasswordChangeModal />}
      {showPhoneModal && <PhoneUpdateModal />}
      {showLoginHistoryModal && <LoginHistoryModal />}
    </div>
  );
} 