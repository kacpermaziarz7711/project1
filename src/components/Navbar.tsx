import { useState } from 'react';
import { Menu, X, Youtube, Facebook, Music2, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useAuth, signOut } from '../hooks/useAuth';

type Page = 'home' | 'standings' | 'results' | 'schedule' | 'statistics' | 'teams' | 'competitions' | 'admin';

interface NavbarProps {
  current: Page;
  onChange: (p: Page) => void;
}

const links: { id: Page; label: string; adminOnly?: boolean }[] = [
  { id: 'home', label: 'NA ZYWO' },
  { id: 'standings', label: 'TABELA' },
  { id: 'results', label: 'WYNIKI' },
  { id: 'schedule', label: 'TERMINARZ' },
  { id: 'statistics', label: 'STATYSTYKI' },
  { id: 'teams', label: 'DRUZYNY' },
  { id: 'competitions', label: 'ROZGRYWKI' },
  { id: 'admin', label: 'ADMIN', adminOnly: true },
];

export default function Navbar({ current, onChange }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  async function handleLogout() {
    await signOut();
    setUserMenuOpen(false);
  }

  const visibleLinks = links.filter(l => !l.adminOnly || isAdmin);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-pink-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onChange('home')}
            className="flex items-center gap-3 group"
          >
            {/* Title sponsor logo */}
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-white/10">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/20 flex items-center justify-center group-hover:border-yellow-500/40 transition-colors">
                <span className="text-yellow-400 font-black text-[8px] tracking-wider leading-none text-center">
                  SPON<br />SOR
                </span>
              </div>
            </div>

            {/* JTS Logo */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-pink-500 to-green-500 rotate-6 group-hover:rotate-12 transition-transform" />
              <div className="relative w-full h-full rounded-lg bg-black flex items-center justify-center">
                <span className="font-black text-sm tracking-tighter">
                  <span className="text-pink-500">J</span>
                  <span className="text-white">T</span>
                  <span className="text-green-500">S</span>
                </span>
              </div>
            </div>
            <div className="leading-none hidden sm:block">
              <div className="text-white font-black text-sm tracking-widest">JTS</div>
              <div className="text-[8px] tracking-[0.15em] text-gray-400 font-medium">JAWORZNICKI TURNIEJ SZOSTEK</div>
            </div>

            {/* Social icons */}
            <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-white/10">
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                <Youtube size={13} />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all">
                <Facebook size={13} />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Music2 size={13} />
              </a>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-0.5">
            {visibleLinks.map(l => (
              <button
                key={l.id}
                onClick={() => onChange(l.id)}
                className={`px-3 py-2 text-[11px] font-bold tracking-widest transition-all duration-200 rounded ${
                  current === l.id
                    ? 'text-black bg-gradient-to-r from-pink-500 to-green-500'
                    : l.adminOnly
                      ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </button>
            ))}
            {!user ? (
              <button
                onClick={() => onChange('admin')}
                className="ml-2 px-3 py-2 text-[11px] font-bold tracking-widest text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all duration-200 rounded flex items-center gap-1.5"
              >
                <Lock size={11} /> ZALOGUJ
              </button>
            ) : (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="px-3 py-2 text-[11px] font-bold tracking-widest text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-all duration-200 rounded flex items-center gap-1.5"
                >
                  {user.email} <ChevronDown size={11} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-pink-600/30 rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-xs font-bold tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <LogOut size={12} /> WYLOGUJ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-black border-t border-pink-600/20 px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
          {/* Title sponsor mobile */}
          <div className="flex items-center gap-2 px-4 pb-3 border-b border-white/5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/20 flex items-center justify-center">
              <span className="text-yellow-400 font-black text-[7px] tracking-wider leading-none text-center">
                SPON<br />SOR
              </span>
            </div>
            <span className="text-gray-500 text-[10px] font-bold tracking-wider">SPONSOR TYTULARNY</span>
          </div>

          {visibleLinks.map(l => (
            <button
              key={l.id}
              onClick={() => { onChange(l.id); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest rounded transition-all ${
                current === l.id
                  ? 'text-black bg-gradient-to-r from-pink-500 to-green-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </button>
          ))}
          {!user ? (
            <button
              onClick={() => { onChange('admin'); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-xs font-bold tracking-widest rounded text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all flex items-center gap-2"
            >
              <Lock size={12} /> ZALOGUJ SIE
            </button>
          ) : (
            <>
              <div className="px-4 py-3 text-xs font-bold tracking-widest text-pink-400">
                {user.email}
              </div>
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="w-full text-left px-4 py-3 text-xs font-bold tracking-widest rounded text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <LogOut size={12} /> WYLOGUJ
              </button>
            </>
          )}
          <div className="flex items-center gap-2 px-4 pt-3 border-t border-white/5 mt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
              <Youtube size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all">
              <Facebook size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <Music2 size={14} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
