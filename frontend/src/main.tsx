import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

// این فایل نقطه ورود اصلی (entry point) اپلیکیشن React است.

// کلید انتشار Clerk از متغیرهای محیطی خوانده می‌شود.
// این کلید برای اتصال فرانت‌اند به سرویس Clerk ضروری است.
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// بررسی می‌کند که آیا کلید Clerk در فایل .env تعریف شده است یا خیر.
if (!PUBLISHABLE_KEY) {
  throw new Error('کلید انتشار Clerk را به فایل .env اضافه کنید');
}

// رندر کردن کامپوننت اصلی برنامه در DOM
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ClerkProvider یک کامپوننت از کتابخانه Clerk است که وضعیت احراز هویت را
      در کل برنامه مدیریت می‌کند. تمام کامپوننت‌های فرزند به اطلاعات کاربر
      و توابع احراز هویت دسترسی خواهند داشت.
    */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);