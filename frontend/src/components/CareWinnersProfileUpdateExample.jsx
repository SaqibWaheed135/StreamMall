/**
 * Example component demonstrating how to update CareWinners profile
 * including questionnaire answers in the PATCH request
 * 
 * This serves as a reference for implementing the same logic in the mobile app
 */

import React, { useState, useEffect } from 'react';
import { updateProfileWithQuestionnaire, formatQuestionnaireAnswers } from '../utils/profileUpdateHelper';

const CareWinnersProfileUpdateExample = () => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country: '',
    city: '',
    state: '',
    address: '',
    bio: '',
  });
  const [questionnaireData, setQuestionnaireData] = useState({});
  const [errors, setErrors] = useState({});

  const API_BASE_URL = 'https://server.carewinners.com/api/v1';
  const token = localStorage.getItem('token'); // Adjust based on your token storage

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/me/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data.data);
          
          // Populate form with existing data
          if (data.data) {
            setFormData({
              first_name: data.data.first_name || '',
              last_name: data.data.last_name || '',
              email: data.data.email || '',
              phone_number: data.data.phone_number || '',
              country: data.data.country || '',
              city: data.data.city || '',
              state: data.data.state || '',
              address: data.data.address || '',
              bio: data.data.profile?.bio || '',
            });

            // Initialize questionnaire data from existing answers
            if (data.data.profile?.profile_services) {
              const initialQuestionnaire = {};
              data.data.profile.profile_services.forEach(service => {
                if (service.answers && service.answers.length > 0) {
                  initialQuestionnaire[service.id] = service.answers.map(answer => ({
                    question_id: answer.question_id,
                    answer: answer.answer,
                    answer_parsed: answer.answer_parsed,
                    id: answer.id,
                  }));
                }
              });
              setQuestionnaireData(initialQuestionnaire);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors({ general: 'Failed to load profile data' });
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle questionnaire answer changes
  const handleAnswerChange = (serviceId, questionId, value, questionType) => {
    setQuestionnaireData(prev => {
      const serviceAnswers = prev[serviceId] || [];
      const existingAnswerIndex = serviceAnswers.findIndex(a => a.question_id === questionId);
      
      let formattedValue;
      if (questionType === 'multiselect' && Array.isArray(value)) {
        formattedValue = JSON.stringify(value);
      } else if (typeof value === 'string') {
        formattedValue = value;
      } else {
        formattedValue = JSON.stringify(value);
      }

      const updatedAnswer = {
        question_id: questionId,
        answer: formattedValue,
        answer_parsed: Array.isArray(value) ? value : [value],
      };

      // If answer already exists, update it; otherwise add it
      if (existingAnswerIndex >= 0) {
        const updated = [...serviceAnswers];
        updated[existingAnswerIndex] = {
          ...updated[existingAnswerIndex],
          ...updatedAnswer
        };
        return {
          ...prev,
          [serviceId]: updated
        };
      } else {
        return {
          ...prev,
          [serviceId]: [...serviceAnswers, updatedAnswer]
        };
      }
    });
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Use the helper function to create the update payload
      const response = await updateProfileWithQuestionnaire(
        `${API_BASE_URL}/profile/me/`,
        token,
        profileData,
        formData,
        questionnaireData
      );

      const data = await response.json();

      if (response.ok) {
        console.log('Profile updated successfully:', data);
        setProfileData(data.data);
        alert('Profile updated successfully!');
      } else {
        console.error('Update failed:', data);
        setErrors({ general: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Manual PATCH request (if you prefer not to use the helper)
  const handleUpdateProfileManual = async () => {
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        country: formData.country,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        profile: {
          ...profileData.profile,
          bio: formData.bio,
          profile_services: profileData.profile.profile_services.map(service => ({
            id: service.id,
            service: service.service,
            hourly_rate: service.hourly_rate,
            experience_years: service.experience_years,
            is_available: service.is_available,
            notes: service.notes,
            // CRITICAL: Include answers in the update
            answers: questionnaireData[service.id] 
              ? formatQuestionnaireAnswers(questionnaireData[service.id])
              : service.answers.map(answer => ({
                  question_id: answer.question_id,
                  answer: answer.answer,
                  id: answer.id,
                }))
          }))
        }
      };

      console.log('Update payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/profile/me/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Profile updated successfully:', data);
        setProfileData(data.data);
        alert('Profile updated successfully!');
      } else {
        console.error('Update failed:', data);
        setErrors({ general: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>

      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}

      {/* Basic Profile Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
      </div>

      {/* Questionnaire Answers */}
      {profileData.profile?.profile_services?.map(service => (
        <div key={service.id} className="mb-6 border p-4 rounded">
          <h3 className="font-semibold mb-3">{service.service_name}</h3>
          {service.answers?.map(answer => (
            <div key={answer.id} className="mb-3">
              <label className="block text-sm font-medium mb-1">
                {answer.question_text}
              </label>
              <input
                type="text"
                value={
                  Array.isArray(answer.answer_parsed)
                    ? answer.answer_parsed.join(', ')
                    : answer.answer_parsed || answer.answer || ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  // For multiselect, you might want to split by comma
                  const parsedValue = answer.question_type === 'multiselect'
                    ? value.split(',').map(v => v.trim()).filter(v => v)
                    : value;
                  handleAnswerChange(service.id, answer.question_id, parsedValue, answer.question_type);
                }}
                className="w-full p-2 border rounded"
                placeholder={answer.question_type === 'multiselect' ? 'Comma-separated values' : 'Enter answer'}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Update Button */}
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>

      <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <p className="font-semibold mb-2">Important Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Always include questionnaire answers in the PATCH request</li>
          <li>Answers must be included in the profile_services array</li>
          <li>Each answer should have question_id and answer fields</li>
          <li>For multiselect questions, answer should be a JSON stringified array</li>
          <li>Include answer IDs if they exist (for updates, not creates)</li>
        </ul>
      </div>
    </div>
  );
};

export default CareWinnersProfileUpdateExample;

