import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
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
    aboutContent: `<b>LevelUp</b> is a modern, student-focused social platform inspired by Twitter/X, designed for students to share posts, like, and interact in a beautiful, fast, and accessible environment. Built with React (Vite) and FastAPI, it features dark/light mode, Farsi/English font support, and a clean, responsive UI. Created by KGH & Taha.`,
    aboutList: [
      "Post creation, likes, and views are all interactive and real-time.",
      "Supports both Farsi and English with automatic font switching.",
      "Modern design, animations, and accessibility in mind.",
      "Open source and easy to extend for your school or university.",
    ],
    createdBy: "Created by KGH & Taha",
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
    addComment: "Add a Comment",
    commentPlaceholder: "Write your comment...",
    commenting: "Commenting...",
    noComments: "No comments yet.",
    alertPostCreated: "Post created successfully!",
    alertCommentAdded: "Comment added successfully!",
    alertPostLiked: "Post liked!",
    alertPostUnliked: "Post unliked!",
    alertPostDeleted: "Post deleted successfully!",
    alertCommentLiked: "Comment liked!",
    alertCommentUnliked: "Comment unliked!",
  },
  fa: {
    home: "خانه",
    about: "درباره",
    rights: "حقوق",
    settings: "تنظیمات",
    addPost: "افزودن پست",
    feed: "فید LevelUp",
    aboutTitle: "درباره LevelUp",
    aboutContent: `<b>LevelUp</b> یک پلتفرم اجتماعی مدرن برای دانش‌آموزان است که با الهام از توییتر/X ساخته شده و برای اشتراک‌گذاری پست، لایک و تعامل سریع و زیبا طراحی شده است. این پروژه با React (Vite) و FastAPI ساخته شده و دارای حالت تاریک/روشن، پشتیبانی از فارسی/انگلیسی و رابط کاربری تمیز و واکنش‌گرا است. ساخته شده توسط KGH و Taha.`,
    aboutList: [
      "ایجاد پست، لایک و بازدید کاملاً تعاملی و بلادرنگ است.",
      "پشتیبانی از فارسی و انگلیسی با تشخیص خودکار فونت.",
      "طراحی مدرن، انیمیشن و دسترس‌پذیری.",
      "متن‌باز و قابل توسعه برای مدارس و دانشگاه‌ها.",
    ],
    createdBy: "ساخته شده توسط KGH و Taha",
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
    addComment: "افزودن نظر",
    commentPlaceholder: "نظر خود را بنویسید...",
    commenting: "در حال ارسال نظر...",
    noComments: "هنوز نظری وجود ندارد.",
    alertPostCreated: "پست با موفقیت ایجاد شد!",
    alertCommentAdded: "نظر با موفقیت اضافه شد!",
    alertPostLiked: "پست لایک شد!",
    alertPostUnliked: "لایک پست لغو شد!",
    alertPostDeleted: "پست با موفقیت حذف شد!",
    alertCommentLiked: "نظر لایک شد!",
    alertCommentUnliked: "لایک نظر لغو شد!",
  },
};

const API_URL = "http://localhost:8000";

interface PostDisponivel {
  id: string;
  title: string;
  contains: string;
  likes: string[];
  views: string[];
  user_id: string;
  creator: string;
  created_at: string;
}

interface CommentDisponivel {
  id: string;
  post_id: string;
  user_id: string;
  creator: string;
  content: string;
  created_at: string;
  likes: string[];
  views: string[];
}

