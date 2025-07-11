import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
//import SunIcon from "./assets/SunIcon";
//import MoonIcon from "./assets/MoonIcon";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  SignOutButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";

const TEXT = {
  en: {
    home: "Home",
    about: "About",
    rights: "Rights",
    settings: "Settings",
    addPost: "Add Post",
    feed: "LevelUp Feed",
    aboutTitle: "About LevelUp",
    aboutContent: `<b>LevelUp</b> is a modern, student-focused social platform inspired by Twitter/X, designed for students to share posts, like, and interact in a beautiful, fast, and accessible environment. Built with React (Vite) and FastAPI, it features dark/light mode, Farsi/English font support, and a clean, responsive UI. Created by KGH & TKZ.`,
    aboutList: [
      "Post creation, likes, and views are all interactive and real-time.",
      "Supports both Farsi and English with automatic font switching.",
      "Modern design, animations, and accessibility in mind.",
      "Open source and easy to extend for your school or university.",
    ],
    createdBy: "Created by KGH & TKZ",
    allRights: "All rights reserved. LevelUp",
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",
    english: "English",
    farsi: "Farsi",
    addPostTitle: "Add a Post",
    postTitle: "Title",
    postContent: "What's on your mind?",
    posting: "Posting...",
    post: "Post",
    noPosts: "No posts yet.",
    loading: "Loading...",
  },
  fa: {
    home: "خانه",
    about: "درباره",
    rights: "حقوق",
    settings: "تنظیمات",
    addPost: "افزودن پست",
    feed: "فید LevelUp",
    aboutTitle: "درباره LevelUp",
    aboutContent: `<b>LevelUp</b> یک پلتفرم اجتماعی مدرن برای دانش‌آموزان است که با الهام از توییتر/X ساخته شده و برای اشتراک‌گذاری پست، لایک و تعامل سریع و زیبا طراحی شده است. این پروژه با React (Vite) و FastAPI ساخته شده و دارای حالت تاریک/روشن، پشتیبانی از فارسی/انگلیسی و رابط کاربری تمیز و واکنش‌گرا است. ساخته شده توسط KGH و TKZ.`,
    aboutList: [
      "ایجاد پست، لایک و بازدید کاملاً تعاملی و بلادرنگ است.",
      "پشتیبانی از فارسی و انگلیسی با تشخیص خودکار فونت.",
      "طراحی مدرن، انیمیشن و دسترس‌پذیری.",
      "متن‌باز و قابل توسعه برای مدارس و دانشگاه‌ها.",
    ],
    createdBy: "ساخته شده توسط KGH و TKZ",
    allRights: "تمام حقوق محفوظ است. LevelUp",
    theme: "حالت نمایش",
    language: "زبان",
    dark: "تاریک",
    light: "روشن",
    english: "انگلیسی",
    farsi: "فارسی",
    addPostTitle: "افزودن پست",
    postTitle: "عنوان",
    postContent: "چه چیزی در ذهن دارید؟",
    posting: "در حال ارسال...",
    post: "ارسال",
    noPosts: "هنوز پستی وجود ندارد.",
    loading: "در حال بارگذاری...",
  },
};

const API_URL = "http://localhost:8000"; // Adjust if backend runs elsewhere

interface Post {
  id: string;
  title: string;
  contains: string;
  likes: string[];
  views: string[];
  user_id: string;
  creator: string;
  created_at: string;
}

