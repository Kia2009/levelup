import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import {
  SignedIn,
  UserButton,
  SignOutButton,
  useUser,
  useAuth,
  SignInButton,
} from "@clerk/clerk-react";
import { renderMarkdown } from "./markdown";
import BadgeProgress from "./components/BadgeProgress";
import UserBadge from "./components/UserBadge";

const TEXT = {
  en: {
    home: "Home",
    about: "About",
    rights: "Rights",
    settings: "Settings",
    shop: "Shop",
    addPost: "Add Post",
    feed: "LevelUp Feed",
    aboutTitle: "About LevelUp",
    aboutContent: `<b>LevelUp</b> is an innovative social platform designed for students, transforming studying and learning into an engaging video game experience. Share posts, collaborate on challenges, earn rewards, and level up your knowledge in a dynamic and interactive environment. Built with React (Vite) and FastAPI, it features dark/light mode, Farsi/English font support, and a clean, responsive UI. Created by KGH & Taha.`,
    aboutList: [
      "Gamified learning: Turn your studies into exciting quests and challenges.",
      "Interactive social feed: Share insights, ask questions, and connect with peers.",
      "Earn rewards: Collect coins and unlock exclusive badges as you progress.",
      "Real-time collaboration: Work together on projects and study groups.",
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
    profile: "Profile",
  },
  fa: {
    home: "خانه",
    about: "درباره",
    rights: "حقوق",
    settings: "تنظیمات",
    shop: "فروشگاه",
    profile: "حساب کاربری",
    addPost: "افزودن پست",
    feed: "فید LevelUp",
    aboutTitle: "درباره LevelUp",
    aboutContent: `<b>LevelUp</b> یک پلتفرم اجتماعی نوآورانه است که برای دانش‌آموزان و دانشجویان طراحی شده و مطالعه و یادگیری را به یک تجربه بازی ویدیویی جذاب تبدیل می‌کند. پست‌ها را به اشتراک بگذارید، در چالش‌ها همکاری کنید، جوایز کسب کنید و دانش خود را در یک محیط پویا و تعاملی ارتقا دهید. این پلتفرم با React (Vite) و FastAPI ساخته شده و دارای حالت تاریک/روشن، پشتیبانی از فارسی/انگلیسی و رابط کاربری تمیز و واکنش‌گرا است. ساخته شده توسط کیا قناعتی و محمدطه خراسانی زاده.`,
    aboutList: [
      "یادگیری گیمیفای شده: دروس خود را به ماموریت‌ها و چالش‌های هیجان‌انگیز تبدیل کنید.",
      "فید اجتماعی تعاملی: بینش‌ها را به اشتراک بگذارید، سوال بپرسید و با همتایان خود ارتباط برقرار کنید.",
      "کسب پاداش: با پیشرفت، سکه‌ها را جمع‌آوری کرده و نشان‌های انحصاری را باز کنید.",
      "همکاری بلادرنگ: روی پروژه‌ها و گروه‌های مطالعه با یکدیگر کار کنید.",
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  currentUserId?: string;
  showAlert: (message: string) => void;
}) {
  const { lang } = useLang();
  const isFarsi = /[\u0600-\u06FF]/.test(post.contains);
  const isOwner = currentUserId ? post.user_id === currentUserId : false;
  const hasLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const { getToken } = useAuth();
  const [userCoins, setUserCoins] = useState<number>(0);

  useEffect(() => {
    const fetchUserCoins = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${post.user_id}/coins`);
        if (res.ok) {
          const coins = await res.json();
          setUserCoins(coins);
        }
      } catch (err) {
        console.error("Failed to fetch user coins:", err);
      }
    };

    fetchUserCoins();
  }, [post.user_id]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
    showAlert(
      hasLiked ? TEXT[lang].alertPostUnliked : TEXT[lang].alertPostLiked
    );
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
      <div className='post-card-header'>
        <div className='post-meta'>
          <h2>{post.title}</h2>
          <div className='post-author-with-badge'>
            <span className='post-author'>{post.creator}</span>
            <UserBadge
              coins={userCoins}
              lang={lang}
              size='small'
              showTooltip={true}
              creator={post.creator}
            />
          </div>
          <span className='post-date'>
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        {isOwner && (
          <button
            className='delete-btn'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
              showAlert(TEXT[lang].alertPostDeleted);
            }}
            title='Delete'
          >
            <svg viewBox='0 0 24 24' width='24' height='24'>
              <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
            </svg>
          </button>
        )}
      </div>
      <div className='post-content'>{renderMarkdown(post.contains)}</div>
      <div className='post-actions' style={{ direction: "ltr" }}>
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

const CoinIcon = () => (
  <svg viewBox='0 0 24 24' width='24' height='24' className='coin-icon'>
    <defs>
      <linearGradient id='goldGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
        <stop offset='50%' style={{ stopColor: "#FFC107", stopOpacity: 1 }} />
        <stop offset='100%' style={{ stopColor: "#DAA520", stopOpacity: 1 }} />
      </linearGradient>
      <radialGradient id='shineGradient' cx='25%' cy='25%' r='50%'>
        <stop offset='0%' style={{ stopColor: "#FFFFFF", stopOpacity: 0.7 }} />
        <stop offset='100%' style={{ stopColor: "#FFD700", stopOpacity: 0 }} />
      </radialGradient>
      <filter id='coinShadow'>
        <feDropShadow
          dx='0.5'
          dy='0.5'
          stdDeviation='1'
          floodColor='#000'
          floodOpacity='0.3'
        />
      </filter>
      <filter id='emboss'>
        <feGaussianBlur in='SourceAlpha' stdDeviation='0.5' />
        <feSpecularLighting
          result='spec'
          specularConstant='1'
          specularExponent='20'
          lightingColor='#FFFFFF'
        >
          <fePointLight x='8' y='8' z='10' />
        </feSpecularLighting>
        <feComposite in='spec' in2='SourceAlpha' operator='in' />
        <feComposite in='SourceGraphic' />
      </filter>
    </defs>
    <circle
      cx='12'
      cy='12'
      r='11'
      fill='url(#goldGradient)'
      stroke='#B8860B'
      strokeWidth='1.5'
      filter='url(#coinShadow)'
    />
    <circle
      cx='12'
      cy='12'
      r='9.5'
      fill='none'
      stroke='#C68E17'
      strokeWidth='1'
      filter='url(#emboss)'
    />
    <circle cx='12' cy='12' r='8' fill='url(#shineGradient)' />
    <text
      x='12'
      y='15'
      textAnchor='middle'
      fontSize='10'
      fill='#8B6508'
      fontWeight='bold'
    >
      IQ
    </text>
  </svg>
);

function CoinCounter({
  coins,
  isLoading,
  lang,
}: {
  coins: number | null;
  isLoading: boolean;
  lang: "en" | "fa";
}) {
  return (
    <div className='coin-counter'>
      <CoinIcon />
      <span>
        {isLoading
          ? lang === "fa"
            ? "در حال بارگیری..."
            : "Loading..."
          : coins}
      </span>
    </div>
  );
}

function UserCoinsWithBadge({
  coins,
  isLoading,
  lang,
}: {
  coins: number | null;
  isLoading: boolean;
  lang: "en" | "fa";
}) {
  if (isLoading || coins === null) {
    return <CoinCounter coins={coins} isLoading={isLoading} lang={lang} />;
  }

  return (
    <>
      <CoinCounter coins={coins} isLoading={isLoading} lang={lang} />
      <BadgeProgress coins={coins} lang={lang} />
    </>
  );
}

type PageType = "feed" | "about" | "settings" | "profile" | "shop";
type NavProps = {
  currentPage: PageType;
  setPage: (page: PageType) => void;
};

function SideNavigation({ currentPage, setPage }: NavProps) {
  const { lang } = useLang();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (isSignedIn && user?.id) {
        try {
          setLoading(true);
          const token = await getToken({ template: "fullname" });
          const response = await fetch(`${API_URL}/getcoins`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch coins");
          const data = await response.json();
          setCoins(data);
        } catch (error) {
          console.error("Failed to fetch user coins:", error);
          setCoins(0);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCoins();
  }, [user?.id, isSignedIn]);

  return (
    <nav className='side-navigation'>
      <div className='nav-logo'>
        LevelUp
        <div className='nav-profile'>
          <UserButton />
        </div>
      </div>
      <UserCoinsWithBadge coins={coins} isLoading={loading} lang={lang} />
      <div className='nav-links'>
        <a
          href='/'
          className={`nav-link ${currentPage === "feed" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setPage("feed");
          }}
        >
          <svg viewBox='0 0 24 24'>
            <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
            <polyline points='9 22 9 12 15 12 15 22' />
          </svg>
          <span>{TEXT[lang].home}</span>
        </a>

        <a
          href='/profile'
          className={`nav-link ${currentPage === "profile" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setPage("profile");
          }}
        >
          <svg viewBox='0 0 24 24'>
            <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
            <circle cx='12' cy='7' r='4' />
          </svg>
          <span>{TEXT[lang].profile}</span>
        </a>

        <a
          href='/shop'
          className={`nav-link ${currentPage === "shop" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setPage("shop");
          }}
        >
          <svg viewBox='0 0 24 24'>
            <path d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z' />
          </svg>
          <span>{TEXT[lang].shop}</span>
        </a>

        <a
          href='/settings'
          className={`nav-link ${currentPage === "settings" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setPage("settings");
          }}
        >
          <svg viewBox='0 0 24 24'>
            <circle cx='12' cy='12' r='3' />
            <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
          </svg>
          <span>{TEXT[lang].settings}</span>
        </a>
      </div>
    </nav>
  );
}

function BottomNavigation({ currentPage, setPage }: NavProps) {
  const { lang } = useLang();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (user?.id) {
        try {
          const token = await getToken({ template: "fullname" });
          const response = await fetch(`${API_URL}/getcoins`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch coins");
          const coins = await response.json();
          setCoins(coins);
        } catch (error) {
          console.error("Failed to fetch user coins:", error);
        }
      }
    };

    fetchUserCoins();
  }, [user?.id]);

  return (
    <nav className='bottom-navigation'>
      <div className='bottom-nav-links'>
        <a
          href='/'
          className={`bottom-nav-link ${
            currentPage === "feed" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setPage("feed");
          }}
        >
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
            />
          </svg>
          <span>{TEXT[lang].home}</span>
        </a>

        <a
          href='/profile'
          className={`bottom-nav-link ${
            currentPage === "profile" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setPage("profile");
          }}
        >
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            />
          </svg>
          <span>{TEXT[lang].profile}</span>
        </a>

        <div className='mobile-coin-counter'>
          <CoinIcon />
          <span>{coins}</span>
        </div>

        <a
          href='/shop'
          className={`bottom-nav-link ${
            currentPage === "shop" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setPage("shop");
          }}
        >
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z'
            />
          </svg>
          <span>{TEXT[lang].shop}</span>
        </a>

        <a
          href='/settings'
          className={`bottom-nav-link ${
            currentPage === "settings" ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setPage("settings");
          }}
        >
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
          <span>{TEXT[lang].settings}</span>
        </a>
      </div>
    </nav>
  );
}

function App() {
  const [page, setPage] = useState<
    "feed" | "about" | "settings" | "profile" | "shop"
  >("feed");
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState<PostDisponivel | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { lang } = useLang();

  const { user } = useUser();
  const { getToken } = useAuth();

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null);
    }, 3300);
  };

  useEffect(() => {
    Promise.all([new Promise((resolve) => setTimeout(resolve, 500))]).then(
      () => {
        setPageLoading(false);
      }
    );
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
    } else if (path === "/shop") {
      setPage("shop");
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
    newPage: "feed" | "about" | "settings" | "profile" | "shop"
  ) => {
    setPage(newPage);
    setSelectedPostId(null);
  };

  const addNewUser = async () => {
    try {
      const token = await getToken({ template: "fullname" });
      const response = await fetch(`${API_URL}/newuser`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  useEffect(() => {
    if (user) {
      addNewUser();
    }
  }, [user]);

  if (pageLoading) {
    return <LoadingBar isLoading={true} />;
  }

  return (
    <ThemeProvider>
      <LangProvider>
        <div className='app-layout'>
          <SideNavigation currentPage={page} setPage={handlePageChange} />
          <BottomNavigation currentPage={page} setPage={handlePageChange} />
          {!selectedPostId && (
            <button className='fab-button' onClick={() => setShowModal(true)}>
              <div className='fab-icon'>
                <svg viewBox='0 0 24 24'>
                  <path d='M12 5v14M5 12h14' />
                </svg>
              </div>
              <span className='fab-text'>{TEXT[lang].addPost}</span>
            </button>
          )}
          <LoadingBar isLoading={isLoading} />
          {alertMessage && (
            <AlertBar
              message={alertMessage}
              onClose={() => setAlertMessage(null)}
            />
          )}
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
  showAlert,
}: {
  page: "feed" | "about" | "settings" | "profile" | "shop";
  setShowModal: (b: boolean) => void;
  showModal: boolean;
  newPost: PostDisponivel | null;
  setNewPost: (p: PostDisponivel | null) => void;
  setPage: (p: "feed" | "about" | "settings" | "profile" | "shop") => void;
  showAlert: (message: string) => void;
}) {
  const { lang } = useLang();
  return (
    <div className='page-wrapper'>
      <div className='content-area'>
        {page === "profile" && <ProfilePage />}
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
        {page === "shop" && <ShopPage />}
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
    </div>
  );
}

function ShopPage() {
  const { lang } = useLang();

  return (
    <main className='main-feed'>
      <header className='main-header'>
        <h1 className={lang === "fa" ? "farsi-font" : "latin-font"}>
          {TEXT[lang].shop}
        </h1>
      </header>
      <div className='about-content'>
        <h2 className={lang === "fa" ? "farsi-font" : "latin-font"}>
          {lang === "fa" ? "به زودی..." : "Coming Soon..."}
        </h2>
        <p className={lang === "fa" ? "farsi-font" : "latin-font"}>
          {lang === "fa"
            ? "فروشگاه ما به زودی راه‌اندازی خواهد شد. منتظر بمانید!"
            : "Our shop will be launching soon. Stay tuned!"}
        </p>
      </div>
    </main>
  );
}

function ProfilePage() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "level">("posts");
  const [userPosts, setUserPosts] = useState<PostDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coins, setCoins] = useState<number>(0);
  const { lang } = useLang();

  // Show sign in screen if not signed in
  if (!isSignedIn) {
    return (
      <main className='main-feed'>
        <header className='main-header'>
          <h1>{lang === "fa" ? "پروفایل" : "Profile"}</h1>
        </header>
        <div className='profile-container'>
          <div className='profile-signin'>
            <h2>{lang === "fa" ? "لطفا وارد شوید" : "Please Sign In"}</h2>
            <SignInButton>
              <button className='sign-out-button'>
                {lang === "fa" ? "ورود به حساب کاربری" : "Sign In"}
              </button>
            </SignInButton>
          </div>
        </div>
      </main>
    );
  }

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "fullname" });
      const [postsResponse, coinsResponse] = await Promise.all([
        fetch(`${API_URL}/myposts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/getcoins`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!postsResponse.ok) throw new Error("Failed to fetch user posts");
      if (!coinsResponse.ok) throw new Error("Failed to fetch user coins");

      const userPosts = await postsResponse.json();
      const userCoins = await coinsResponse.json();

      setUserPosts(userPosts);
      setCoins(userCoins);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  const handleLike = async (id: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      const post = userPosts.find((p) => p.id === id);
      const hasLiked = post?.likes.includes(user?.id || "");

      const res = await fetch(`${API_URL}/posts/${id}/like`, {
        method: hasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = await res.json();
      setUserPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUserPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  return (
    <main className='main-feed'>
      <header className='main-header'>
        <h1 className={lang === "fa" ? "farsi-font" : "latin-font"}>
          {lang === "fa" ? "پروفایل" : "Profile"}
        </h1>
      </header>
      <div className='profile-container'>
        <div className='profile-layout'>
          <div className='profile-info-section'>
            <div className='profile-picture-container'>
              <UserButton
                appearance={{
                  elements: { avatarBox: { width: 120, height: 120 } },
                }}
              />
            </div>
            <h2 className='profile-name'>
              {user?.fullName ||
                user?.username ||
                user?.emailAddresses?.[0]?.emailAddress}
            </h2>
            <div className='profile-id'>{user?.id}</div>
            <SignOutButton>
              <button className='sign-out-button'>
                {lang === "fa" ? "خروج" : "Sign Out"}
              </button>
            </SignOutButton>
          </div>

          <div className='profile-content-section'>
            <nav className='profile-nav'>
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
              <div className='tab-indicator'></div>
            </nav>
            <div className='profile-content'>
              {activeTab === "posts" ? (
                <div className='profile-posts'>
                  {loading ? (
                    <div className='loading-message'>
                      {lang === "fa" ? "در حال بارگذاری..." : "Loading..."}
                    </div>
                  ) : error ? (
                    <div className='error-message'>{error}</div>
                  ) : userPosts.length === 0 ? (
                    <div className='no-posts-message'>
                      {lang === "fa"
                        ? "هنوز پستی ندارید"
                        : "You haven't created any posts yet"}
                    </div>
                  ) : (
                    <ul className='post-list'>
                      {userPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={handleLike}
                          onDelete={handleDelete}
                          currentUserId={user?.id}
                          showAlert={() => {}}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className='profile-level'>
                  <UserCoinsWithBadge
                    coins={coins}
                    isLoading={loading}
                    lang={lang}
                  />
                </div>
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

function FormattingToolbar({
  onFormat,
}: {
  onFormat: (format: string, value?: string) => void;
}) {
  return (
    <div className='formatting-toolbar'>
      <button
        type='button'
        className='format-btn'
        onClick={() => onFormat("bold")}
      >
        Bold
      </button>
      <button
        type='button'
        className='format-btn'
        onClick={() => onFormat("italic")}
      >
        Italic
      </button>
      <button
        type='button'
        className='format-btn'
        onClick={() => onFormat("code")}
      >
        Code
      </button>
      <button
        type='button'
        className='format-btn'
        onClick={() => onFormat("math")}
      >
        Math
      </button>
      <button
        type='button'
        className='format-btn'
        onClick={() => onFormat("link")}
      >
        Link
      </button>
    </div>
  );
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
  const [titleRef, setTitleRef] = useState<HTMLInputElement | null>(null);
  const [contentRef, setContentRef] = useState<HTMLTextAreaElement | null>(
    null
  );

  const handleFormat = (format: string) => {
    const activeRef =
      document.activeElement === titleRef ? titleRef : contentRef;
    if (!activeRef) return;

    const start = activeRef.selectionStart || 0;
    const end = activeRef.selectionEnd || 0;
    const text = activeRef.value;
    const selectedText = text.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        formattedText = `*${selectedText || "italic text"}*`;
        break;
      case "code":
        formattedText = `\`${selectedText || "code"}\``;
        break;
      case "math":
        formattedText = `$$${selectedText || "x^2 + y^2 = z^2"}$$`;
        break;
      case "link":
        formattedText = `[${selectedText || "link text"}](url)`;
        break;
    }

    const newText =
      text.substring(0, start) + formattedText + text.substring(end);
    if (activeRef === titleRef) setTitle(newText);
    else setContains(newText);
  };

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
          ×
        </button>
        <h2>{TEXT[lang].addPostTitle}</h2>
        <FormattingToolbar onFormat={handleFormat} />
        <input
          ref={setTitleRef}
          type='text'
          placeholder={TEXT[lang].postTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className={
            detectFarsi(title) || lang === "fa" ? "farsi-font" : "latin-font"
          }
          style={{
            fontFamily:
              detectFarsi(title) || lang === "fa"
                ? "Vazirmatn, sans-serif"
                : "Inter, sans-serif",
          }}
        />
        <textarea
          ref={setContentRef}
          placeholder={TEXT[lang].postContent}
          value={contains}
          onChange={(e) => setContains(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newValue =
                contains.substring(0, start) + "\t" + contains.substring(end);
              setContains(newValue);
              setTimeout(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
                  start + 1;
              }, 0);
            }
          }}
          required
          minLength={3}
          className={
            detectFarsi(contains) || lang === "fa" ? "farsi-font" : "latin-font"
          }
          style={{
            fontFamily:
              detectFarsi(contains) || lang === "fa"
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
  const [commentRef, setCommentRef] = useState<HTMLTextAreaElement | null>(
    null
  );
  const isFarsi = detectFarsi(commentContent);

  const handleFormat = (format: string) => {
    if (!commentRef) return;

    const start = commentRef.selectionStart || 0;
    const end = commentRef.selectionEnd || 0;
    const text = commentRef.value;
    const selectedText = text.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        formattedText = `*${selectedText || "italic text"}*`;
        break;
      case "code":
        formattedText = `\`${selectedText || "code"}\``;
        break;
      case "math":
        formattedText = `$$${selectedText || "x^2 + y^2 = z^2"}$$`;
        break;
      case "link":
        formattedText = `[${selectedText || "link text"}](url)`;
        break;
    }

    const newText =
      text.substring(0, start) + formattedText + text.substring(end);
    setCommentContent(newText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      return;
    }
    await onSubmit(commentContent);
    setCommentContent("");
  };

  return (
    <div className='popup-backdrop' onClick={onClose}>
      <form
        className='popup-card comment-form-modal'
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button className='popup-close' onClick={onClose} type='button'>
          ×
        </button>
        <h2>{TEXT[lang].addComment}</h2>
        <FormattingToolbar onFormat={handleFormat} />
        <textarea
          ref={setCommentRef}
          placeholder={TEXT[lang].commentPlaceholder}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newValue =
                commentContent.substring(0, start) +
                "\t" +
                commentContent.substring(end);
              setCommentContent(newValue);
              setTimeout(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
                  start + 1;
              }, 0);
            }
          }}
          className={isFarsi || lang === "fa" ? "farsi-font" : "latin-font"}
          style={{
            fontFamily:
              isFarsi || lang === "fa"
                ? "Vazirmatn, sans-serif"
                : "Inter, sans-serif",
          }}
        />
        <button type='submit' disabled={loading}>
          {loading ? TEXT[lang].commenting : TEXT[lang].post}
        </button>
        {error && <div className='error'>{error}</div>}
      </form>
    </div>
  );
}

