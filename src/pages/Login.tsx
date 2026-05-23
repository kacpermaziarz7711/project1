import { useState } from 'react';
import { signIn, signUp } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fn = isRegister ? signUp : signIn;
    const { error: err } = await fn(email, password);

    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Nieprawidlowy email lub haslo' : err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500 to-green-500 rotate-6" />
            <div className="relative w-full h-full rounded-xl bg-black flex items-center justify-center">
              <span className="font-black text-lg tracking-tighter">
                <span className="text-pink-500">J</span>
                <span className="text-white">T</span>
                <span className="text-green-500">S</span>
              </span>
            </div>
          </div>
          <h1 className="text-white font-black text-xl tracking-wider">
            {isRegister ? 'REJESTRACJA' : 'LOGOWANIE'}
          </h1>
          <p className="text-gray-500 text-xs mt-1">Panel administracyjny JTS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest block mb-1.5">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl bg-white/5 text-white text-sm px-4 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600"
              placeholder="admin@jts.pl"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest block mb-1.5">HASLO</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-11 rounded-xl bg-white/5 text-white text-sm px-4 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600"
              placeholder="********"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '...' : isRegister ? 'ZAREJESTRUJ SIE' : 'ZALOGUJ SIE'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {isRegister ? 'Masz juz konto? Zaloguj sie' : 'Nie masz konta? Zarejestruj sie'}
          </button>
        </div>

        <p className="text-gray-700 text-[10px] text-center mt-6">
          Po rejestracji skontaktuj sie z administratorem aby uzyskac dostep
        </p>
      </div>
    </div>
  );
}
