# Translation Guide - How to Add Translations to Any Component

## Quick Start Pattern

To make any component support English and Urdu translations, follow these 3 simple steps:

### Step 1: Import useTranslation hook
```jsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Add the hook in your component
```jsx
const YourComponent = () => {
  const { t } = useTranslation(); // Add this line
  
  // ... rest of your component
};
```

### Step 3: Replace hardcoded text with translation keys
```jsx
// Before:
<h1>Welcome</h1>
<button>Click Me</button>

// After:
<h1>{t('common.welcome')}</h1>
<button>{t('common.clickMe')}</button>
```

## Example: Converting a Component

### Before (No translations):
```jsx
import React from 'react';

const MyComponent = () => {
  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a test</p>
      <button>Submit</button>
    </div>
  );
};
```

### After (With translations):
```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myComponent.hello')}</h1>
      <p>{t('myComponent.test')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
};
```

## Adding New Translation Keys

### 1. Add to `frontend/src/locales/en.json`:
```json
{
  "myComponent": {
    "hello": "Hello World",
    "test": "This is a test"
  }
}
```

### 2. Add to `frontend/src/locales/ur.json`:
```json
{
  "myComponent": {
    "hello": "ہیلو ورلڈ",
    "test": "یہ ایک ٹیسٹ ہے"
  }
}
```

## Common Translation Keys Already Available

You can use these existing keys in any component:

### Common (common.*)
- `common.close` - "Close" / "بند کریں"
- `common.cancel` - "Cancel" / "منسوخ"
- `common.send` - "Send" / "بھیجیں"
- `common.save` - "Save" / "محفوظ کریں"
- `common.delete` - "Delete" / "حذف کریں"
- `common.edit` - "Edit" / "ترمیم"
- `common.loading` - "Loading..." / "لوڈ ہو رہا ہے..."

### Navbar (navbar.*)
- `navbar.home` - "Home" / "ہوم"
- `navbar.live` - "LIVE" / "لائیو"
- `navbar.discover` - "Discover" / "دریافت"
- `navbar.messages` - "Messages" / "پیغامات"
- `navbar.profile` - "Profile" / "پروفائل"
- `navbar.policies` - "Policies" / "پالیسیاں"

### Messaging (messaging.*)
- `messaging.directMessages` - "Direct Messages" / "براہ راست پیغامات"
- `messaging.groups` - "Groups" / "گروپس"
- `messaging.searchConversations` - "Search conversations..." / "بات چیت تلاش کریں..."
- And many more...

## Using Variables in Translations

For dynamic content:

```jsx
// Translation file:
{
  "welcome": "Welcome, {{name}}!"
}

// Component:
const { t } = useTranslation();
const userName = "John";
<p>{t('welcome', { name: userName })}</p>
// Output: "Welcome, John!" or "خوش آمدید، John!"
```

## Language Switcher Component

To add language switcher to any page:

```jsx
import LanguageSwitcher from './LanguageSwitcher';

// In your JSX:
<LanguageSwitcher variant="light" />
```

Available variants:
- `default` - Default styling
- `light` - Light background (good for light pages)
- `dark` - Dark background (good for dark pages)
- `pink` - Pink gradient (matches your theme)

## How It Works

1. **LanguageContext** - Manages the current language state globally
2. **i18n config** - Handles language switching and RTL support
3. **Translation files** - Store all text in English and Urdu
4. **useTranslation hook** - Provides the `t()` function to translate text

When a user switches language:
- All components using `t()` automatically update
- RTL layout is applied for Urdu
- Language preference is saved in localStorage
- Works across all pages instantly

## Checklist for Converting a Component

- [ ] Import `useTranslation` from 'react-i18next'
- [ ] Add `const { t } = useTranslation();` in component
- [ ] Replace all hardcoded strings with `t('key')`
- [ ] Add translation keys to `en.json`
- [ ] Add translation keys to `ur.json`
- [ ] Test in both English and Urdu
- [ ] Verify RTL layout works correctly

## Tips

1. **Group related translations** - Use nested keys like `profile.points`, `profile.followers`
2. **Reuse common keys** - Use `common.*` keys for buttons, actions
3. **Keep keys descriptive** - Use clear names like `messaging.deleteGroup` not `msg.del`
4. **Test RTL** - Always check how text looks in Urdu/RTL mode
5. **Handle long text** - Urdu text can be longer, ensure UI can accommodate it

