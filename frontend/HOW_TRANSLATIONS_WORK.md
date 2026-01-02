# How Translations Work - Complete Guide

## 🎯 Overview

Your website now has a **global translation system** that automatically converts all pages to English or Urdu when the user selects a language. The language preference is saved and persists across page refreshes.

## 🔄 How It Works

### 1. **LanguageContext** (Global State)
- Located: `frontend/src/context/LanguageContext.jsx`
- Manages the current language globally
- Automatically saves to localStorage
- Updates RTL/LTR layout automatically

### 2. **Translation Files**
- English: `frontend/src/locales/en.json`
- Urdu: `frontend/src/locales/ur.json`
- Both files have the same structure with different values

### 3. **i18n Configuration**
- Located: `frontend/src/i18n/config.js`
- Handles language switching
- Applies RTL layout for Urdu
- Sets document direction automatically

## 📝 How to Convert ANY Component to Support Translations

### Step-by-Step Example:

**BEFORE (No translations):**
```jsx
import React from 'react';

const MyPage = () => {
  return (
    <div>
      <h1>Welcome to My Page</h1>
      <button>Click Here</button>
      <p>This is some text</p>
    </div>
  );
};
```

**AFTER (With translations):**
```jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Step 1: Import

const MyPage = () => {
  const { t } = useTranslation(); // Step 2: Add hook
  
  return (
    <div>
      <h1>{t('myPage.welcome')}</h1> {/* Step 3: Replace text */}
      <button>{t('common.clickHere')}</button>
      <p>{t('myPage.someText')}</p>
    </div>
  );
};
```

**Add to translation files:**

`en.json`:
```json
{
  "myPage": {
    "welcome": "Welcome to My Page",
    "someText": "This is some text"
  },
  "common": {
    "clickHere": "Click Here"
  }
}
```

`ur.json`:
```json
{
  "myPage": {
    "welcome": "میرے صفحے میں خوش آمدید",
    "someText": "یہ کچھ متن ہے"
  },
  "common": {
    "clickHere": "یہاں کلک کریں"
  }
}
```

## 🎨 Adding Language Switcher to Any Page

```jsx
import LanguageSwitcher from './LanguageSwitcher';

// In your JSX:
<LanguageSwitcher variant="light" />
```

**Variants:**
- `light` - For light backgrounds (pink/white pages)
- `dark` - For dark backgrounds
- `pink` - Pink gradient theme
- `default` - Default styling

## 📋 Current Status

### ✅ Already Translated:
- ✅ **HostLiveStream** - Fully translated
- ✅ **ProfileScreen** - Fully translated
- ✅ **MessagingScreen** - Language switcher added, translations ready
- ✅ **HomeScreen** - Partially translated (tabs, menu items)
- ✅ **Bottom Navigation** - Fully translated
- ✅ **App.jsx** - Navbar translated

### 🔄 Need Translation (You can do these):
- SearchScreen
- Login/SignUp pages
- PointsRechargeScreen
- PointsWithdrawalScreen
- PointsTransfer
- EditProfileScreen
- NotificationsScreen
- PolicyScreen
- ViewerLiveStream
- And other components...

## 🚀 Quick Conversion Checklist

For each component you want to translate:

1. [ ] Import: `import { useTranslation } from 'react-i18next';`
2. [ ] Add hook: `const { t } = useTranslation();`
3. [ ] Replace strings: Change `"Text"` to `{t('key.text')}`
4. [ ] Add keys to `en.json`
5. [ ] Add keys to `ur.json`
6. [ ] Test in both languages
7. [ ] Add LanguageSwitcher if needed

## 💡 Tips

1. **Reuse common keys** - Use `common.*`, `navbar.*` keys that already exist
2. **Group by feature** - Use `profile.*`, `messaging.*`, `home.*` etc.
3. **Keep keys descriptive** - `messaging.deleteGroup` not `msg.del`
4. **Test RTL** - Urdu text can be longer, check layout
5. **Use variables** - `t('welcome', { name: userName })` for dynamic content

## 🔍 Finding What Needs Translation

To find untranslated text in a component:
1. Look for hardcoded strings in quotes: `"Text"`
2. Check button labels, headings, placeholders
3. Look for alert/error messages
4. Check modal titles and descriptions

## 📚 Available Translation Keys

### Common Keys (Use anywhere):
- `common.close`, `common.cancel`, `common.send`, `common.save`
- `common.delete`, `common.edit`, `common.loading`

### Navbar:
- `navbar.home`, `navbar.live`, `navbar.discover`
- `navbar.messages`, `navbar.profile`, `navbar.policies`

### Profile:
- `profile.points`, `profile.followers`, `profile.following`
- `profile.transfer`, `profile.withdraw`, `profile.logout`
- And many more...

### Messaging:
- `messaging.directMessages`, `messaging.groups`
- `messaging.searchConversations`, `messaging.createGroup`
- And many more...

## 🎯 Example: Converting Login Page

```jsx
// Before
<h1>Login</h1>
<input placeholder="Email" />
<button>Sign In</button>

// After
const { t } = useTranslation();
<h1>{t('login.login')}</h1>
<input placeholder={t('login.email')} />
<button>{t('login.signIn')}</button>
```

Then add to translation files:
```json
// en.json
"login": {
  "login": "Login",
  "email": "Email",
  "signIn": "Sign In"
}

// ur.json
"login": {
  "login": "لاگ ان",
  "email": "ای میل",
  "signIn": "سائن ان"
}
```

## ✨ That's It!

Once you add `useTranslation` and replace text with `t('key')`, the component will automatically:
- ✅ Show English when English is selected
- ✅ Show Urdu when Urdu is selected
- ✅ Apply RTL layout for Urdu
- ✅ Update instantly when language changes
- ✅ Persist language choice across refreshes

The system is already set up - you just need to use it in each component!

