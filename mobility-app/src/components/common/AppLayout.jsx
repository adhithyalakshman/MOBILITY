import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#fff', color: '#0f172a',
          border: '1px solid #e2e8f0', borderRadius: '10px',
          fontFamily: 'Inter, sans-serif', fontSize: '13.5px',
          boxShadow: '0 4px 12px rgba(15,23,42,0.1)',
        },
        success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
      }} />
    </div>
  );
}
