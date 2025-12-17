/**
 * Helper function to format profile data for PATCH request to CareWinners API
 * This ensures questionnaire answers are properly included in the update request
 */

/**
 * Formats profile data including questionnaire answers for PATCH request
 * @param {Object} profileData - The current profile data from API
 * @param {Object} updatedFields - Fields that were updated (e.g., first_name, last_name, etc.)
 * @param {Array} updatedAnswers - Updated questionnaire answers (optional)
 * @returns {Object} Formatted data ready for PATCH request
 */
export const formatProfileUpdateData = (profileData, updatedFields = {}, updatedAnswers = null) => {
  const updatePayload = {
    ...updatedFields
  };

  // Include profile data if it exists
  if (profileData?.profile) {
    updatePayload.profile = {
      ...profileData.profile
    };

    // If profile_services exist, include them with answers
    if (profileData.profile.profile_services && profileData.profile.profile_services.length > 0) {
      updatePayload.profile.profile_services = profileData.profile.profile_services.map(service => {
        const serviceUpdate = {
          id: service.id,
          service: service.service,
          // Include other service fields that might need updating
          hourly_rate: service.hourly_rate,
          experience_years: service.experience_years,
          is_available: service.is_available,
          notes: service.notes
        };

        // If updatedAnswers is provided, use it; otherwise keep existing answers
        if (updatedAnswers && updatedAnswers.length > 0) {
          // Map updated answers to the service's answers
          serviceUpdate.answers = updatedAnswers.map(answer => ({
            question_id: answer.question_id,
            answer: typeof answer.answer === 'string' 
              ? answer.answer 
              : JSON.stringify(answer.answer), // Ensure answer is stringified if it's an array/object
            // Include answer ID if it exists (for updates)
            ...(answer.id && { id: answer.id })
          }));
        } else if (service.answers && service.answers.length > 0) {
          // Keep existing answers if no updates provided
          serviceUpdate.answers = service.answers.map(answer => ({
            question_id: answer.question_id,
            answer: answer.answer,
            ...(answer.id && { id: answer.id })
          }));
        }

        return serviceUpdate;
      });
    }
  }

  return updatePayload;
};

/**
 * Formats questionnaire answers for a specific service
 * @param {Array} answers - Array of answer objects
 * @returns {Array} Formatted answers array
 */
export const formatQuestionnaireAnswers = (answers) => {
  if (!answers || !Array.isArray(answers)) {
    return [];
  }

  return answers.map(answer => {
    const formattedAnswer = {
      question_id: answer.question_id
    };

    // Handle different answer types
    if (answer.answer_parsed) {
      // If answer_parsed exists, use it and stringify if needed
      if (Array.isArray(answer.answer_parsed)) {
        formattedAnswer.answer = JSON.stringify(answer.answer_parsed);
      } else {
        formattedAnswer.answer = String(answer.answer_parsed);
      }
    } else if (answer.answer) {
      // If answer exists, ensure it's properly formatted
      if (typeof answer.answer === 'string') {
        formattedAnswer.answer = answer.answer;
      } else {
        formattedAnswer.answer = JSON.stringify(answer.answer);
      }
    }

    // Include answer ID if it exists (for updates)
    if (answer.id) {
      formattedAnswer.id = answer.id;
    }

    return formattedAnswer;
  });
};

/**
 * Creates a complete profile update payload with questionnaire data
 * @param {Object} currentProfile - Current profile data from API response
 * @param {Object} formData - Updated form fields
 * @param {Object} questionnaireData - Updated questionnaire data (optional)
 * @returns {Object} Complete payload for PATCH request
 */
export const createProfileUpdatePayload = (currentProfile, formData, questionnaireData = null) => {
  const payload = {
    // Basic user fields
    first_name: formData.first_name || currentProfile?.first_name,
    middle_name: formData.middle_name !== undefined ? formData.middle_name : currentProfile?.middle_name,
    last_name: formData.last_name || currentProfile?.last_name,
    email: formData.email || currentProfile?.email,
    phone_number: formData.phone_number || currentProfile?.phone_number,
    country: formData.country || currentProfile?.country,
    city: formData.city || currentProfile?.city,
    state: formData.state || currentProfile?.state,
    address: formData.address || currentProfile?.address,
  };

  // Include profile data with questionnaire answers
  if (currentProfile?.profile) {
    payload.profile = {
      role: currentProfile.profile.role,
      age: formData.age !== undefined ? formData.age : currentProfile.profile.age,
      gender: formData.gender || currentProfile.profile.gender,
      zip_code: formData.zip_code || currentProfile.profile.zip_code,
      country: formData.country || currentProfile.profile.country,
      city: formData.city || currentProfile.profile.city,
      state: formData.state || currentProfile.profile.state,
      address: formData.address || currentProfile.profile.address,
      bio: formData.bio !== undefined ? formData.bio : currentProfile.profile.bio,
      is_active: formData.is_active !== undefined ? formData.is_active : currentProfile.profile.is_active,
    };

    // Handle profile_services with answers
    if (currentProfile.profile.profile_services && currentProfile.profile.profile_services.length > 0) {
      payload.profile.profile_services = currentProfile.profile.profile_services.map(service => {
        const servicePayload = {
          id: service.id,
          service: service.service,
          hourly_rate: formData.hourly_rate !== undefined ? formData.hourly_rate : service.hourly_rate,
          experience_years: formData.experience_years !== undefined ? formData.experience_years : service.experience_years,
          is_available: formData.is_available !== undefined ? formData.is_available : service.is_available,
          notes: formData.notes !== undefined ? formData.notes : service.notes,
        };

        // Handle questionnaire answers
        if (questionnaireData && questionnaireData[service.id]) {
          // Use updated questionnaire data for this service
          servicePayload.answers = formatQuestionnaireAnswers(questionnaireData[service.id]);
        } else if (service.answers && service.answers.length > 0) {
          // Keep existing answers if no updates provided
          servicePayload.answers = formatQuestionnaireAnswers(service.answers);
        }

        return servicePayload;
      });
    }
  }

  return payload;
};

/**
 * Example usage function for making the PATCH request
 * @param {string} apiUrl - The API endpoint URL
 * @param {string} token - Authentication token
 * @param {Object} currentProfile - Current profile data from GET request
 * @param {Object} updatedFields - Updated fields
 * @param {Object} questionnaireData - Updated questionnaire data (optional)
 * @returns {Promise} Fetch promise
 */
export const updateProfileWithQuestionnaire = async (
  apiUrl,
  token,
  currentProfile,
  updatedFields,
  questionnaireData = null
) => {
  const payload = createProfileUpdatePayload(currentProfile, updatedFields, questionnaireData);

  console.log('Profile update payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  return response;
};

