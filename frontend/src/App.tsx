import React, { useEffect, useState, createContext, useContext } from 'react';
import './App.css';
import SunIcon from './assets/SunIcon';
import MoonIcon from './assets/MoonIcon';

const TEXT = {
  en: {
    home: 'Home',
    about: 'About',
    rights: 'Rights',
    settings: 'Settings',
    addPost: 'Add Post',
    feed: 'LevelUp Feed',
    aboutTitle: 'About LevelUp',
    aboutContent: `<b>LevelUp</b> is a modern, student-focused social platform inspired by Twitter/X, designed for students to share posts, like, and interact in a beautiful, fast, and accessible environment. Built with React (Vite) and FastAPI, it features dark/light mode, Farsi/English font support, and a clean, responsive UI. Created by KGH & TKZ.`,
    aboutList: [
      'Post creation, likes, and views are all interactive and real-time.',
      'Supports both Farsi and English with automatic font switching.',
      'Modern design, animations, and accessibility in mind.',
      'Open source and easy to extend for your school or university.'
    ],
    createdBy: 'Created by KGH & TKZ',
    allRights: 'All rights reserved. LevelUp',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    english: 'English',
    farsi: 'Farsi',
    addPostTitle: 'Add a Post',
    postTitle: 'Title',
    postContent: "What's on your mind?",
    posting: 'Posting...',
    post: 'Post',
    noPosts: 'No posts yet.',
    loading: 'Loading...'
  },
  fa: {
    home: 'خانه',
    about: 'درباره',
    rights: 'حقوق',
    settings: 'تنظیمات',
    addPost: 'افزودن پست',
    feed: 'فید LevelUp',
    aboutTitle: 'درباره LevelUp',
    aboutContent: `<b>LevelUp</b> یک پلتفرم اجتماعی مدرن برای دانش‌آموزان است که با الهام از توییتر/X ساخته شده و برای اشتراک‌گذاری پست، لایک و تعامل سریع و زیبا طراحی شده است. این پروژه با React (Vite) و FastAPI ساخته شده و دارای حالت تاریک/روشن، پشتیبانی از فارسی/انگلیسی و رابط کاربری تمیز و واکنش‌گرا است. ساخته شده توسط KGH و TKZ.`,
    aboutList: [
      'ایجاد پست، لایک و بازدید کاملاً تعاملی و بلادرنگ است.',
      'پشتیبانی از فارسی و انگلیسی با تشخیص خودکار فونت.',
      'طراحی مدرن، انیمیشن و دسترس‌پذیری.',
      'متن‌باز و قابل توسعه برای مدارس و دانشگاه‌ها.'
    ],
    createdBy: 'ساخته شده توسط KGH و TKZ',
    allRights: 'تمام حقوق محفوظ است. LevelUp',
    theme: 'حالت نمایش',
    language: 'زبان',
    dark: 'تاریک',
    light: 'روشن',
    english: 'انگلیسی',
    farsi: 'فارسی',
    addPostTitle: 'افزودن پست',
    postTitle: 'عنوان',
    postContent: 'چه چیزی در ذهن دارید؟',
    posting: 'در حال ارسال...',
    post: 'ارسال',
    noPosts: 'هنوز پستی وجود ندارد.',
    loading: 'در حال بارگذاری...'
  }
};

const API_URL = 'http://localhost:8000'; // Adjust if backend runs elsewhere

interface Post {
  id: string;
  title: string;
  contains: string;
  likes: number;
  views: number;
}

// Theme context
const ThemeContext = createContext<{theme: string, toggle: () => void}>({theme: 'light', toggle: () => {}});
const LangContext = createContext<{lang: 'en'|'fa', setLang: (l:'en'|'fa')=>void}>({lang: 'en', setLang: () => {}});

function ThemeProvider({children}: {children: React.ReactNode}) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{theme, toggle}}>{children}</ThemeContext.Provider>;
}

function useTheme() { return useContext(ThemeContext); }

function LangProvider({children}: {children: React.ReactNode}) {
  const [lang, setLang] = useState<'en'|'fa'>(() => (localStorage.getItem('lang') as 'en'|'fa') || 'en');
  useEffect(() => {
    document.body.setAttribute('data-lang', lang);
    localStorage.setItem('lang', lang);
  }, [lang]);
  return <LangContext.Provider value={{lang, setLang}}>{children}</LangContext.Provider>;
}

