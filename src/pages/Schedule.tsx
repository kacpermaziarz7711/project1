import { useMatches } from '../hooks/useTournament';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { CalendarDays, Clock, Radio } from 'lucide-react';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pl-PL', { weekday: 'long', day: '2-digit', month: 'long' });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export default function Schedule() {
  const { matches, loading } = useMatches();
  const { isAdmin } = useAuth();
  const upcoming = matches.filter(m => m.status === 'scheduled');

  const byRound = upcoming.reduce<Record<number, typeof upcoming>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
            <CalendarDays size={20} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-wider">TERMINARZ</h1>
            <p className="text-gray-500 text-xs">Nadchodzace mecze &bull; Sezon 2026</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-900/60 rounded-xl animate-pulse" />)}
          </div>
        ) : rounds.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Wszystkie mecze zostaly rozegrane</p>
          </div>
        ) : (
          <div className="space-y-8">
            {rounds.map(round => (
              <div key={round}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-pink-600/20 to-green-600/20 border border-white/10 rounded-full">
                    <span className="text-xs font-bold tracking-widest text-white">KOLEJKA {round}</span>
                  </div>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="space-y-3">
                  {byRound[round].map(m => (
                    <ScheduleCard key={m.id} match={m} isAdmin={isAdmin} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full calendar overview */}
        <div className="mt-10">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-4">PELNY HARMONOGRAM</h2>
          <div className="bg-gray-900/40 border border-white/5 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_1fr_1fr] gap-px bg-white/5">
              <div className="bg-black/60 px-3 py-2 text-[10px] font-bold text-gray-500 tracking-widest">KOL</div>
              <div className="bg-black/60 px-3 py-2 text-[10px] font-bold text-gray-500 tracking-widest">DATA</div>
              <div className="bg-black/60 px-3 py-2 text-[10px] font-bold text-gray-500 tracking-widest">MECZ</div>
              <div className="bg-black/60 px-3 py-2 text-[10px] font-bold text-gray-500 tracking-widest">STATUS</div>
            </div>
            {matches.map(m => (
              <div key={m.id} className="grid grid-cols-[3rem_1fr_1fr_1fr] gap-px bg-white/5 hover:bg-white/[0.03] transition-colors">
                <div className="bg-black px-3 py-3 text-sm font-bold text-gray-400">{m.round}</div>
                <div className="bg-black px-3 py-3 text-xs text-gray-400">
                  <div>{formatDate(m.match_date)}</div>
                  <div className="text-gray-600 text-[10px] flex items-center gap-1 mt-0.5">
                    <Clock size={9} />{formatTime(m.match_date)}
                  </div>
                </div>
                <div className="bg-black px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <TeamBadge color={m.home_team?.color} letter={m.home_team?.logo_letter} />
                    <span className="text-white text-xs font-semibold">{m.home_team?.short_name}</span>
                    <span className="text-gray-600 text-xs">vs</span>
                    <span className="text-white text-xs font-semibold">{m.away_team?.short_name}</span>
                    <TeamBadge color={m.away_team?.color} letter={m.away_team?.logo_letter} />
                  </div>
                  {m.status === 'finished' && (
                    <div className="text-gray-500 text-xs mt-0.5 font-black">{m.home_score} : {m.away_score}</div>
                  )}
                </div>
                <div className="bg-black px-3 py-3 flex items-center">
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({ match: m, isAdmin }: { match: ReturnType<typeof useMatches>['matches'][0]; isAdmin?: boolean }) {
  async function setLive() {
    // Reset all matches to not live
    await supabase.from('matches').update({ is_live: false }).neq('id', m.id);
    // Set this match as live
    await supabase.from('matches').update({ is_live: true }).eq('id', m.id);
    // Update live_score table
    const { data: liveScore } = await supabase.from('live_score').select('id').limit(1).maybeSingle();
    if (liveScore) {
      await supabase.from('live_score').update({ live_match_id: m.id }).eq('id', liveScore.id);
    }
    window.location.reload();
  }

  return (
    <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-green-500/20 transition-all group">
      <div className="flex items-center px-4 py-2 bg-black/20 gap-2">
        <Clock size={10} className="text-green-400" />
        <span className="text-[10px] text-gray-500 font-medium capitalize">
          {formatDate(m.match_date)} &bull; {formatTime(m.match_date)}
        </span>
        {isAdmin && (
          <button
            onClick={setLive}
            className="ml-auto px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold tracking-widest rounded hover:bg-red-500/30 transition-colors flex items-center gap-1"
          >
            <Radio size={8} /> LIVE
          </button>
        )}
      </div>
      <div className="px-6 py-5 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all"
            style={{ backgroundColor: m.home_team?.color || '#374151' }}
          >
            {m.home_team?.logo_letter}
          </div>
          <div>
            <div className="text-white font-black text-sm">{m.home_team?.name}</div>
            <div className="text-gray-500 text-xs">{m.home_team?.short_name}</div>
          </div>
        </div>

        <div className="flex flex-col items-center px-4">
          <div className="text-gray-600 text-xs font-bold tracking-widest">VS</div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-pink-600 to-green-600 mt-1.5 rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="text-right">
            <div className="text-white font-black text-sm">{m.away_team?.name}</div>
            <div className="text-gray-500 text-xs">{m.away_team?.short_name}</div>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all"
            style={{ backgroundColor: m.away_team?.color || '#374151' }}
          >
            {m.away_team?.logo_letter}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamBadge({ color, letter }: { color?: string; letter?: string }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
      style={{ backgroundColor: color || '#374151' }}
    >
      {letter}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'finished') return <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">KONIEC</span>;
  if (status === 'live') return <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full animate-pulse">NA ZYWO</span>;
  return <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">PLANOWANY</span>;
}