function PostCard({
  post,
  onLike,
  onDelete,
  currentUserId,
  showAlert,
}: {
  post: PostDisponivel;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
  showAlert: (message: string) => void;
}) {
  const { lang } = useLang();
  const isFarsi = /[\u0600-\u06FF]/.test(post.contains);
  const isOwner = post.user_id === currentUserId;
  const { getToken } = useAuth();
  const hasLiked = post.likes.includes(currentUserId);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
    showAlert(hasLiked ? TEXT[lang].alertPostUnliked : TEXT[lang].alertPostLiked);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(".like-btn") ||
      (e.target as HTMLElement).closest(".delete-btn")
    ) {
      return;
    }
    window.location.href = `/${post.id}`;
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
      updateViews();
    }
  }, [post.id, currentUserId]);

  return (
    <li
      className={`post-card ${isFarsi ? "farsi-font" : "latin-font"}`}
      style={{
        direction: isFarsi ? "rtl" : "ltr",
        textAlign: isFarsi ? "right" : "left",
      }}
      onClick={handlePostClick}
    >
      <div className="post-card-header">
        <div className="post-meta">
          <h2>{post.title}</h2>
          <span className="post-author">{post.creator}</span>
          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        {isOwner && (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
              showAlert(TEXT[lang].alertPostDeleted);
            }}
            title="Delete"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        )}
      </div>
      <p className="post-content">{post.contains}</p>
      <div className="post-actions" style={{ direction: "ltr" }}>
        <button
          className={`like-btn ${hasLiked ? "liked" : ""}`}
          onClick={handleLikeClick}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="like-count">{post.likes.length}</span>
        </button>
        <div className="view-count">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <span>{post.views.length}</span>
        </div>
      </div>
    </li>
  );
}

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
    document.body.dir = lang === "fa" ? "rtl" : "ltr";
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