function useLang() { return useContext(LangContext); }

function App() {
  const [page, setPage] = useState<'feed'|'about'|'settings'>('feed');
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState<Post|null>(null);
  return (
    <ThemeProvider>
      <LangProvider>
        <div className={`app-layout`}>
          <Sidebar setPage={setPage} setShowModal={setShowModal} />
          <MainArea page={page} setShowModal={setShowModal} showModal={showModal} newPost={newPost} setNewPost={setNewPost} setPage={setPage} />
          <Footer />
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}

function Sidebar({setPage, setShowModal}:{setPage:(p:'feed'|'about'|'settings')=>void, setShowModal:(b:boolean)=>void}) {
  const {lang} = useLang();
  return (
    <aside className="sidebar">
      <div className="logo">LevelUp</div>
      <nav>
        <a href="#" onClick={()=>setPage('feed')}>{TEXT[lang].home}</a>
        <a href="#" onClick={()=>setPage('about')}>{TEXT[lang].about}</a>
        <a href="#" onClick={()=>setPage('settings')}>{TEXT[lang].settings}</a>
        <a href="#rights">{TEXT[lang].rights}</a>
      </nav>
      <button className="sidebar-add-post-btn" onClick={()=>setShowModal(true)}>{TEXT[lang].addPost}</button>
    </aside>
  );
}

function MainArea({page, setShowModal, showModal, newPost, setNewPost, setPage}:{page:'feed'|'about'|'settings', setShowModal:(b:boolean)=>void, showModal:boolean, newPost:Post|null, setNewPost:(p:Post|null)=>void, setPage:(p:'feed'|'about'|'settings')=>void}) {
  const {lang} = useLang();
  return (
    <div className={`main-area${lang==='fa' ? ' farsi-font' : ''}`}> {/* for RTL */}
      {page === 'feed' && <MainFeed showModal={showModal} setShowModal={setShowModal} newPost={newPost} setNewPost={setNewPost} />}
      {page === 'about' && <AboutPage />}
      {page === 'settings' && <SettingsPage />}
      {showModal && <CreatePostModal onClose={()=>setShowModal(false)} onCreated={post=>{setShowModal(false); setNewPost(post);}} />}
    </div>
  );
}

function detectFarsi(text:string) {
  // Farsi Unicode range: \u0600-\u06FF
  return /[\u0600-\u06FF]/.test(text);
}

function CreatePostModal({onClose, onCreated}:{onClose:()=>void, onCreated:(post:Post)=>void}) {
  const {lang} = useLang();
  const [title, setTitle] = useState('');
  const [contains, setContains] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isFarsiTitle = detectFarsi(title);
  const isFarsiContains = detectFarsi(contains);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3 || contains.length < 3) {
      setError(lang==='fa' ? 'عنوان و متن باید حداقل ۳ کاراکتر باشند.' : 'Title and content must be at least 3 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, contains }),
      });
      if (!res.ok) throw new Error('Failed to create post');
      const post = await res.json();
      setTitle('');
      setContains('');
      onCreated(post);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <form className="popup-card create-modal no-scroll" onClick={e=>e.stopPropagation()} onSubmit={handleCreate}>
        <button className="popup-close" onClick={onClose} type="button">&times;</button>
        <h2>{TEXT[lang].addPostTitle}</h2>
        <input
          type="text"
          placeholder={TEXT[lang].postTitle}
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          minLength={3}
          className={isFarsiTitle || lang==='fa' ? 'farsi-font' : 'latin-font'}
          style={{fontFamily: isFarsiTitle || lang==='fa' ? 'Vazirmatn, sans-serif' : 'Inter, sans-serif'}}
        />
        <textarea
          placeholder={TEXT[lang].postContent}
          value={contains}
          onChange={e => setContains(e.target.value)}
          required
          minLength={3}
          className={isFarsiContains || lang==='fa' ? 'farsi-font' : 'latin-font'}
          style={{fontFamily: isFarsiContains || lang==='fa' ? 'Vazirmatn, sans-serif' : 'Inter, sans-serif'}}
        />
        <button type="submit" disabled={loading}>{loading ? TEXT[lang].posting : TEXT[lang].post}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

function MainFeed({showModal, setShowModal, newPost, setNewPost}:{showModal:boolean, setShowModal:(b:boolean)=>void, newPost:Post|null, setNewPost:(p:Post|null)=>void}) {
  const {lang} = useLang();
  const {theme} = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post|null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Add new post to feed immediately
  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
      setNewPost(null);
    }
  }, [newPost, setNewPost]);

  // Increment view count, fetch updated post, and show in popup
  const handleOpenPost = async (post: Post) => {
    await fetch(`${API_URL}/posts/${post.id}/view`, { method: 'POST' });
    // Fetch updated post
    const res = await fetch(`${API_URL}/posts/${post.id}`);
    const updated = await res.json();
    setSelectedPost(updated);
    // Also update the post in the feed
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleLike = async (id: string) => {
    await fetch(`${API_URL}/posts/${id}/like`, { method: 'POST' });
    // Update post in feed and popup
    const res = await fetch(`${API_URL}/posts/${id}`);
    const updated = await res.json();
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedPost && selectedPost.id === id) setSelectedPost(updated);
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/posts/${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
    if (selectedPost && selectedPost.id === id) setSelectedPost(null);
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
            {posts.map(post => (
              <li key={post.id} className={`post beautiful-card${lang==='fa' ? ' farsi-font' : ''}`} onClick={() => handleOpenPost(post)} tabIndex={0} style={{cursor:'pointer'}}>
                <div className="post-header">
                  <h2>{post.title}</h2>
                  <button className="delete" onClick={e => {e.stopPropagation(); handleDelete(post.id);}} title="Delete">×</button>
                </div>
                <p>{post.contains}</p>
                <div className="post-actions">
                  <button onClick={e => {e.stopPropagation(); handleLike(post.id);}}>❤️ {post.likes}</button>
                  <span>👁️ {post.views}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedPost && (
        <div className="popup-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="popup-card" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedPost(null)}>&times;</button>
            <h2>{selectedPost.title}</h2>
            <p>{selectedPost.contains}</p>
            <div className="post-actions">
              <button onClick={() => handleLike(selectedPost.id)}>❤️ {selectedPost.likes}</button>
              <span>👁️ {selectedPost.views}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AboutPage() {
  const {lang} = useLang();
  return (
    <main className="main-feed">
      <header className="main-header">
        <h1>{TEXT[lang].aboutTitle}</h1>
      </header>
      <div className="about-content">
        <p dangerouslySetInnerHTML={{__html: TEXT[lang].aboutContent}} />
        <ul>
          {TEXT[lang].aboutList.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </main>
  );
}

function SettingsPage() {
  const {theme, toggle} = useTheme();
  const {lang, setLang} = useLang();
  return (
    <main className="main-feed">
      <header className="main-header">
        <h1>{lang==='fa' ? 'تنظیمات' : 'Settings'}</h1>
      </header>
      <div className="settings-content">
        <div className="setting-row">
          <span>{lang==='fa' ? 'حالت نمایش' : 'Theme'}:</span>
          <div className="setting-buttons">
            <button className={theme==='light'?'active':''} onClick={()=>theme!=='light'&&toggle()}>{TEXT[lang].light}</button>
            <button className={theme==='dark'?'active':''} onClick={()=>theme!=='dark'&&toggle()}>{TEXT[lang].dark}</button>
          </div>
        </div>
        <div className="setting-row">
          <span>{lang==='fa' ? 'زبان' : 'Language'}:</span>
          <div className="setting-buttons">
            <button className={lang==='en'?'active':''} onClick={()=>lang!=='en'&&setLang('en')}>{TEXT[lang].english}</button>
            <button className={lang==='fa'?'active':''} onClick={()=>lang!=='fa'&&setLang('fa')}>{TEXT[lang].farsi}</button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  const {lang} = useLang();
  return (
    <footer className="footer">
      <div>{TEXT[lang].createdBy}</div>
      <div id="rights">{TEXT[lang].allRights} &copy; {new Date().getFullYear()}</div>
    </footer>
  );
}

export default App;
