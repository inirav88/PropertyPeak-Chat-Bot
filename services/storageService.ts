
const STORAGE_KEY = 'propai_dashboard_data';

const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // Production VPS Domain
    if (window.location.hostname === 'chatbot.orangewebservice.com') {
      return 'https://chatbot.orangewebservice.com';
    }
    // Local Dev
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://localhost:3000`;
    }
    return window.location.origin;
  }
  return `http://localhost:3000`;
};

const BACKEND_URL = getBackendUrl();

export const saveToDatabase = async (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    if (data.config) {
      await fetch(`${BACKEND_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.config),
        mode: 'cors'
      });
      console.log('✅ VPS Data Synced');
    }
  } catch (error) {
    console.warn('📡 Sync Note: Offline or API unreachable.', error);
  }
};

export const loadFromDatabase = async () => {
  const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  try {
    const [configRes, leadsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/config`, { mode: 'cors' }),
      fetch(`${BACKEND_URL}/api/leads`, { mode: 'cors' })
    ]);
    if (configRes.ok && leadsRes.ok) {
      const config = await configRes.json();
      const leads = await leadsRes.json();
      return { ...localData, config, leads };
    }
  } catch (e) { console.log('Using local cache.'); }
  return Object.keys(localData).length > 0 ? localData : null;
};
