# Profile Update with Questionnaire Data - Fix Guide

## Problem
When updating the profile from mobile using PATCH request to `https://server.carewinners.com/api/v1/profile/me/`, all other fields update successfully but questionnaire answers are not updating.

## Root Cause
The questionnaire answers are nested within `profile.profile_services[].answers[]` in the API response, but they are not being included in the PATCH request payload when updating from mobile.

## Solution
You must include the questionnaire answers in the PATCH request payload. The answers need to be nested within the `profile.profile_services` array.

## API Response Structure
```json
{
  "data": {
    "profile": {
      "profile_services": [
        {
          "id": 6,
          "service": 1,
          "answers": [
            {
              "question_id": 1,
              "id": 28,
              "answer": "[\"Companionship\", \"Household tasks\"]",
              "answer_parsed": ["Companionship", "Household tasks"]
            }
          ]
        }
      ]
    }
  }
}
```

## Correct PATCH Request Format

### Required Payload Structure
```json
{
  "first_name": "Saqib",
  "last_name": "Waheed",
  "email": "getcare@grr.la",
  "phone_number": "11485162201",
  "country": "United States of America",
  "city": "abingdon",
  "state": "Virginia",
  "address": "124 main street",
  "profile": {
    "bio": "I will spend a night with you",
    "profile_services": [
      {
        "id": 6,
        "service": 1,
        "hourly_rate": null,
        "experience_years": null,
        "is_available": true,
        "notes": null,
        "answers": [
          {
            "question_id": 1,
            "id": 28,
            "answer": "[\"Companionship\", \"Household tasks\"]"
          },
          {
            "question_id": 2,
            "id": 29,
            "answer": "[\"Mon\", \"Tue\", \"Wed\", \"Thurs\", \"Fri\", \"Sat\"]"
          }
        ]
      }
    ]
  }
}
```

## Implementation Steps

### Step 1: Fetch Current Profile Data
Always fetch the current profile data first to get existing questionnaire answers:

```javascript
const response = await fetch('https://server.carewinners.com/api/v1/profile/me/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
const currentProfile = data.data;
```

### Step 2: Include Answers in Update Payload
When creating the update payload, ensure you include the answers:

```javascript
const updatePayload = {
  first_name: updatedFirstName,
  last_name: updatedLastName,
  // ... other fields
  profile: {
    bio: updatedBio,
    profile_services: currentProfile.profile.profile_services.map(service => ({
      id: service.id,
      service: service.service,
      hourly_rate: service.hourly_rate,
      experience_years: service.experience_years,
      is_available: service.is_available,
      notes: service.notes,
      // CRITICAL: Include answers array
      answers: service.answers.map(answer => ({
        question_id: answer.question_id,
        answer: answer.answer, // Keep existing answer or update if changed
        id: answer.id // Include ID for updates
      }))
    }))
  }
};
```

### Step 3: Format Answers Correctly
- For **multiselect** questions: `answer` should be a JSON stringified array
- For **text/checkbox** questions: `answer` should be a string
- Always include `question_id` and `id` (if exists) for each answer

```javascript
// Example: Formatting multiselect answer
const multiselectAnswer = {
  question_id: 1,
  answer: JSON.stringify(["Companionship", "Household tasks"]),
  id: 28 // Include if updating existing answer
};

// Example: Formatting text answer
const textAnswer = {
  question_id: 9,
  answer: "There is no instructions for now",
  id: 36 // Include if updating existing answer
};
```

### Step 4: Send PATCH Request
```javascript
const response = await fetch('https://server.carewinners.com/api/v1/profile/me/', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updatePayload)
});
```

## Common Mistakes to Avoid

1. **Not including answers array**: The most common mistake is omitting the `answers` array entirely
2. **Not including answer IDs**: When updating existing answers, you must include the `id` field
3. **Wrong answer format**: For multiselect, the answer must be a JSON stringified array, not a plain array
4. **Not preserving existing answers**: If you're only updating some fields, you still need to include all existing answers

## Mobile App Implementation

