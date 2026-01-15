
const STORAGE_KEY = 'propai_dashboard_data';

export const saveToDatabase = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Database Synced Successfully');
  } catch (error) {
    console.error('Database Sync Error:', error);
  }
};

export const loadFromDatabase = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Database Load Error:', error);
    return null;
  }
};

export const clearDatabase = () => {
  localStorage.removeItem(STORAGE_KEY);
};
