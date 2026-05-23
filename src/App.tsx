import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSiteContent } from './hooks/useSiteContent';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Standings from './pages/Standings';
import Results from './pages/Results';
import Schedule from './pages/Schedule';
import Statistics from './pages/Statistics';
import Teams from './pages/Teams';
import Competitions from './pages/Competitions';
import Admin from './pages/Admin';
import Login from './pages/Login';

type Page = 'home' | 'standings' | 'results' | 'schedule' | 'statistics' | 'teams' | 'competitions' | 'admin';

function AppContent() {
  const [page, setPage] = useState<Page>('home');
  const { user, isAdmin } = useAuth();
  const { get } = useSiteContent();

  function renderPage() {
    if (page === 'admin' && !user) return <Login />;
    if (page === 'admin' && user) return <Admin />;
    switch (page) {
      case 'home': return <Home />;
      case 'standings': return <Standings />;
      case 'results': return <Results />;
      case 'schedule': return <Schedule />;
      case 'statistics': return <Statistics />;
      case 'teams': return <Teams />;
      case 'competitions': return <Competitions />;
      default: return <Home />;
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar current={page} onChange={setPage} />
      <div className="pt-16">
        {renderPage()}
      </div>
      <footer className="border-t border-white/5 mt-12 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-gradient-to-br from-pink-500 to-green-500 rotate-3" />
            <div className="relative w-full h-full rounded bg-black flex items-center justify-center">
              <span className="font-black text-[7px] tracking-tighter">
                <span className="text-pink-500">J</span>
                <span className="text-white">T</span>
                <span className="text-green-500">S</span>
              </span>
            </div>
          </div>
          <span className="text-gray-600 text-xs tracking-widest">JAWORZNICKI TURNIEJ SZOSTEK</span>
        </div>
        <p className="text-gray-700 text-[10px] tracking-wider" dangerouslySetInnerHTML={{ __html: get('footer_text', 'ORLIK &bull; JAWORZNO &bull; 2026') }} />
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