### React Native Example
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const updateProfile = async (updatedFields, updatedAnswers = null) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const currentProfileResponse = await fetch(
      'https://server.carewinners.com/api/v1/profile/me/',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const currentProfileData = await currentProfileResponse.json();
    const currentProfile = currentProfileData.data;

    // Build update payload
    const payload = {
      ...updatedFields,
      profile: {
        ...currentProfile.profile,
        profile_services: currentProfile.profile.profile_services.map(service => ({
          id: service.id,
          service: service.service,
          hourly_rate: service.hourly_rate,
          experience_years: service.experience_years,
          is_available: service.is_available,
          notes: service.notes,
          // Include answers - use updatedAnswers if provided, otherwise keep existing
          answers: updatedAnswers && updatedAnswers[service.id]
            ? updatedAnswers[service.id].map(answer => ({
                question_id: answer.question_id,
                answer: typeof answer.answer === 'string' 
                  ? answer.answer 
                  : JSON.stringify(answer.answer),
                id: answer.id
              }))
            : service.answers.map(answer => ({
                question_id: answer.question_id,
                answer: answer.answer,
                id: answer.id
              }))
        }))
      }
    };

    // Send PATCH request
    const response = await fetch(
      'https://server.carewinners.com/api/v1/profile/me/',
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
```

### Flutter/Dart Example
```dart
Future<Map<String, dynamic>> updateProfile(
  Map<String, dynamic> updatedFields,
  Map<int, List<Map<String, dynamic>>>? updatedAnswers,
) async {
  final token = await getToken(); // Your token retrieval method
  
  // Fetch current profile
  final currentProfileResponse = await http.get(
    Uri.parse('https://server.carewinners.com/api/v1/profile/me/'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );
  
  final currentProfileData = jsonDecode(currentProfileResponse.body);
  final currentProfile = currentProfileData['data'];
  
  // Build payload
  final payload = {
    ...updatedFields,
    'profile': {
      ...currentProfile['profile'],
      'profile_services': (currentProfile['profile']['profile_services'] as List)
          .map((service) => {
            final serviceId = service['id'];
            return {
              'id': serviceId,
              'service': service['service'],
              'hourly_rate': service['hourly_rate'],
              'experience_years': service['experience_years'],
              'is_available': service['is_available'],
              'notes': service['notes'],
              'answers': updatedAnswers != null && updatedAnswers.containsKey(serviceId)
                  ? updatedAnswers[serviceId]!.map((answer) => {
                      return {
                        'question_id': answer['question_id'],
                        'answer': answer['answer'] is String
                            ? answer['answer']
                            : jsonEncode(answer['answer']),
                        if (answer['id'] != null) 'id': answer['id'],
                      };
                    }).toList()
                  : (service['answers'] as List).map((answer) => {
                      return {
                        'question_id': answer['question_id'],
                        'answer': answer['answer'],
                        if (answer['id'] != null) 'id': answer['id'],
                      };
                    }).toList(),
            };
          })
          .toList(),
    },
  };
  
  // Send PATCH request
  final response = await http.patch(
    Uri.parse('https://server.carewinners.com/api/v1/profile/me/'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode(payload),
  );
  
  return jsonDecode(response.body);
}
```

## Testing

1. **Fetch current profile** and verify questionnaire answers are present
2. **Update only basic fields** (first_name, last_name) and verify answers are preserved
3. **Update questionnaire answers** and verify they are saved correctly
4. **Update both basic fields and answers** together

## Debugging Tips

1. **Log the payload** before sending:
   ```javascript
   console.log('Update payload:', JSON.stringify(payload, null, 2));
   ```

2. **Check the response**:
   ```javascript
   const data = await response.json();
   console.log('Update response:', data);
   ```

3. **Verify answers are included**:
   - Check that `profile.profile_services[].answers[]` exists in payload
   - Verify each answer has `question_id` and `answer` fields
   - Ensure multiselect answers are JSON stringified

## Key Takeaways

✅ **Always include** `profile.profile_services[].answers[]` in the PATCH request  
✅ **Preserve existing answers** if you're only updating other fields  
✅ **Include answer IDs** when updating existing answers  
✅ **Format multiselect answers** as JSON stringified arrays  
✅ **Fetch current profile first** to get existing questionnaire data  