function PostCard({
  post,
  onLike,
  onDelete,
  currentUserId,
}: {
  post: Post;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}) {
  const { lang } = useLang();
  const isOwner = post.user_id === currentUserId; // Compare user_id with current user
  const { getToken } = useAuth();
  const hasLiked = post.likes.includes(currentUserId);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  useEffect(() => {
    const updateViews = async () => {
      try {
        const token = await getToken({ template: "fullname" });
        const res = await fetch(`${API_URL}/posts/${post.id}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to update view count");
      } catch (err) {
        console.error("Failed to update view count:", err);
      }
    };

    if (currentUserId) {
      // Only track views for logged-in users
      updateViews();
    }
  }, [post.id, currentUserId]);

  return (
    <li className={`post-card ${lang === "fa" ? "farsi-font" : ""}`}>
      <div className='post-card-header'>
        <div className='post-meta'>
          <h2>{post.title}</h2>
          <span className='post-author'>@{post.creator}</span>{" "}
          {/* Use creator field */}
          <span className='post-date'>
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        {isOwner && ( // Only show delete button if user is owner
          <button
            className='delete-btn'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
            }}
            title='Delete'
          >
            <svg viewBox='0 0 24 24' width='24' height='24'>
              <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
            </svg>
          </button>
        )}
      </div>
      <p className='post-content'>{post.contains}</p>
      <div className='post-actions'>
        <button
          className={`like-btn ${hasLiked ? "liked" : ""}`}
          onClick={handleLikeClick}
        >
          <svg viewBox='0 0 24 24' width='24' height='24'>
            <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
          </svg>
          <span className='like-count'>{post.likes.length}</span>
        </button>
        <div className='view-count'>
          <svg viewBox='0 0 24 24' width='20' height='20'>
            <path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' />
          </svg>
          <span>{post.views.length}</span>
        </div>
      </div>
    </li>
  );
}

// Theme context
const ThemeContext = createContext<{ theme: string; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
const LangContext = createContext<{
  lang: "en" | "fa";
  setLang: (l: "en" | "fa") => void;
}>({ lang: "en", setLang: () => {} });

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"en" | "fa">(
    () => (localStorage.getItem("lang") as "en" | "fa") || "en"
  );
  useEffect(() => {
    document.body.setAttribute("data-lang", lang);
    localStorage.setItem("lang", lang);
  }, [lang]);
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

function useLang() {
  return useContext(LangContext);
}

function App() {
  const [page, setPage] = useState<"feed" | "about" | "settings" | "profile">(
    "feed"
  );
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState<Post | null>(null);

  // Redirect to feed after sign-in
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("sign-in")) {
      setPage("feed");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Large profile picture in top right
  // Always show, but only for signed in users
  return (
    <ThemeProvider>
      <LangProvider>
        <div style={{ position: "absolute", top: 16, right: 32, zIndex: 10 }}>
          <SignedIn>
            <UserButton
              appearance={{
                elements: { avatarBox: { width: 72, height: 72 } },
              }}
            />
          </SignedIn>
        </div>
        <div className={`app-layout`}>
          <Sidebar setPage={setPage} setShowModal={setShowModal} />
          <MainArea
            page={page}
            setShowModal={setShowModal}
            showModal={showModal}
            newPost={newPost}
            setNewPost={setNewPost}
            setPage={setPage}
          />
          <Footer />
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}

function Sidebar({
  setPage,
  setShowModal,
}: {
  setPage: (p: "feed" | "about" | "settings" | "profile") => void;
  setShowModal: (b: boolean) => void;
}) {
  const { lang } = useLang();
  return (
    <aside className='sidebar'>
      <div className='logo'>LevelUp</div>
      <nav>
        <a href='#' onClick={() => setPage("feed")}>
          {" "}
          {TEXT[lang].home}{" "}
        </a>
        <a href='#' onClick={() => setPage("about")}>
          {" "}
          {TEXT[lang].about}{" "}
        </a>
        <a href='#' onClick={() => setPage("settings")}>
          {" "}
          {TEXT[lang].settings}{" "}
        </a>
        <a href='#' onClick={() => setPage("profile")}>
          {" "}
          {lang === "fa" ? "پروفایل" : "Profile"}{" "}
        </a>
        <a href='#rights'>{TEXT[lang].rights}</a>
      </nav>
      <button
        className='sidebar-add-post-btn'
        onClick={() => setShowModal(true)}
      >
        {TEXT[lang].addPost}
      </button>
    </aside>
  );
}

function MainArea({
  page,
  setShowModal,
  showModal,
  newPost,
  setNewPost,
}: {
  page: "feed" | "about" | "settings" | "profile";
  setShowModal: (b: boolean) => void;
  showModal: boolean;
  newPost: Post | null;
  setNewPost: (p: Post | null) => void;
  setPage: (p: "feed" | "about" | "settings" | "profile") => void;
}) {
  const { lang } = useLang();
  if (page === "profile") return <ProfilePage />;
  return (
    <div className={`main-area${lang === "fa" ? " farsi-font" : ""}`}>
      {" "}
      {/* for RTL */}
      {page === "feed" && (
        <MainFeed
          showModal={showModal}
          setShowModal={setShowModal}
          newPost={newPost}
          setNewPost={setNewPost}
        />
      )}
      {page === "about" && <AboutPage />}
      {page === "settings" && <SettingsPage />}
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={(post) => {
            setShowModal(false);
            setNewPost(post);
          }}
        />
      )}
    </div>
  );
}

function ProfilePage() {
  const { user } = useUser();
  const { lang } = useLang();
  return (
    <main className='main-feed'>
      <header className='main-header'>
        <h1>{lang === "fa" ? "پروفایل" : "Profile"}</h1>
      </header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          marginTop: 32,
        }}
      >
        <SignedIn>
          <UserButton
            appearance={{
              elements: { avatarBox: { width: 120, height: 120 } },
            }}
          />
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 16 }}>
            {user?.fullName ||
              user?.username ||
              user?.primaryEmailAddress?.emailAddress}
          </div>
          <div style={{ color: "#888", fontSize: 16 }}>{user?.id}</div>
          <SignOutButton>
            <button style={{ width: 220, fontSize: 18, marginTop: 32 }}>
              {lang === "fa" ? "خروج" : "Sign Out"}
            </button>
          </SignOutButton>
        </SignedIn>
        <SignedOut>
          <SignInButton forceRedirectUrl='/' />
        </SignedOut>
      </div>
    </main>
  );
}

function detectFarsi(text: string) {
  // Farsi Unicode range: \u0600-\u06FF
  return /[\u0600-\u06FF]/.test(text);
}

function CreatePostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (post: Post) => void;
}) {
  const { lang } = useLang();
  const [title, setTitle] = useState("");
  const [contains, setContains] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isFarsiTitle = detectFarsi(title);
  const isFarsiContains = detectFarsi(contains);
  const { getToken } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3 || contains.length < 3) {
      setError(
        lang === "fa"
          ? "عنوان و متن باید حداقل ۳ کاراکتر باشند."
          : "Title and content must be at least 3 characters."
      );
      return;
    }
    setError("");
    setLoading(true);
    const token = await getToken({ template: "fullname" });
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, contains }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const post = await res.json();
      setTitle("");
      setContains("");
      onCreated(post);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='popup-backdrop' onClick={onClose}>
      <form
        className='popup-card create-modal no-scroll'
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleCreate}
      >
        <button className='popup-close' onClick={onClose} type='button'>
          &times;
        </button>
        <h2>{TEXT[lang].addPostTitle}</h2>
        <input
          type='text'
          placeholder={TEXT[lang].postTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className={
            isFarsiTitle || lang === "fa" ? "farsi-font" : "latin-font"
          }
          style={{
            fontFamily:
              isFarsiTitle || lang === "fa"
                ? "Vazirmatn, sans-serif"
                : "Inter, sans-serif",
          }}
        />
        <textarea
          placeholder={TEXT[lang].postContent}
          value={contains}
          onChange={(e) => setContains(e.target.value)}
          required
          minLength={3}
          className={
            isFarsiContains || lang === "fa" ? "farsi-font" : "latin-font"
          }
          style={{
            fontFamily:
              isFarsiContains || lang === "fa"
                ? "Vazirmatn, sans-serif"
                : "Inter, sans-serif",
          }}
        />
        <button type='submit' disabled={loading}>
          {loading ? TEXT[lang].posting : TEXT[lang].post}
        </button>
        {error && <div className='error'>{error}</div>}
      </form>
    </div>
  );
}

function MainFeed({
  newPost,
  setNewPost,
}: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  newPost: Post | null;
  setNewPost: (p: Post | null) => void;
}) {
  const { lang } = useLang();
  useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser(); // Add this at the top of MainFeed

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Add new post to feed immediately
  useEffect(() => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
      setNewPost(null);
    }
  }, [newPost, setNewPost]);

  // Increment view count and show in popup

  const handleLike = async (id: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      // Check if user has already liked the post
      const post = posts.find((p) => p.id === id);
      const hasLiked = post?.likes.includes(user?.id || "");

      const res = await fetch(`${API_URL}/posts/${id}/like`, {
        method: hasLiked ? "DELETE" : "POST", // Use DELETE for unlike, POST for like
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedPost && selectedPost.id === id) setSelectedPost(updated);
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const token = await getToken({ template: "fullname" });
    await fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPost && selectedPost.id === id) setSelectedPost(null);
  };

  return (
    <main className='main-feed'>
      <header className='main-header'>
        <h1>{TEXT[lang].feed}</h1>
      </header>
      {error && <div className='error'>{error}</div>}
      <div className='post-feed-scroll hide-scrollbar'>
        {loading ? (
          <div>{TEXT[lang].loading}</div>
        ) : posts.length === 0 ? (
          <div>{TEXT[lang].noPosts}</div>
        ) : (
          <ul className='post-list'>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                currentUserId={user?.id || ""}
              />
            ))}
          </ul>
        )}
      </div>
      {selectedPost && (
        <div className='popup-backdrop' onClick={() => setSelectedPost(null)}>
          <div className='popup-card' onClick={(e) => e.stopPropagation()}>
            <button
              className='popup-close'
              onClick={() => setSelectedPost(null)}
            >
              &times;
            </button>
            <h2>{selectedPost.title}</h2>
            <p>{selectedPost.contains}</p>
            <div className='post-actions'>
              <button onClick={() => handleLike(selectedPost.id)}>
                ❤️ {selectedPost.likes.length}
              </button>
              <span>👁️ {selectedPost.views.length}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AboutPage() {
  const { lang } = useLang();
  return (
    <main className='main-feed'>
      <header className='main-header'>
        <h1>{TEXT[lang].aboutTitle}</h1>
      </header>
      <div className='about-content'>
        <p dangerouslySetInnerHTML={{ __html: TEXT[lang].aboutContent }} />
        <ul>
          {TEXT[lang].aboutList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  return (
    <main className='main-feed'>
      <header className='main-header'>
        <h1>{lang === "fa" ? "تنظیمات" : "Settings"}</h1>
      </header>
      <div className='settings-content'>
        <div className='setting-row'>
          <span>{lang === "fa" ? "حالت نمایش" : "Theme"}:</span>
          <div className='setting-buttons'>
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => theme !== "light" && toggle()}
            >
              {TEXT[lang].light}
            </button>
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => theme !== "dark" && toggle()}
            >
              {TEXT[lang].dark}
            </button>
          </div>
        </div>
        <div className='setting-row'>
          <span>{lang === "fa" ? "زبان" : "Language"}:</span>
          <div className='setting-buttons'>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => lang !== "en" && setLang("en")}
            >
              {TEXT[lang].english}
            </button>
            <button
              className={lang === "fa" ? "active" : ""}
              onClick={() => lang !== "fa" && setLang("fa")}
            >
              {TEXT[lang].farsi}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  const { lang } = useLang();
  return (
    <footer className='footer'>
      <div>{TEXT[lang].createdBy}</div>
      <div id='rights'>
        {TEXT[lang].allRights} &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}

export default App;
