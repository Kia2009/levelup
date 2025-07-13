# LevelUp - A Student-Focused Social Platform 🚀

A modern, student-focused social platform inspired by Twitter/X, built with **React**, **FastAPI**, and **Supabase**.

---

## 📖 Overview

**English:**
LevelUp is a dynamic social platform designed for students to share posts, interact through likes and views, and connect in a fast, beautiful, and accessible environment. Inspired by Twitter/X, it features a clean, responsive UI with support for both Farsi and English, dark/light mode, and real-time interactions. Built with React (Vite), FastAPI, and Supabase, LevelUp is open-source and ideal for school or university communities.

**فارسی:**
LevelUp یک پلتفرم اجتماعی مدرن و متمرکز بر دانش‌آموزان است که با الهام از توییتر/X طراحی شده و به کاربران امکان می‌دهد پست‌ها را به اشتراک بگذارند، از طریق لایک و بازدید تعامل کنند و در محیطی سریع، زیبا و قابل دسترس ارتباط برقرار کنند. این پروژه با React (Vite)، FastAPI و Supabase ساخته شده و دارای رابط کاربری تمیز، واکنش‌گرا، پشتیبانی از زبان‌های فارسی و انگلیسی، حالت تاریک/روشن و تعاملات بلادرنگ است. LevelUp متن‌باز بوده و برای جوامع مدرسه‌ای یا دانشگاهی مناسب است.

---

## ✨ Features

- **Post Creation and Interaction**: Share posts, like, and track views in real-time.
- **Multilingual Support**: Automatic font switching for Farsi and English content.
- **Dark/Light Mode**: Toggle between themes for a personalized experience.
- **Responsive Design**: Optimized for mobile and desktop with smooth animations.
- **User Authentication**: Secure sign-in and profile management with Clerk.
- **Real-Time Backend**: Powered by FastAPI and Supabase for fast, scalable data handling.
- **Open Source**: Easily extendable for your community or institution.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher) for the frontend.
- **Python** (v3.8 or higher) for the backend.
- A **Supabase** account for the database.
- A **Clerk** account for authentication.
- A `.env` file with the following variables:
  ```bash
  SUPABASE_URL=your_supabase_url
  SUPABASE_KEY=your_supabase_key
  CLERK_ISSUER=your_clerk_issuer
  CLERK_AUDIENCE=your_clerk_audience
  CLERK_JWKS_URL=your_clerk_jwks_url
  VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
  ```

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/your-username/levelup.git
    cd levelup
    ```

2.  **Set Up the Frontend:**

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

    The frontend will run on `http://localhost:5173`.

3.  **Set Up the Backend:**

    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

    The backend will run on `http://localhost:8000`.

### Configure Supabase

1.  Create a `posts` table in your Supabase project with the following schema:
    ```sql
    CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        creator TEXT NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        contains TEXT NOT NULL,
        likes TEXT[] DEFAULT '{}',
        views TEXT[] DEFAULT '{}'
    );
    ```
2.  Update your `.env` file with your Supabase URL and key.

### Configure Clerk

1.  Set up an application in your Clerk dashboard.
2.  Add the Clerk Publishable Key to `frontend/.env`.
3.  Add the JWKS-related variables to `backend/.env`.

### Running the App

1.  **Start the backend**: `uvicorn main:app --reload` (in the `backend` directory).
2.  **Start the frontend**: `npm run dev` (in the `frontend` directory).
3.  Open `http://localhost:5173` in your browser to use LevelUp.

---

## 📚 Usage

- **Sign In**: Use the Clerk-powered sign-in button to authenticate.
- **Create Posts**: Click "Add Post" to share your thoughts (minimum 3 characters for title and content).
- **Interact**: Like posts or view them to increment counters in real-time.
- **Switch Themes/Languages**: Use the Settings page to toggle between dark/light mode and Farsi/English.
- **Profile**: View your profile and sign out securely.

---

## 🛠️ Technologies Used

- **Frontend**:
  - React (Vite)
  - TypeScript
  - Clerk for authentication
  - Tailwind CSS (via custom CSS)
- **Backend**:
  - FastAPI
  - Supabase for database
  - PyJWT for authentication
- **Styling**:
  - Custom CSS with Farsi (Vazirmatn) and English (Inter) font support
  - Dark/Light mode with CSS variables
- **Other**:
  - `dotenv` for environment variables
  - `httpx` for async HTTP requests

---

## 🤝 Contributing

We welcome contributions\! To contribute:

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature`.
3.  Make your changes and commit: `git commit -m "Add your feature"`.
4.  Push to your branch: `git push origin feature/your-feature`.
5.  Open a Pull Request with a clear description of your changes.

Please ensure your code follows the existing style and includes tests where applicable.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 👨‍💻 Authors

- **KGH**
- **Taha**

---

## 🌟 Acknowledgments

- Inspired by Twitter/X for its social networking model.
- Thanks to Clerk for secure authentication.
- Powered by Supabase for scalable database management.
- Built with love for the student community\! ❤️

**English:**
LevelUp is an open-source project created to empower students to connect and share ideas. Join us in building a vibrant community platform\!

**فارسی:**
LevelUp یک پروژه متن‌باز است که برای توانمندسازی دانش‌آموزان برای ارتباط و اشتراک‌گذاری ایده‌ها ساخته شده است. به ما بپیوندید تا یک پلتفرم اجتماعی پویا بسازیم\!
