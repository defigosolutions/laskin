import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL configuration for API requests
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

// Helper to resolve images (especially local uploads)
const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    const base = import.meta.env.DEV ? 'http://localhost:4000' : '';
    return `${base}${url}`;
  }
  return url;
};

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('laskin_admin_token'));
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Global states for lists
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [beforeAfters, setBeforeAfters] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [productInquiries, setProductInquiries] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [smtpSettings, setSmtpSettings] = useState<any>({ host: '', port: 587, user: '', pass: '', secure: false });
  const [seoRoutes, setSeoRoutes] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);

  // Modal / Drawer edit states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(''); // 'treatment' | 'package' | 'product' | 'booking' | 'review' | 'beforeafter' | 'specialist'
  const [selectedProductInquiry, setSelectedProductInquiry] = useState<any>(null);

  // SMTP Settings details
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<string | null>(null);

  // Axios config helper
  const api = axios.create({
    baseURL: BASE_URL,
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });

  // Fetch math CAPTCHA
  const fetchCaptcha = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/auth/captcha`);
      setCaptchaId(res.data.captchaId);
      setCaptchaQuestion(res.data.question);
      setCaptchaAnswer('');
    } catch (err) {
      console.error('Error fetching captcha:', err);
    }
  };

  useEffect(() => {
    if (!token) {
      fetchCaptcha();
    } else {
      fetchUserProfile();
    }
  }, [token]);

  // Load active tab data
  useEffect(() => {
    if (token) {
      loadTabData();
    }
  }, [token, activeTab]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/admin/auth/me');
      setUser(res.data.user);
    } catch (err) {
      // Token expired or invalid
      handleLogout();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await axios.post(`${BASE_URL}/admin/auth/login`, {
        email,
        password,
        captchaId,
        captchaAnswer
      });
      const receivedToken = res.data.token;
      localStorage.setItem('laskin_admin_token', receivedToken);
      setToken(receivedToken);
      setUser(res.data.user);
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Login failed. Please verify credentials.');
      fetchCaptcha(); // Refresh CAPTCHA on error
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('laskin_admin_token');
    setToken(null);
    setUser(null);
  };

  // Dynamically load tab data
  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const statsRes = await api.get('/admin/dashboard/stats');
        setStats(statsRes.data);
      } else if (activeTab === 'bookings') {
        const res = await api.get('/admin/bookings');
        setBookings(res.data);
      } else if (activeTab === 'treatments') {
        const res = await api.get('/admin/treatments');
        setTreatments(res.data);
      } else if (activeTab === 'packages') {
        const res = await api.get('/admin/packages');
        setPackages(res.data);
      } else if (activeTab === 'products') {
        const res = await api.get('/admin/products');
        setProducts(res.data);
      } else if (activeTab === 'specialists') {
        const res = await api.get('/admin/specialists');
        setSpecialists(res.data);
      } else if (activeTab === 'beforeafter') {
        const res = await api.get('/admin/before-after');
        setBeforeAfters(res.data);
      } else if (activeTab === 'reviews') {
        const res = await api.get('/admin/reviews');
        setReviews(res.data);
      } else if (activeTab === 'inquiries') {
        const res = await api.get('/admin/contact-inquiries');
        setInquiries(res.data);
      } else if (activeTab === 'product_inquiries') {
        const res = await api.get('/admin/product-inquiries');
        setProductInquiries(res.data);
      } else if (activeTab === 'subscribers') {
        const res = await api.get('/admin/newsletter/subscribers');
        setSubscribers(res.data);
      } else if (activeTab === 'settings') {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
        setSmtpSettings(res.data['settings.smtp'] || {});
      } else if (activeTab === 'seo') {
        const res = await api.get('/admin/seo');
        setSeoRoutes(res.data || []);
      }
    } catch (err) {
      console.error(`Error loading tab ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onComplete(res.data.imageUrl);
      alert('Image uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Image upload failed. Size limit 5MB.');
    }
  };

  const saveSettings = async () => {
    try {
      await api.post('/admin/settings', {
        'settings.smtp': smtpSettings
      });
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save settings.');
    }
  };

  const saveSeoSettings = async () => {
    try {
      await api.put('/admin/seo', { routes: seoRoutes });
      alert('SEO Settings saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save SEO settings.');
    }
  };

  // CSV Exporter helper
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CRUD Actions
  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    if (!confirm(`Are you sure you want to set booking to: ${status}?`)) return;
    try {
      await api.patch(`/admin/bookings/${bookingId}`, { status });
      loadTabData();
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  const handleUpdateReviewStatus = async (reviewId: string, status: string) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}`, { status });
      loadTabData();
    } catch (err) {
      alert('Failed to moderate review.');
    }
  };

  const handleToggleReviewFeature = async (reviewId: string, isFeatured: boolean) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}`, { isFeatured });
      loadTabData();
    } catch (err) {
      alert('Failed to update review spotlight.');
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'treatment') await api.delete(`/admin/treatments/${id}`);
      else if (type === 'package') await api.delete(`/admin/packages/${id}`);
      else if (type === 'product') await api.delete(`/admin/products/${id}`);
      else if (type === 'beforeafter') await api.delete(`/admin/before-after/${id}`);
      else if (type === 'review') await api.delete(`/admin/reviews/${id}`);
      else if (type === 'inquiry') await api.delete(`/admin/contact-inquiries/${id}`);
      else if (type === 'subscriber') await api.delete(`/admin/newsletter/subscribers/${id}`);
      loadTabData();
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  // Reordering helpers
  const handleReorder = async (type: string, id: string, direction: 'up' | 'down') => {
    const list = type === 'treatment' ? treatments : type === 'package' ? packages : products;
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return;

    const newList = [...list];
    if (direction === 'up' && idx > 0) {
      const temp = newList[idx];
      newList[idx] = newList[idx - 1];
      newList[idx - 1] = temp;
    } else if (direction === 'down' && idx < newList.length - 1) {
      const temp = newList[idx];
      newList[idx] = newList[idx + 1];
      newList[idx + 1] = temp;
    } else {
      return;
    }

    try {
      const orderIds = newList.map(item => item.id);
      await api.put(`/admin/${type}s/reorder`, { order: orderIds });
      loadTabData();
    } catch (err) {
      alert('Failed to reorder items.');
    }
  };

  // Save Settings
  const handleSaveSetting = async (key: string, value: any) => {
    try {
      await api.put(`/settings/${key}`, { value });
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  // Test SMTP Connection
  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const res = await api.post('/settings/smtp/test', smtpSettings);
      setSmtpTestResult(res.data.message);
    } catch (err: any) {
      setSmtpTestResult(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setSmtpTesting(false);
    }
  };

  if (!token) {
    // RENDER LOGIN SCREEN (Vibrant Black & Gold Theme)
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#050505',
        fontFamily: 'var(--font-sans)',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '40px',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: '#d4af37', fontSize: '32px', marginBottom: '8px', fontWeight: 400 }}>LA Skin</h2>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.15em' }}>Administrative Panel</span>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loginError && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'red', borderRadius: '4px', fontSize: '13px' }}>
                {loginError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#aaa', letterSpacing: '0.05em' }}>Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@laskin.com"
                style={{
                  padding: '12px',
                  backgroundColor: '#111',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#aaa', letterSpacing: '0.05em' }}>Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  padding: '12px',
                  backgroundColor: '#111',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #222', paddingTop: '16px' }}>
              <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#aaa', letterSpacing: '0.05em' }}>Security Verification</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4af37', backgroundColor: '#111', padding: '10px 16px', borderRadius: '4px', border: '1px solid #222' }}>
                  {captchaQuestion || 'Loading...'}
                </span>
                <input 
                  type="number" 
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="?"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loginLoading}
              style={{
                background: 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%)',
                color: 'black',
                border: 'none',
                padding: '14px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: loginLoading ? 'default' : 'pointer',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: '10px'
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RENDER PORTAL SYSTEM (Dense, Responsive Dashboard layout)
  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050505', color: '#eee', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${!sidebarOpen ? 'collapsed' : ''}`} style={{ width: '260px', backgroundColor: '#0a0a0a', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#d4af37', fontSize: '20px', margin: 0 }}>LA Skin</h3>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#666', letterSpacing: '0.1em' }}>Concierge Panel</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            
            { id: 'treatments', label: 'Services (Treatments)', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
            { id: 'packages', label: 'Treatment Packages', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'products', label: 'Products Boutique', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'beforeafter', label: 'Gallery cases', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'reviews', label: 'Reviews Moderation', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
            { id: 'inquiries', label: 'Contact Inquiries', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { id: 'product_inquiries', label: 'Product Inquiries', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { id: 'subscribers', label: 'Newsletter Registry', icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206' },
            { id: 'seo', label: 'SEO Management', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { id: 'settings', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                color: activeTab === tab.id ? '#d4af37' : '#aaa',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: '0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>
            User: <strong style={{ color: 'white' }}>{user?.name || 'Laura Andrade'}</strong>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px',
              backgroundColor: 'rgba(255,0,0,0.1)',
              border: '1px solid rgba(255,0,0,0.2)',
              color: '#ff4444',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'white', fontWeight: 400, textTransform: 'capitalize' }}>
            {activeTab.replace('-', ' ')}
          </h1>
          <div style={{ fontSize: '13px', color: '#888' }}>
            Local System Time: <strong style={{ color: 'white' }}>{new Date().toLocaleDateString()}</strong>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#d4af37' }}>Loading records...</div>
        ) : (
          <div style={{ flex: 1 }}>
            
            {/* ==========================================
                TAB: DASHBOARD
                ========================================== */}
            {activeTab === 'dashboard' && stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                  {[
                    { label: 'Total Services', value: stats.treatmentsCount, color: '#d4af37' },
                    { label: 'Active Products', value: stats.productsCount, color: '#f3e5ab' },
                    { label: 'Total Branches', value: stats.branchesCount, color: '#fff' },
                    { label: 'Pending Reviews', value: stats.reviewsPendingCount, color: stats.reviewsPendingCount > 0 ? '#ffaa00' : '#888' }
                  ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666', letterSpacing: '0.1em' }}>{stat.label}</span>
                      <h2 style={{ fontSize: '36px', color: stat.color, fontWeight: 'bold', margin: '8px 0 0 0' }}>{stat.value}</h2>
                    </div>
                  ))}
                </div>

                <div className="grid-1-mobile" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                  {/* Recent Bookings */}
                  <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', color: '#d4af37', marginBottom: '16px', fontWeight: 400 }}>Recent Bookings Pipeline</h3>
                    <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                          <th style={{ paddingBottom: '12px' }}>Ref</th>
                          <th style={{ paddingBottom: '12px' }}>Customer</th>
                          <th style={{ paddingBottom: '12px' }}>Service</th>
                          <th style={{ paddingBottom: '12px' }}>Appt Date</th>
                          <th style={{ paddingBottom: '12px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentBookings?.map((b: any) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #151515' }}>
                            <td style={{ padding: '12px 0', color: '#d4af37' }}>{b.reference}</td>
                            <td style={{ padding: '12px 0' }}>{b.customer_name}</td>
                            <td style={{ padding: '12px 0' }}>{b.service_name}</td>
                            <td style={{ padding: '12px 0' }}>{new Date(b.appointment_date).toLocaleDateString()} ({b.start_time.substring(0,5)})</td>
                            <td style={{ padding: '12px 0' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                backgroundColor: b.status === 'confirmed' ? 'rgba(0,200,80,0.1)' : 'rgba(255,170,0,0.1)',
                                color: b.status === 'confirmed' ? '#00c850' : '#ffaa00'
                              }}>{b.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  </div>

                  {/* Recent Inquiries */}
                  <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', color: '#d4af37', marginBottom: '16px', fontWeight: 400 }}>Recent Inquiries</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {stats.recentInquiries?.map((inq: any) => (
                        <div key={inq.id} style={{ borderBottom: '1px solid #151515', paddingBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <strong style={{ color: 'white' }}>{inq.full_name}</strong>
                            <span style={{ color: '#666' }}>{new Date(inq.created_at).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>{inq.subject}</p>
                        </div>
                      ))}
                      {(!stats.recentInquiries || stats.recentInquiries.length === 0) && (
                        <span style={{ fontSize: '13px', color: '#888' }}>No inquiries received.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                TAB: BOOKINGS PIPELINE
                ========================================== */}
            {activeTab === 'bookings' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Pipeline Control ({bookings.length} reservations)</span>
                  <button 
                    onClick={() => exportToCSV(bookings, 'bookings')}
                    style={{ padding: '8px 16px', backgroundColor: '#111', border: '1px solid #222', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Export to CSV
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Ref</th>
                      <th style={{ paddingBottom: '12px' }}>Customer Details</th>
                      <th style={{ paddingBottom: '12px' }}>Sanctuary</th>
                      <th style={{ paddingBottom: '12px' }}>Appointment / Specialist</th>
                      <th style={{ paddingBottom: '12px' }}>Requested Concerns</th>
                      <th style={{ paddingBottom: '12px' }}>Status</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '16px 0', color: '#d4af37', fontWeight: 'bold' }}>{b.reference}</td>
                        <td style={{ padding: '16px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{b.customer?.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{b.customer?.email}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{b.customer?.phone || 'No phone'}</div>
                        </td>
                        <td style={{ padding: '16px 0' }}>{b.branch?.displayName}</td>
                        <td style={{ padding: '16px 0' }}>
                          <div>{b.treatment?.name || b.package?.name}</div>
                          <div style={{ fontSize: '11px', color: '#d4af37', marginTop: '2px' }}>
                            {new Date(b.appointmentDate).toLocaleDateString()} @ {b.startTime.substring(0, 5)}
                          </div>
                        </td>
                        <td style={{ padding: '16px 0', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.concerns || <span style={{ color: '#444' }}>None</span>}
                        </td>
                        <td style={{ padding: '16px 0' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            backgroundColor: b.status === 'confirmed' ? 'rgba(0,200,80,0.1)' : b.status === 'cancelled' ? 'rgba(255,0,0,0.1)' : 'rgba(255,170,0,0.1)',
                            color: b.status === 'confirmed' ? '#00c850' : b.status === 'cancelled' ? 'red' : '#ffaa00'
                          }}>{b.status}</span>
                        </td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {b.status === 'pending' && (
                              <button 
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                style={{ padding: '4px 8px', backgroundColor: '#00c850', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                Confirm
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: '1px solid red', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                Cancel
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteItem('booking', b.id)}
                              style={{ padding: '4px 8px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: SERVICES (TREATMENTS)
                ========================================== */}
            {activeTab === 'treatments' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Clinical Treatments</span>
                  <button 
                    onClick={() => {
                      setEditingItem({ id: '', name: '', tagline: '', categoryId: 'facials-skincare', durationMinutes: 60, recoveryText: 'Zero downtime', priceCents: 10000, imageUrl: '', iconKey: 'sparkles', shortDescription: '', scientificText: '', steps: [] });
                      setDrawerType('treatment');
                      setDrawerOpen(true);
                    }}
                    style={{ padding: '8px 16px', background: 'var(--color-gold-gradient)', border: 'none', color: 'black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Add New Service
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Order</th>
                      <th style={{ paddingBottom: '12px' }}>Image</th>
                      <th style={{ paddingBottom: '12px' }}>Service Name / Tagline</th>
                      <th style={{ paddingBottom: '12px' }}>Price</th>
                      <th style={{ paddingBottom: '12px' }}>Duration / Recovery</th>
                      <th style={{ paddingBottom: '12px' }}>Status</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button disabled={idx === 0} onClick={() => handleReorder('treatment', t.id, 'up')} style={{ border: 'none', background: 'transparent', color: idx === 0 ? '#444' : '#d4af37', cursor: 'pointer' }}>▲</button>
                            <button disabled={idx === treatments.length - 1} onClick={() => handleReorder('treatment', t.id, 'down')} style={{ border: 'none', background: 'transparent', color: idx === treatments.length - 1 ? '#444' : '#d4af37', cursor: 'pointer' }}>▼</button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <img src={resolveImageUrl(t.image_url)} alt="" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #222' }} />
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{t.tagline}</div>
                        </td>
                        <td style={{ padding: '12px 0', color: '#d4af37', fontWeight: 'bold' }}>${(t.price_cents / 100).toFixed(2)}</td>
                        <td style={{ padding: '12px 0' }}>
                          <div>{t.duration_minutes} mins</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{t.recovery_text}</div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <span style={{ color: t.is_published ? '#00c850' : '#ff4444' }}>{t.is_published ? 'Published' : 'Draft'}</span>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setEditingItem({
                                id: t.id,
                                slug: t.slug,
                                name: t.name,
                                tagline: t.tagline,
                                categoryId: t.category_id,
                                durationMinutes: t.duration_minutes,
                                recoveryText: t.recovery_text,
                                priceCents: t.price_cents,
                                imageUrl: t.image_url,
                                iconKey: t.icon_key,
                                shortDescription: t.short_description,
                                scientificText: t.scientific_text,
                                steps: t.steps,
                                isPublished: t.is_published
                              });
                              setDrawerType('treatment');
                              setDrawerOpen(true);
                            }}
                            style={{ padding: '4px 8px', backgroundColor: '#222', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginRight: '6px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteItem('treatment', t.id)}
                            style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: PACKAGES
                ========================================== */}
            {activeTab === 'packages' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Bespoke Skin Packages</span>
                  <button 
                    onClick={() => {
                      setEditingItem({ id: '', name: '', tagline: '', priceCents: 40000, valuePriceCents: 50000, badge: '', inclusions: [] });
                      setDrawerType('package');
                      setDrawerOpen(true);
                    }}
                    style={{ padding: '8px 16px', background: 'var(--color-gold-gradient)', border: 'none', color: 'black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Add New Package
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Order</th>
                      <th style={{ paddingBottom: '12px' }}>Package Name / Tagline</th>
                      <th style={{ paddingBottom: '12px' }}>Price / Value Price</th>
                      <th style={{ paddingBottom: '12px' }}>Badge</th>
                      <th style={{ paddingBottom: '12px' }}>Inclusions Count</th>
                      <th style={{ paddingBottom: '12px' }}>Status</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button disabled={idx === 0} onClick={() => handleReorder('package', p.id, 'up')} style={{ border: 'none', background: 'transparent', color: idx === 0 ? '#444' : '#d4af37', cursor: 'pointer' }}>▲</button>
                            <button disabled={idx === packages.length - 1} onClick={() => handleReorder('package', p.id, 'down')} style={{ border: 'none', background: 'transparent', color: idx === packages.length - 1 ? '#444' : '#d4af37', cursor: 'pointer' }}>▼</button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{p.tagline}</div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ color: '#d4af37', fontWeight: 'bold' }}>${(p.price_cents / 100).toFixed(2)}</div>
                          {p.value_price_cents && <div style={{ fontSize: '11px', color: '#666', textDecoration: 'line-through' }}>${(p.value_price_cents / 100).toFixed(2)}</div>}
                        </td>
                        <td style={{ padding: '12px 0' }}>{p.badge || '-'}</td>
                        <td style={{ padding: '12px 0' }}>{p.inclusions?.length || 0} items</td>
                        <td style={{ padding: '12px 0' }}>
                          <span style={{ color: p.is_published ? '#00c850' : '#ff4444' }}>{p.is_published ? 'Published' : 'Draft'}</span>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setEditingItem({
                                id: p.id,
                                slug: p.slug,
                                name: p.name,
                                tagline: p.tagline,
                                priceCents: p.price_cents,
                                valuePriceCents: p.value_price_cents,
                                badge: p.badge,
                                inclusions: p.inclusions,
                                isPublished: p.is_published
                              });
                              setDrawerType('package');
                              setDrawerOpen(true);
                            }}
                            style={{ padding: '4px 8px', backgroundColor: '#222', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginRight: '6px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteItem('package', p.id)}
                            style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: PRODUCTS BOUTIQUE
                ========================================== */}
            {activeTab === 'products' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Online Boutique Formulations</span>
                  <button 
                    onClick={() => {
                      setEditingItem({ name: '', tagline: 'Cleanser', priceCents: 5000, imageUrl: '', description: '', isActive: true });
                      setDrawerType('product');
                      setDrawerOpen(true);
                    }}
                    style={{ padding: '8px 16px', background: 'var(--color-gold-gradient)', border: 'none', color: 'black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Add New Product
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Order</th>
                      <th style={{ paddingBottom: '12px' }}>Image</th>
                      <th style={{ paddingBottom: '12px' }}>Product Name</th>
                      <th style={{ paddingBottom: '12px' }}>Category</th>
                      <th style={{ paddingBottom: '12px' }}>Price</th>
                      <th style={{ paddingBottom: '12px' }}>Status</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod, idx) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button disabled={idx === 0} onClick={() => handleReorder('product', prod.id, 'up')} style={{ border: 'none', background: 'transparent', color: idx === 0 ? '#444' : '#d4af37', cursor: 'pointer' }}>▲</button>
                            <button disabled={idx === products.length - 1} onClick={() => handleReorder('product', prod.id, 'down')} style={{ border: 'none', background: 'transparent', color: idx === products.length - 1 ? '#444' : '#d4af37', cursor: 'pointer' }}>▼</button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <img src={resolveImageUrl(prod.image_url)} alt="" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #222' }} />
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{prod.name}</div>
                          <div style={{ fontSize: '11px', color: '#888', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.description}</div>
                        </td>
                        <td style={{ padding: '12px 0' }}>{prod.tagline}</td>
                        <td style={{ padding: '12px 0', color: '#d4af37', fontWeight: 'bold' }}>${(prod.price_cents / 100).toFixed(2)}</td>
                        <td style={{ padding: '12px 0' }}>
                          <span style={{ color: prod.is_active ? '#00c850' : '#ff4444' }}>{prod.is_active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setEditingItem({
                                id: prod.id,
                                slug: prod.slug,
                                name: prod.name,
                                tagline: prod.tagline,
                                priceCents: prod.price_cents,
                                imageUrl: prod.image_url,
                                description: prod.description,
                                isActive: prod.is_active
                              });
                              setDrawerType('product');
                              setDrawerOpen(true);
                            }}
                            style={{ padding: '4px 8px', backgroundColor: '#222', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginRight: '6px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteItem('product', prod.id)}
                            style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: BEFORE & AFTER GALLERY
                ========================================== */}
            {activeTab === 'beforeafter' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Clinical Case Studies</span>
                  <button 
                    onClick={() => {
                      setEditingItem({ id: '', title: '', subtitle: '', treatmentId: '', timelineText: '', primaryIndications: '', therapistNotes: '', satisfactionText: '100% Client Rating', ageProfile: '', beforeImageUrl: '', afterImageUrl: '' });
                      setDrawerType('beforeafter');
                      setDrawerOpen(true);
                    }}
                    style={{ padding: '8px 16px', background: 'var(--color-gold-gradient)', border: 'none', color: 'black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Add New Case
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Case Title</th>
                      <th style={{ paddingBottom: '12px' }}>Treatment Profile</th>
                      <th style={{ paddingBottom: '12px' }}>Timeline</th>
                      <th style={{ paddingBottom: '12px' }}>Satisfaction</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beforeAfters.map(ba => (
                      <tr key={ba.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '16px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{ba.title}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{ba.subtitle}</div>
                        </td>
                        <td style={{ padding: '16px 0' }}>{ba.treatment_id}</td>
                        <td style={{ padding: '16px 0' }}>{ba.timeline_text}</td>
                        <td style={{ padding: '16px 0' }}>{ba.satisfaction_text}</td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setEditingItem({
                                id: ba.id,
                                slug: ba.slug,
                                title: ba.title,
                                subtitle: ba.subtitle,
                                treatmentId: ba.treatment_id,
                                timelineText: ba.timeline_text,
                                primaryIndications: ba.primary_indications,
                                therapistNotes: ba.therapist_notes,
                                satisfactionText: ba.satisfaction_text,
                                ageProfile: ba.age_profile,
                                beforeImageUrl: ba.before_image_url,
                                afterImageUrl: ba.after_image_url,
                                isPublished: ba.is_published
                              });
                              setDrawerType('beforeafter');
                              setDrawerOpen(true);
                            }}
                            style={{ padding: '4px 8px', backgroundColor: '#222', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginRight: '6px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteItem('beforeafter', ba.id)}
                            style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: REVIEWS MODERATION
                ========================================== */}
            {activeTab === 'reviews' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <span style={{ fontSize: '14px', color: '#d4af37', display: 'block', marginBottom: '20px' }}>Client Testimonials Moderation</span>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Client</th>
                      <th style={{ paddingBottom: '12px' }}>Quote Testimonial</th>
                      <th style={{ paddingBottom: '12px' }}>Rating</th>
                      <th style={{ paddingBottom: '12px' }}>Featured</th>
                      <th style={{ paddingBottom: '12px' }}>Status</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '16px 0', fontWeight: 'bold', color: 'white' }}>{r.author_name}</td>
                        <td style={{ padding: '16px 0', maxWidth: '300px', fontStyle: 'italic', color: '#aaa' }}>"{r.quote}"</td>
                        <td style={{ padding: '16px 0', color: '#d4af37' }}>{'★'.repeat(r.rating)}</td>
                        <td style={{ padding: '16px 0' }}>
                          <input 
                            type="checkbox" 
                            checked={r.is_featured} 
                            onChange={(e) => handleToggleReviewFeature(r.id, e.target.checked)} 
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '16px 0' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            backgroundColor: r.status === 'approved' ? 'rgba(0,200,80,0.1)' : r.status === 'rejected' ? 'rgba(255,0,0,0.1)' : 'rgba(255,170,0,0.1)',
                            color: r.status === 'approved' ? '#00c850' : r.status === 'rejected' ? 'red' : '#ffaa00'
                          }}>{r.status}</span>
                        </td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {r.status !== 'approved' && (
                              <button 
                                onClick={() => handleUpdateReviewStatus(r.id, 'approved')}
                                style={{ padding: '4px 8px', backgroundColor: '#00c850', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                Approve
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button 
                                onClick={() => handleUpdateReviewStatus(r.id, 'rejected')}
                                style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: '1px solid red', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                Reject
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteItem('review', r.id)}
                              style={{ padding: '4px 8px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: CONTACT INQUIRIES
                ========================================== */}
            {activeTab === 'inquiries' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Client Message Inquiries ({inquiries.length} entries)</span>
                  <button 
                    onClick={() => exportToCSV(inquiries, 'contact_inquiries')}
                    style={{ padding: '8px 16px', backgroundColor: '#111', border: '1px solid #222', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Export to CSV
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Date</th>
                      <th style={{ paddingBottom: '12px' }}>Sender</th>
                      <th style={{ paddingBottom: '12px' }}>Subject</th>
                      <th style={{ paddingBottom: '12px' }}>Message Message</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map(inq => (
                      <tr key={inq.id} style={{ borderBottom: '1px solid #151515', opacity: inq.is_read ? 0.7 : 1 }}>
                        <td style={{ padding: '16px 0', color: '#aaa' }}>{new Date(inq.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{inq.full_name}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{inq.email}</div>
                          {inq.phone && <div style={{ fontSize: '11px', color: '#888' }}>{inq.phone}</div>}
                        </td>
                        <td style={{ padding: '16px 0', fontWeight: 'bold' }}>{inq.subject}</td>
                        <td style={{ padding: '16px 0', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.message}</td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={async () => {
                                await api.patch(`/admin/contact-inquiries/${inq.id}/read`, { isRead: !inq.is_read });
                                loadTabData();
                              }}
                              style={{ padding: '4px 8px', backgroundColor: '#222', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                            >
                              {inq.is_read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('inquiry', inq.id)}
                              style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: PRODUCT INQUIRIES
                ========================================== */}
            {activeTab === 'product_inquiries' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Product Inquiries ({productInquiries.length} entries)</span>
                  <button 
                    onClick={() => exportToCSV(productInquiries, 'product_inquiries')}
                    style={{ padding: '8px 16px', backgroundColor: '#111', border: '1px solid #222', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Export to CSV
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Date</th>
                      <th style={{ paddingBottom: '12px' }}>Client Info</th>
                      <th style={{ paddingBottom: '12px' }}>Product</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productInquiries.map(inq => (
                      <tr 
                        key={inq.id} 
                        style={{ borderBottom: '1px solid #151515', opacity: inq.is_read ? 0.7 : 1, cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onClick={() => setSelectedProductInquiry(inq)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px 0', color: '#aaa' }}>{new Date(inq.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 0' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{inq.full_name}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{inq.email}</div>
                          {inq.phone && <div style={{ fontSize: '11px', color: '#888' }}>{inq.phone}</div>}
                        </td>
                        <td style={{ padding: '16px 0', fontWeight: 'bold', color: '#d4af37' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {inq.product?.image_url && <img src={resolveImageUrl(inq.product.image_url)} alt="Product" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}
                            {inq.product?.name || 'Unknown Product'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={async () => {
                                await api.patch(`/admin/product-inquiries/${inq.id}/read`, { isRead: !inq.is_read });
                                loadTabData();
                              }}
                              style={{ padding: '4px 8px', backgroundColor: '#222', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                            >
                              {inq.is_read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button 
                              onClick={async () => {
                                if (!confirm('Delete this product inquiry?')) return;
                                await api.delete(`/admin/product-inquiries/${inq.id}`);
                                loadTabData();
                              }}
                              style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: NEWSLETTER REGISTRY
                ========================================== */}
            {activeTab === 'subscribers' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Priority Registry List ({subscribers.length} subscribers)</span>
                  <button 
                    onClick={() => exportToCSV(subscribers, 'newsletter_subscribers')}
                    style={{ padding: '8px 16px', backgroundColor: '#111', border: '1px solid #222', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Export to CSV
                  </button>
                </div>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222', color: '#888', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '12px' }}>Email Address</th>
                      <th style={{ paddingBottom: '12px' }}>Registration Source</th>
                      <th style={{ paddingBottom: '12px' }}>Created Date</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(sub => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #151515' }}>
                        <td style={{ padding: '14px 0', fontWeight: 'bold', color: 'white' }}>{sub.email}</td>
                        <td style={{ padding: '14px 0' }}>{sub.source}</td>
                        <td style={{ padding: '14px 0', color: '#888' }}>{new Date(sub.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteItem('subscriber', sub.id)}
                            style={{ padding: '4px 8px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ==========================================
                TAB: SEO MANAGEMENT
                ========================================== */}
            {activeTab === 'seo' && (
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', color: '#d4af37' }}>Search Engine Optimization</span>
                  <button 
                    onClick={saveSeoSettings}
                    style={{ padding: '8px 16px', background: 'var(--color-gold-gradient)', border: 'none', color: 'black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Save SEO Configuration
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {seoRoutes.map((route, idx) => (
                    <div key={idx} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Route: {route.path}</span>
                        <button 
                          onClick={() => {
                            const newRoutes = [...seoRoutes];
                            newRoutes.splice(idx, 1);
                            setSeoRoutes(newRoutes);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '11px', color: '#aaa' }}>Page Title *</label>
                          <input 
                            type="text" 
                            value={route.title} 
                            onChange={(e) => {
                              const newRoutes = [...seoRoutes];
                              newRoutes[idx].title = e.target.value;
                              setSeoRoutes(newRoutes);
                            }}
                            style={{ padding: '10px', backgroundColor: '#000', border: '1px solid #222', color: 'white', borderRadius: '4px' }} 
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '11px', color: '#aaa' }}>Meta Description *</label>
                          <textarea 
                            rows={2}
                            value={route.description} 
                            onChange={(e) => {
                              const newRoutes = [...seoRoutes];
                              newRoutes[idx].description = e.target.value;
                              setSeoRoutes(newRoutes);
                            }}
                            style={{ padding: '10px', backgroundColor: '#000', border: '1px solid #222', color: 'white', borderRadius: '4px', resize: 'vertical' }} 
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '11px', color: '#aaa' }}>Keywords (comma separated)</label>
                          <input 
                            type="text" 
                            value={route.keywords} 
                            onChange={(e) => {
                              const newRoutes = [...seoRoutes];
                              newRoutes[idx].keywords = e.target.value;
                              setSeoRoutes(newRoutes);
                            }}
                            style={{ padding: '10px', backgroundColor: '#000', border: '1px solid #222', color: 'white', borderRadius: '4px' }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setSeoRoutes([...seoRoutes, { path: '/new-route', title: '', description: '', keywords: '' }]);
                    }}
                    style={{ padding: '12px', background: 'transparent', border: '1px dashed #333', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}
                  >
                    + Add New Route
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                TAB: SETTINGS PANEL
                ========================================== */}
            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* 1. SMTP Settings */}
                <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', color: '#d4af37', marginBottom: '20px', fontWeight: 400 }}>SMTP Registry Configuration</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>SMTP Server Host</label>
                      <input type="text" value={smtpSettings.host || ''} onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>SMTP Port</label>
                      <input type="number" value={smtpSettings.port || ''} onChange={(e) => setSmtpSettings({ ...smtpSettings, port: parseInt(e.target.value) })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>SMTP Username / Login</label>
                      <input type="text" value={smtpSettings.username || ''} onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>SMTP Password</label>
                      <input type="password" value={smtpSettings.password || ''} onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>Sender Concierge Name</label>
                      <input type="text" value={smtpSettings.sender_name || ''} onChange={(e) => setSmtpSettings({ ...smtpSettings, sender_name: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>Sender Email Address</label>
                      <input type="email" value={smtpSettings.sender_email || ''} onChange={(e) => setSmtpSettings({ ...smtpSettings, sender_email: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleSaveSetting('settings.smtp', smtpSettings)}
                      style={{ padding: '10px 20px', background: 'var(--color-gold-gradient)', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Save SMTP Details
                    </button>
                    <button 
                      onClick={handleTestSmtp}
                      disabled={smtpTesting}
                      style={{ padding: '10px 20px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: smtpTesting ? 'default' : 'pointer' }}
                    >
                      {smtpTesting ? 'Testing Link...' : 'Test Connection Email'}
                    </button>
                  </div>
                  {smtpTestResult && (
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#111', borderLeft: '3px solid #d4af37', fontSize: '13px' }}>
                      {smtpTestResult}
                    </div>
                  )}
                </div>

                {/* 2. Google Analytics & SEO Injectors */}
                <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', color: '#d4af37', marginBottom: '20px', fontWeight: 400 }}>Analytics & Headers Injection</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>Google Analytics GA4 Measurement ID</label>
                      <input type="text" value={settings['settings.analytics']?.ga4_id || ''} onChange={(e) => {
                        const next = { ...settings['settings.analytics'], ga4_id: e.target.value };
                        setSettings({ ...settings, 'settings.analytics': next });
                      }} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>Custom Header Analytics Scripts (Facebook Pixel / Custom CSS)</label>
                      <textarea rows={4} value={settings['settings.analytics']?.header_scripts || ''} onChange={(e) => {
                        const next = { ...settings['settings.analytics'], header_scripts: e.target.value };
                        setSettings({ ...settings, 'settings.analytics': next });
                      }} style={{ padding: '12px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#aaa' }}>Custom Footer Script Injections (Live Chat / Tracking JS)</label>
                      <textarea rows={4} value={settings['settings.analytics']?.footer_scripts || ''} onChange={(e) => {
                        const next = { ...settings['settings.analytics'], footer_scripts: e.target.value };
                        setSettings({ ...settings, 'settings.analytics': next });
                      }} style={{ padding: '12px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', fontFamily: 'monospace' }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSaveSetting('settings.analytics', settings['settings.analytics'])}
                    style={{ padding: '10px 20px', background: 'var(--color-gold-gradient)', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Save Headers & Injectors
                  </button>
                </div>

                {/* 3. Backups & Maintenance */}
                <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', color: '#d4af37', marginBottom: '20px', fontWeight: 400 }}>System Control & Backups</h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px', backgroundColor: '#111', padding: '16px', borderRadius: '6px' }}>
                      <h4 style={{ fontSize: '13px', margin: '0 0 10px 0', color: 'white' }}>Website Mode</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          checked={settings['settings.maintenance']?.maintenance_mode || false}
                          onChange={(e) => {
                            const next = { maintenance_mode: e.target.checked };
                            setSettings({ ...settings, 'settings.maintenance': next });
                            handleSaveSetting('settings.maintenance', next);
                          }}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px' }}>Enable Maintenance Mode</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '220px', backgroundColor: '#111', padding: '16px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h4 style={{ fontSize: '13px', margin: 0, color: 'white' }}>Database Backup File</h4>
                      <a 
                        href={`${BASE_URL}/admin/backup?token=${token}`}
                        download
                        style={{
                          display: 'inline-block',
                          textAlign: 'center',
                          padding: '10px',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid var(--color-gold-base)',
                          color: 'var(--color-gold-light)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 'bold',
                          textDecoration: 'none'
                        }}
                      >
                        Download DB Backup JSON
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </main>

      {/* DRAWER / EDITING SLIDE-OUT PANEL */}
      {drawerOpen && editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '500px',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          borderLeft: '1px solid #1a1a1a',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.9)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out forwards',
          fontFamily: 'var(--font-sans)',
          color: 'white'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', color: '#d4af37', margin: 0 }}>
              {editingItem.id === '' || editingItem.id === undefined ? 'Create New' : 'Edit'} {drawerType}
            </h3>
            <button 
              onClick={() => setDrawerOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'red', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* SERVICE (TREATMENT) FORM */}
            {drawerType === 'treatment' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Unique ID / Slug *</label>
                  <input type="text" disabled={editingItem.slug} value={editingItem.id} onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Service Name *</label>
                  <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Tagline Description</label>
                  <input type="text" value={editingItem.tagline} onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Category ID</label>
                  <select value={editingItem.categoryId} onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }}>
                    <option value="facials-skincare">Facials & Skincare</option>
                    <option value="laser-hair-removal">Láser Hair Removal</option>
                    <option value="advanced-treatments">Advanced Skin & Body</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Price in Cents *</label>
                    <input type="number" value={editingItem.priceCents} onChange={(e) => setEditingItem({ ...editingItem, priceCents: parseInt(e.target.value) })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Duration (Minutes)</label>
                    <input type="number" value={editingItem.durationMinutes} onChange={(e) => setEditingItem({ ...editingItem, durationMinutes: parseInt(e.target.value) })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Recovery Info</label>
                  <input type="text" value={editingItem.recoveryText} onChange={(e) => setEditingItem({ ...editingItem, recoveryText: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Upload Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingItem({ ...editingItem, imageUrl: url }))} style={{ color: '#aaa', fontSize: '12px' }} />
                  <input type="text" value={editingItem.imageUrl} onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })} placeholder="Or enter URL" style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', marginTop: '6px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Icon Picker</label>
                  <select value={editingItem.iconKey} onChange={(e) => setEditingItem({ ...editingItem, iconKey: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }}>
                    <option value="sparkles">Sparkles</option>
                    <option value="droplet">Droplet</option>
                    <option value="zap">Zap</option>
                    <option value="shield">Shield</option>
                    <option value="heart">Heart</option>
                    <option value="sun">Sun</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Short Description *</label>
                  <textarea rows={3} value={editingItem.shortDescription} onChange={(e) => setEditingItem({ ...editingItem, shortDescription: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Scientific text</label>
                  <textarea rows={3} value={editingItem.scientificText || ''} onChange={(e) => setEditingItem({ ...editingItem, scientificText: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', resize: 'none' }} />
                </div>
              </>
            )}

            {/* PACKAGE FORM */}
            {drawerType === 'package' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Unique ID *</label>
                  <input type="text" disabled={editingItem.slug} value={editingItem.id} onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Package Name *</label>
                  <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Tagline</label>
                  <input type="text" value={editingItem.tagline} onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Price in Cents *</label>
                    <input type="number" value={editingItem.priceCents} onChange={(e) => setEditingItem({ ...editingItem, priceCents: parseInt(e.target.value) })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Value price cents (Strike)</label>
                    <input type="number" value={editingItem.valuePriceCents || ''} onChange={(e) => setEditingItem({ ...editingItem, valuePriceCents: parseInt(e.target.value) || null })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Feature Badge (e.g. Bestseller)</label>
                  <input type="text" value={editingItem.badge || ''} onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value || null })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
              </>
            )}

            {/* PRODUCT FORM */}
            {drawerType === 'product' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Product Name *</label>
                  <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Category Tagline (e.g. Serum) *</label>
                  <input type="text" value={editingItem.tagline} onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Price in Cents *</label>
                  <input type="number" value={editingItem.priceCents} onChange={(e) => setEditingItem({ ...editingItem, priceCents: parseInt(e.target.value) })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Upload Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingItem({ ...editingItem, imageUrl: url }))} style={{ color: '#aaa', fontSize: '12px' }} />
                  <input type="text" value={editingItem.imageUrl} onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })} placeholder="Or enter URL" style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', marginTop: '6px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Description</label>
                  <textarea rows={4} value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', resize: 'none' }} />
                </div>
              </>
            )}

            {/* BEFORE & AFTER FORM */}
            {drawerType === 'beforeafter' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Case ID / Slug *</label>
                  <input type="text" disabled={editingItem.slug} value={editingItem.id} onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Case Title *</label>
                  <input type="text" value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Case Subtitle</label>
                  <input type="text" value={editingItem.subtitle} onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Before Image URL *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingItem({ ...editingItem, beforeImageUrl: url }))} style={{ color: '#aaa', fontSize: '12px' }} />
                  <input type="text" value={editingItem.beforeImageUrl} onChange={(e) => setEditingItem({ ...editingItem, beforeImageUrl: e.target.value })} placeholder="Or enter URL" style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', marginTop: '6px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>After Image URL *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingItem({ ...editingItem, afterImageUrl: url }))} style={{ color: '#aaa', fontSize: '12px' }} />
                  <input type="text" value={editingItem.afterImageUrl} onChange={(e) => setEditingItem({ ...editingItem, afterImageUrl: e.target.value })} placeholder="Or enter URL" style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', marginTop: '6px' }} />
                </div>
              </>
            )}

          </div>

          <div style={{ padding: '24px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: '12px' }}>
            <button 
              onClick={async () => {
                try {
                  if (drawerType === 'treatment') {
                    if (editingItem.slug) {
                      await api.patch(`/admin/treatments/${editingItem.id}`, editingItem);
                    } else {
                      await api.post('/admin/treatments', editingItem);
                    }
                  } else if (drawerType === 'package') {
                    if (editingItem.slug) {
                      await api.patch(`/admin/packages/${editingItem.id}`, editingItem);
                    } else {
                      await api.post('/admin/packages', editingItem);
                    }
                  } else if (drawerType === 'product') {
                    if (editingItem.id) {
                      await api.patch(`/admin/products/${editingItem.id}`, editingItem);
                    } else {
                      await api.post('/admin/products', editingItem);
                    }
                  } else if (drawerType === 'beforeafter') {
                    if (editingItem.slug) {
                      await api.patch(`/admin/before-after/${editingItem.id}`, editingItem);
                    } else {
                      await api.post('/admin/before-after', editingItem);
                    }
                  }
                  setDrawerOpen(false);
                  loadTabData();
                } catch (err: any) {
                  alert(err.response?.data?.error || 'Save failed.');
                }
              }}
              style={{ flex: 1, padding: '12px', background: 'var(--color-gold-gradient)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Save Changes
            </button>
            <button 
              onClick={() => setDrawerOpen(false)}
              style={{ flex: 1, padding: '12px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product Inquiry Popup Modal */}
      {selectedProductInquiry && (
        <div 
          onClick={() => setSelectedProductInquiry(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #222',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <button 
              onClick={() => setSelectedProductInquiry(null)}
              style={{
                position: 'absolute',
                top: '20px', right: '20px',
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ color: '#d4af37', fontFamily: 'var(--font-serif)', margin: '0 0 24px 0', fontSize: '24px' }}>Product Inquiry Details</h2>
            
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
              <div style={{ flex: 1, backgroundColor: '#111', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>Client Information</h3>
                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px', fontSize: '16px' }}>{selectedProductInquiry.full_name}</div>
                <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '4px' }}>Email: {selectedProductInquiry.email}</div>
                {selectedProductInquiry.phone && <div style={{ color: '#aaa', fontSize: '13px' }}>Phone: {selectedProductInquiry.phone}</div>}
              </div>
              
              <div style={{ flex: 1, backgroundColor: '#111', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>Product of Interest</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedProductInquiry.product?.image_url && (
                    <img 
                      src={resolveImageUrl(selectedProductInquiry.product.image_url)} 
                      alt="Product" 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  )}
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                    {selectedProductInquiry.product?.name || 'Unknown Product'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>Message</h3>
              <p style={{ color: '#eee', fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedProductInquiry.message || 'No additional message provided.'}
              </p>
            </div>

            <div style={{ marginTop: '24px', fontSize: '12px', color: '#666', textAlign: 'right' }}>
              Received: {new Date(selectedProductInquiry.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out CSS animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