function MainFeed({
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
  const { user } = useUser();
  useTheme();
  const [posts, setPosts] = useState<PostDisponivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { lang } = useLang();

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

      if (!res.ok) throw new Error("Failed to update like");
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
        <h1 className={lang === "fa" ? "farsi-font" : "latin-font"}>
          {lang === "fa" ? "تنظیمات" : "Settings"}
        </h1>
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
        {TEXT[lang].allRights} © {new Date().getFullYear()}
        {/* اضافه کردن لینک About */}
        <span style={{ margin: "0 8px" }}>•</span> {/* یک جداکننده کوچک */}
        <a
          href='/about'
          onClick={(e) => {
            e.preventDefault();
            // اگر setPage به عنوان prop در دسترس باشد:
            // setPage("about");
            // در غیر این صورت، از window.location یا useNavigate استفاده کنید:
            window.history.pushState(null, "", "/about");
            window.location.reload(); // یا مدیریت state مناسب برای رندر مجدد صفحه
          }}
          style={{ color: "var(--color-primary)", textDecoration: "underline" }}
          className={lang === "fa" ? "farsi-font" : "latin-font"}
        >
          {TEXT[lang].about}
        </a>
      </div>
    </footer>
  );
}

function LoadingBar({ isLoading }: { isLoading: boolean }) {
  return (
    <div className={`loading-bar ${isLoading ? "loading" : ""}`}>
      <div className='loading-progress'></div>
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
  const [postAuthorCoins, setPostAuthorCoins] = useState<number>(0);
  const [commentCoins, setCommentCoins] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        setPost(data);

        // Fetch post author coins
        const coinsRes = await fetch(`${API_URL}/users/${data.user_id}/coins`);
        if (coinsRes.ok) {
          const coins = await coinsRes.json();
          setPostAuthorCoins(coins);
        }
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

        // Fetch coins for all comment authors
        const coinsMap: { [key: string]: number } = {};
        for (const comment of data) {
          try {
            const coinsRes = await fetch(
              `${API_URL}/users/${comment.user_id}/coins`
            );
            if (coinsRes.ok) {
              const coins = await coinsRes.json();
              coinsMap[comment.user_id] = coins;
            }
          } catch (err) {
            console.error("Failed to fetch coins for user:", comment.user_id);
          }
        }
        setCommentCoins(coinsMap);
      } catch (err: any) {
        setError(err.message);
      }
    };

    Promise.all([fetchPost(), fetchComments()]).finally(() =>
      setLoading(false)
    );
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
      showAlert(
        hasLiked ? TEXT[lang].alertPostUnliked : TEXT[lang].alertPostLiked
      );
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      const comment = comments.find((c) => c.id === commentId);
      const hasLiked = comment?.likes.includes(user?.id || "");

      const res = await fetch(
        `${API_URL}/posts/${postId}/comments/${commentId}/like`,
        {
          method: hasLiked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showAlert(
        hasLiked ? TEXT[lang].alertCommentUnliked : TEXT[lang].alertCommentLiked
      );
    } catch (err) {
      console.error("Failed to update comment like:", err);
    }
  };

  const handleCommentView = async (commentId: string) => {
    try {
      const token = await getToken({ template: "fullname" });
      const comment = comments.find((c) => c.id === commentId);
      if (!comment?.views.includes(user?.id || "")) {
        const res = await fetch(
          `${API_URL}/posts/${postId}/comments/${commentId}/view`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to update comment view count");
        const updated = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      }
    } catch (err) {
      console.error("Failed to update comment view count:", err);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!content.trim()) {
      setError(
        lang === "fa" ? "نظر نمی‌تواند خالی باشد." : "Comment cannot be empty."
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
    return <div className='post-page-loading'>{TEXT[lang].loading}</div>;
  if (error) return <div className='post-page-error'>{error}</div>;
  if (!post) return <div className='post-page-error'>Post not found</div>;

  const isFarsi = detectFarsi(post.contains);
  const hasLiked = post?.likes.includes(user?.id || "");

  return (
    <main className='main-feed'>
      <header className='main-header'>
        <button onClick={() => setSelectedPostId(null)} className='back-button'>
          {lang === "fa" ? "بازگشت به فید" : "Back to Feed"}
        </button>
      </header>
      <div
        className={`post-page-container ${
          comments.length > 0 ? "has-comments" : ""
        }`}
      >
        <article
          className={`post-detail ${isFarsi ? "farsi-font" : "latin-font"}`}
          style={{ direction: isFarsi ? "rtl" : "ltr" }}
        >
          <div className='post-detail-header'>
            <h1>{post.title}</h1>
            <div className='post-meta'>
              <div className='post-author-with-badge'>
                <span className='post-author'>@{post.creator}</span>
                <UserBadge
                  coins={postAuthorCoins}
                  lang={lang}
                  size='small'
                  showTooltip={true}
                  creator={post.creator}
                />
              </div>
              <span className='post-date'>
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div
            className='post-content'
            style={{
              direction: isFarsi ? "rtl" : "ltr",
              textAlign: isFarsi ? "right" : "left",
            }}
          >
            {renderMarkdown(post.contains)}
          </div>
          <div className='post-actions' style={{ direction: "ltr" }}>
            <button
              className={`like-btn ${hasLiked ? "liked" : ""}`}
              onClick={handleLike}
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
        </article>
        <section className='comment-section'>
          <h2 className='comments-header'>
            {lang === "fa" ? "نظرات" : "Comments"}
          </h2>
          {comments.length === 0 ? (
            <div className='no-comments'>{TEXT[lang].noComments}</div>
          ) : (
            <ul className='comment-list'>
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className={`comment-item ${
                    detectFarsi(comment.content) ? "farsi-font" : "latin-font"
                  }`}
                  style={{
                    direction: detectFarsi(comment.content) ? "rtl" : "ltr",
                    textAlign: detectFarsi(comment.content) ? "right" : "left",
                  }}
                >
                  <div className='comment-meta'>
                    <div className='post-author-with-badge'>
                      <span className='comment-author'>{comment.creator}</span>
                      <UserBadge
                        coins={commentCoins[comment.user_id] || 0}
                        lang={lang}
                        size='small'
                        showTooltip={true}
                        creator={comment.creator}
                      />
                    </div>
                    <span className='comment-date'>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='comment-content'>
                    {renderMarkdown(comment.content)}
                  </div>
                  <div className='post-actions' style={{ direction: "ltr" }}>
                    <button
                      className={`like-btn ${
                        comment.likes.includes(user?.id || "") ? "liked" : ""
                      }`}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <svg viewBox='0 0 24 24' width='24' height='24'>
                        <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                      </svg>
                      <span className='like-count'>{comment.likes.length}</span>
                    </button>
                    <div className='view-count'>
                      <svg viewBox='0 0 24 24' width='20' height='20'>
                        <path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' />
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
            className='add-comment-btn'
            onClick={() => setShowCommentModal(true)}
          >
            <svg viewBox='0 0 24 24' width='20' height='20'>
              <path d='M12 5v14M5 12h14' />
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

function AlertBar({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className='alert-bar'>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}

export default App;