function Header({
  setPage,
  setShowModal,
}: {
  setPage: (p: "feed" | "about" | "settings" | "profile") => void;
  setShowModal: (b: boolean) => void;
}) {
  const { lang } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`app-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="logo">LevelUp</div>
      <nav className="main-nav">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setPage("feed");
            window.history.pushState({}, "", "/");
          }}
        >
          {TEXT[lang].home}
        </a>
        <a
          href="/about"
          onClick={(e) => {
            e.preventDefault();
            setPage("about");
            window.history.pushState({}, "", "/about");
          }}
        >
          {TEXT[lang].about}
        </a>
        <a
          href="/settings"
          onClick={(e) => {
            e.preventDefault();
            setPage("settings");
            window.history.pushState({}, "", "/settings");
          }}
        >
          {TEXT[lang].settings}
        </a>
        <a
          href="/profile"
          onClick={(e) => {
            e.preventDefault();
            setPage("profile");
            window.history.pushState({}, "", "/profile");
          }}
        >
          {lang === "fa" ? "پروفایل" : "Profile"}
        </a>
      </nav>
      <div className="header-actions">
        <button onClick={() => setShowModal(true)} className="add-post-btn">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{TEXT[lang].addPost}</span>
        </button>
        <div className="user-button">
          <SignedIn>
            <UserButton
              appearance={{
                elements: { avatarBox: { width: 40, height: 40 } },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function AlertBar({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFading, onClose]);

  return (
    <div className={`alert-bar ${isFading ? "fade-out" : ""}`}>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm2-4h-2V7h2v6z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<"feed" | "about" | "settings" | "profile">(
    "feed"
  );
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState<PostDisponivel | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null);
    }, 3300);
  };

  useEffect(() => {
    Promise.all([new Promise((resolve) => setTimeout(resolve, 500))]).then(() => {
      setPageLoading(false);
    });
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/") {
      setPage("feed");
      setSelectedPostId(null);
    } else if (path === "/about") {
      setPage("about");
    } else if (path === "/settings") {
      setPage("settings");
    } else if (path === "/profile") {
      setPage("profile");
    } else {
      const match = path.match(/^\/(\d+)$/);
      if (match) {
        setSelectedPostId(match[1]);
      }
    }
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const handlePageChange = (
    newPage: "feed" | "about" | "settings" | "profile"
  ) => {
    setPage(newPage);
    setSelectedPostId(null);
  };

  if (pageLoading) {
    return <LoadingBar isLoading={true} />;
  }

  return (
    <ThemeProvider>
      <LangProvider>
        <div className="app-layout">
          <LoadingBar isLoading={isLoading} />
          {alertMessage && (
            <AlertBar message={alertMessage} onClose={() => setAlertMessage(null)} />
          )}
          <Header setPage={handlePageChange} setShowModal={setShowModal} />
          <div className={`page-container ${isLoading ? "loading" : ""}`}>
            {selectedPostId ? (
              <PostPage
                postId={selectedPostId}
                setSelectedPostId={setSelectedPostId}
                showAlert={showAlert}
              />
            ) : (
              <MainArea
                page={page}
                setShowModal={setShowModal}
                showModal={showModal}
                newPost={newPost}
                setNewPost={setNewPost}
                setPage={handlePageChange}
                showAlert={showAlert}
              />
            )}
          </div>
          <Footer />
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}

function MainArea({
  page,
  setShowModal,
  showModal,
  newPost,
  setNewPost,
  setPage,
  showAlert,
}: {
  page: "feed" | "about" | "settings" | "profile";
  setShowModal: (b: boolean) => void;
  showModal: boolean;
  newPost: PostDisponivel | null;
  setNewPost: (p: PostDisponivel | null) => void;
  setPage: (p: "feed" | "about" | "settings" | "profile") => void;
  showAlert: (message: string) => void;
}) {
  const { lang } = useLang();
  if (page === "profile") return <ProfilePage />;
  return (
    <div className={`main-area${lang === "fa" ? " farsi-font" : ""}`}>
      {page === "feed" && (
        <MainFeed
          showModal={showModal}
          setShowModal={setShowModal}
          newPost={newPost}
          setNewPost={setNewPost}
          showAlert={showAlert}
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
            showAlert(TEXT[lang].alertPostCreated);
          }}
        />
      )}
    </div>
  );
}

function ProfilePage() {
  const { user } = useUser();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"posts" | "level">("posts");

  useEffect(() => {
    const tabs = document.querySelectorAll(".profile-tab");
    const indicator = document.querySelector(".tab-indicator");

    if (tabs.length && indicator) {
      const activeTab = document.querySelector(
        ".profile-tab.active"
      ) as HTMLElement;
      if (activeTab) {
        indicator.setAttribute(
          "style",
          `
          width: ${activeTab.offsetWidth}px;
          left: ${activeTab.offsetLeft}px;
        `
        );
      }
    }
  }, [activeTab]);

  return (
    <main className="main-feed">
      <header className="main-header">
        <h1 className={lang === "fa" ? "farsi-font" : "latin-font"}>
          {lang === "fa" ? "پروفایل" : "Profile"}
        </h1>
      </header>
      <div className="profile-container">
        <div className="profile-layout">
          <div className="profile-info-section">
            <div className="profile-picture-container">
              <UserButton
                appearance={{
                  elements: { avatarBox: { width: 120, height: 120 } },
                }}
              />
            </div>
            <h2 className="profile-name">
              {user?.fullName ||
                user?.username ||
                user?.primaryEmailAddress?.emailAddress}
            </h2>
            <div className="profile-id">{user?.id}</div>
            <SignOutButton>
              <button className="sign-out-button">
                {lang === "fa" ? "خروج" : "Sign Out"}
              </button>
            </SignOutButton>
          </div>
          <div className="profile-content-section">
            <nav className="profile-nav">
              <button
                className={`profile-tab ${
                  activeTab === "posts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("posts")}
              >
                {lang === "fa" ? "پست‌ها" : "Posts"}
              </button>
              <button
                className={`profile-tab ${
                  activeTab === "level" ? "active" : ""
                }`}
                onClick={() => setActiveTab("level")}
              >
                {lang === "fa" ? "سطح" : "Level"}
              </button>
              <div className="tab-indicator"></div>
            </nav>
            <div className="profile-content">
              {activeTab === "posts" ? (
                <div className="profile-posts">Posts content here</div>
              ) : (
                <div className="profile-level">Level content here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function detectFarsi(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function CreatePostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (post: PostDisponivel) => void;
}) {
  const { lang } = useLang();
  const [title, setTitle] = useState("");
  const [contains, setContains] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="popup-backdrop" onClick={onClose}>
      <form
        className="popup-card create-modal no-scroll"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleCreate}
      >
        <button className="popup-close" onClick={onClose} type="button">
          ×
        </button>
        <h2>{TEXT[lang].addPostTitle}</h2>
        <input
          type="text"
          placeholder={TEXT[lang].postTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className={detectFarsi(title) || lang === "fa" ? "farsi-font" : "latin-font"}
          style={{
            fontFamily:
              detectFarsi(title) || lang === "fa"
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
          className={detectFarsi(contains) || lang === "fa" ? "farsi-font" : "latin-font"}
          style={{
            fontFamily:
              detectFarsi(contains) || lang === "fa"
                ? "Vazirmatn, sans-serif"
                : "Inter, sans-serif",
          }}
        />
        <button type="submit" disabled={loading}>
          {loading ? TEXT[lang].posting : TEXT[lang].post}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

function CommentFormModal({
  onClose,
  onSubmit,
  loading,
  error,
}: {
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  loading: boolean;
  error: string;
}) {
  const { lang } = useLang();
  const [commentContent, setCommentContent] = useState("");
  const isFarsi = detectFarsi(commentContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      return;
    }
    await onSubmit(commentContent);
    setCommentContent("");
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <form
        className="popup-card comment-form-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button className="popup-close" onClick={onClose} type="button">
          ×
        </button>
        <h2>{TEXT[lang].addComment}</h2>
        <textarea
          placeholder={TEXT[lang].commentPlaceholder}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className={isFarsi || lang === "fa" ? "farsi-font" : "latin-font"}
          style={{
            fontFamily:
              isFarsi || lang === "fa"
                ? "Vazirmatn, sans-serif"
                : "Inter, sans-serif",
          }}
        />
        <button type="submit" disabled={loading}>
          {loading ? TEXT[lang].commenting : TEXT[lang].post}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

function MainFeed({
  showModal,
  setShowModal,
  newPost,
  setNewPost,
  showAlert,
}: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  newPost: PostDisponivel | null;
  setNewPost: (p: PostDisponivel | null) => void;
  showAlert: (message: string) => void;
}) {
  const { lang } = useLang();
  useTheme();
  const [posts, setPosts] = useState<PostDisponivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { user } = useUser();

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

  useEffect(() => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
      setNewPost(null);
    }
  }, [newPost, setNewPost]);

  const handleLike = async (id: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      const post = posts.find((p) => p.id === id);
      const hasLiked = post?.likes.includes(user?.id || "");

      const res = await fetch(`${API_URL}/posts/${id}/like`, {
        method: hasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
    showAlert(TEXT[lang].alertPostDeleted);
  };

  return (
    <main className="main-feed">
      <header className="main-header">
        <h1>{TEXT[lang].feed}</h1>
      </header>
      {error && <div className="error">{error}</div>}
      <div className="post-feed-scroll hide-scrollbar">
        {loading ? (
          <div>{TEXT[lang].loading}</div>
        ) : posts.length === 0 ? (
          <div>{TEXT[lang].noPosts}</div>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                currentUserId={user?.id || ""}
                showAlert={showAlert}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function AboutPage() {
  const { lang } = useLang();
  return (
    <main className="main-feed">
      <header className="main-header">
        <h1>{TEXT[lang].aboutTitle}</h1>
      </header>
      <div className="about-content">
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
    <main className="main-feed">
      <header className="main-header">
        <h1>{lang === "fa" ? "تنظیمات" : "Settings"}</h1>
      </header>
      <div className="settings-content">
        <div className="setting-row">
          <span>{lang === "fa" ? "حالت نمایش" : "Theme"}:</span>
          <div className="setting-buttons">
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
        <div className="setting-row">
          <span>{lang === "fa" ? "زبان" : "Language"}:</span>
          <div className="setting-buttons">
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
    <footer className="footer">
      <div>{TEXT[lang].createdBy}</div>
      <div id="rights">
        {TEXT[lang].allRights} © {new Date().getFullYear()}
      </div>
    </footer>
  );
}

function LoadingBar({ isLoading }: { isLoading: boolean }) {
  return (
    <div className={`loading-bar ${isLoading ? "loading" : ""}`}>
      <div className="loading-progress"></div>
    </div>
  );
}

function PostPage({
  postId,
  setSelectedPostId,
  showAlert,
}: {
  postId: string;
  setSelectedPostId: (id: string | null) => void;
  showAlert: (message: string) => void;
}) {
  const { lang } = useLang();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [post, setPost] = useState<PostDisponivel | null>(null);
  const [comments, setComments] = useState<CommentDisponivel[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    Promise.all([fetchPost(), fetchComments()]).finally(() => setLoading(false));
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const token = await getToken({ template: "fullname" });
      const hasLiked = post.likes.includes(user?.id || "");

      const res = await fetch(`${API_URL}/posts/${post.id}/like`, {
        method: hasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = await res.json();
      setPost(updated);
      showAlert(hasLiked ? TEXT[lang].alertPostUnliked : TEXT[lang].alertPostLiked);
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      const comment = comments.find((c) => c.id === commentId);
      const hasLiked = comment?.likes.includes(user?.id || "");

      const res = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}/like`, {
        method: hasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = await res.json();
      setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showAlert(hasLiked ? TEXT[lang].alertCommentUnliked : TEXT[lang].alertCommentLiked);
    } catch (err) {
      console.error("Failed to update comment like:", err);
    }
  };

  const handleCommentView = async (commentId: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      const comment = comments.find((c) => c.id === commentId);
      if (!comment?.views.includes(user?.id || "")) {
        const res = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to update comment view count");
        const updated = await res.json();
        setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } catch (err) {
      console.error("Failed to update comment view count:", err);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!content.trim()) {
      setError(
        lang === "fa"
          ? "نظر نمی‌تواند خالی باشد."
          : "Comment cannot be empty."
      );
      return;
    }
    setError("");
    setCommentLoading(true);
    try {
      const token = await getToken({ template: "fullname" });
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setShowCommentModal(false);
      showAlert(TEXT[lang].alertCommentAdded);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && comments.length > 0) {
      comments.forEach((comment) => {
        handleCommentView(comment.id);
      });
    }
  }, [comments, user?.id]);

  if (loading)
    return <div className="post-page-loading">{TEXT[lang].loading}</div>;
  if (error) return <div className="post-page-error">{error}</div>;
  if (!post) return <div className="post-page-error">Post not found</div>;

  const isFarsi = detectFarsi(post.contains);
  const hasLiked = post.likes.includes(user?.id || "");

  return (
    <main className="main-feed">
      <header className="main-header">
        <button onClick={() => setSelectedPostId(null)} className="back-button">
          {lang === "fa" ? "بازگشت به فید" : "Back to Feed"}
        </button>
      </header>
      <div className={`post-page-container ${comments.length > 0 ? "has-comments" : ""}`}>
        <article
          className={`post-detail ${isFarsi ? "farsi-font" : "latin-font"}`}
          style={{ direction: isFarsi ? "rtl" : "ltr" }}
        >
          <div className="post-detail-header">
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span className="post-author">@{post.creator}</span>
              <span className="post-date">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="post-content">{post.contains}</p>
          <div className="post-actions" style={{ direction: "ltr" }}>
            <button
              className={`like-btn ${hasLiked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="like-count">{post.likes.length}</span>
            </button>
            <div className="view-count">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <span>{post.views.length}</span>
            </div>
          </div>
        </article>
        <section className="comment-section">
          <h2 className="comments-header">{lang === "fa" ? "نظرات" : "Comments"}</h2>
          {comments.length === 0 ? (
            <div className="no-comments">{TEXT[lang].noComments}</div>
          ) : (
            <ul className="comment-list">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className={`comment-item ${
                    detectFarsi(comment.content) ? "farsi-font" : "latin-font"
                  }`}
                  style={{ direction: detectFarsi(comment.content) ? "rtl" : "ltr" }}
                >
                  <div className="comment-meta">
                    <span className="comment-author">{comment.creator}</span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  <div className="post-actions" style={{ direction: "ltr" }}>
                    <button
                      className={`like-btn ${comment.likes.includes(user?.id || "") ? "liked" : ""}`}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="like-count">{comment.likes.length}</span>
                    </button>
                    <div className="view-count">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      <span>{comment.views.length}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <SignedIn>
          <button
            className="add-comment-btn"
            onClick={() => setShowCommentModal(true)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{TEXT[lang].addComment}</span>
          </button>
        </SignedIn>
        {showCommentModal && (
          <CommentFormModal
            onClose={() => setShowCommentModal(false)}
            onSubmit={handleCommentSubmit}
            loading={commentLoading}
            error={error}
          />
        )}
      </div>
    </main>
  );
}

export default App;