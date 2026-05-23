import { useState } from 'react';
import { Radio, Clock, ChevronRight, Plus, Trash2, Square, Settings, ChevronDown, ChevronUp, Play, Eye } from 'lucide-react';
import { useLiveScore, useLiveEvents, useLiveAdmin, useMatches } from '../hooks/useTournament';
import { useSiteContent, useSponsors } from '../hooks/useSiteContent';
import type { LiveEvent } from '../lib/supabase';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const EVENT_TYPES: { value: LiveEvent['event_type']; label: string }[] = [
  { value: 'goal', label: 'GOL' },
  { value: 'yellow_card', label: 'ZOLTA' },
  { value: 'red_card', label: 'CZERWONA' },
  { value: 'substitution', label: 'ZMIANA' },
  { value: 'other', label: 'INNE' },
];

const EXAMPLE_LIVE = {
  homeTeam: { name: 'ORLY WARSZAWA', short: 'ORL', color: '#e91e8c', letter: 'O' },
  awayTeam: { name: 'ZIELONA SILA', short: 'ZSI', color: '#22c55e', letter: 'Z' },
  homeScore: 2,
  awayScore: 1,
  minute: 15,
  homeEvents: [
    { id: '1', minute: 3, type: 'goal' as const, player: 'Marek Kowalski' },
    { id: '4', minute: 13, type: 'yellow_card' as const, player: 'Tomasz Bialy' },
    { id: '5', minute: 15, type: 'goal' as const, player: 'Marek Kowalski' },
  ],
  awayEvents: [
    { id: '2', minute: 7, type: 'yellow_card' as const, player: 'Piotr Nowak' },
    { id: '3', minute: 11, type: 'goal' as const, player: 'Adam Wojcik' },
  ],
};

export default function Home() {
  const live = useLiveScore();
  const { matches } = useMatches();
  const { get } = useSiteContent();
  const { sponsors } = useSponsors();
  const [adminOpen, setAdminOpen] = useState(false);
  const [showLive, setShowLive] = useState(false);

  const currentMatchId = live?.current_match_id ?? null;
  const { events, addEvent, removeEvent } = useLiveEvents(currentMatchId);
  const { updateLiveScore, startMatch, endMatch } = useLiveAdmin();

  const nextMatches = matches.filter(m => m.status === 'scheduled').slice(0, 3);
  const recentMatches = matches.filter(m => m.status === 'finished').slice(-3).reverse();

  const videoId = live?.youtube_video_id || 'dQw4w9WgXcQ';
  const isLive = live?.is_live ?? false;
  const liveMatch = currentMatchId ? matches.find(m => m.id === currentMatchId) : null;

  const homeYellows = events.filter(e => e.event_type === 'yellow_card' && e.team_side === 'home');
  const awayYellows = events.filter(e => e.event_type === 'yellow_card' && e.team_side === 'away');
  const homeReds = events.filter(e => e.event_type === 'red_card' && e.team_side === 'home');
  const awayReds = events.filter(e => e.event_type === 'red_card' && e.team_side === 'away');

  const homeEvents = events.filter(e => e.team_side === 'home');
  const awayEvents = events.filter(e => e.team_side === 'away');

  const titleSponsor = sponsors.find(s => s.tier === 'title');
  const otherSponsors = sponsors.filter(s => s.tier !== 'title');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Sponsors */}
        <div className="mb-6 bg-gray-900/40 border border-white/5 rounded-xl p-4">
          <div className="text-center mb-3">
            <span className="text-[9px] font-bold tracking-[0.3em] text-gray-500">SPONSORZY TURNIEJU</span>
          </div>
          <div className="flex gap-4">
            {/* Title sponsor */}
            {titleSponsor && (
              <div className="flex-shrink-0 flex flex-col items-center gap-2 px-6 py-4 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer group w-32">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center group-hover:from-yellow-500/30 group-hover:to-amber-600/30 transition-all ring-2 ring-yellow-500/10">
                  {titleSponsor.logo_url ? (
                    <img src={titleSponsor.logo_url} alt={titleSponsor.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className="text-yellow-400 font-black text-2xl">{titleSponsor.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-yellow-400/80 text-[10px] font-bold tracking-wider text-center leading-tight group-hover:text-yellow-300 transition-colors">{titleSponsor.name}</span>
                <span className="text-yellow-600/40 text-[7px] tracking-[0.2em] font-bold">SPONSOR TYTULARNY</span>
              </div>
            )}

            {/* Other sponsors grid */}
            {otherSponsors.length > 0 && (
              <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {otherSponsors.map(s => (
                  <div key={s.id} className="flex flex-col items-center gap-1 px-2 py-2 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/15 transition-all cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {s.logo_url ? (
                        <img src={s.logo_url} alt={s.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="font-black text-xs text-gray-400">{s.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-[7px] font-bold tracking-wider text-center leading-tight">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* About section */}
        <div className="mb-6 bg-gradient-to-br from-pink-600/8 to-green-600/8 border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500 to-green-500 rotate-3" />
              <div className="relative w-full h-full rounded-xl bg-black flex items-center justify-center">
                <span className="font-black text-sm tracking-tighter">
                  <span className="text-pink-500">J</span>
                  <span className="text-white">T</span>
                  <span className="text-green-500">S</span>
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-white font-black text-lg tracking-wider">{get('tournament_name', 'JAWORZNICKI TURNIEJ SZOSTEK')}</h2>
              <p className="text-gray-500 text-[10px] tracking-[0.2em] font-bold" dangerouslySetInnerHTML={{ __html: get('tournament_subtitle', 'JTS &bull; OD 2024 ROKU &bull; JAWORZNO') }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-bold text-sm mb-2">O turnieju</h3>
              <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">{get('about_tournament')}</p>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-2">Kim jestesmy</h3>
              <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">{get('about_us')}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-white font-black text-2xl">{get('stat_teams', '6')}</div>
              <div className="text-gray-600 text-[9px] tracking-widest mt-0.5">{get('stat_teams_label', 'DRUZYNY')}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-white font-black text-2xl">{get('stat_rounds', '5')}</div>
              <div className="text-gray-600 text-[9px] tracking-widest mt-0.5">{get('stat_rounds_label', 'KOLEJKI')}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-white font-black text-2xl">{get('stat_matches', '15')}</div>
              <div className="text-gray-600 text-[9px] tracking-widest mt-0.5">{get('stat_matches_label', 'MECZE')}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-white font-black text-2xl">{get('stat_duration', '2x12')}</div>
              <div className="text-gray-600 text-[9px] tracking-widest mt-0.5">{get('stat_duration_label', 'MINUTY')}</div>
            </div>
          </div>
        </div>

        {/* Live button */}
        <div className="mb-6">
          <button
            onClick={() => setShowLive(!showLive)}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-3 ${
              showLive
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20'
                : 'bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 border border-red-500/20 hover:border-red-500/40 hover:from-red-600/30 hover:to-red-700/30'
            }`}
          >
            <Radio size={18} className={showLive ? 'animate-pulse' : ''} />
            {showLive ? get('live_button_active_text', 'TRANSMISJA NA ZYWO - AKTYWNA') : get('live_button_text', 'OGLADAJ TRANSMISJE NA ZYWO')}
            <Play size={14} />
          </button>
        </div>

        {/* Live broadcast section */}
        {showLive && (
          <div className="mb-6 space-y-4">
            <div className="relative">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                <Radio size={10} /> LIVE
              </div>
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden ring-1 ring-red-500/20">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                  title="Transmisja turnieju"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>

            {isLive && liveMatch ? (
              <LiveMatchTracker
                live={live} liveMatch={liveMatch}
                homeEvents={homeEvents} awayEvents={awayEvents}
                homeYellows={homeYellows} awayYellows={awayYellows}
                homeReds={homeReds} awayReds={awayReds}
                adminOpen={adminOpen} setAdminOpen={setAdminOpen}
                addEvent={addEvent} removeEvent={removeEvent}
                updateLiveScore={updateLiveScore}
                startMatch={startMatch} endMatch={endMatch}
                matches={matches}
              />
            ) : (
              <ExampleLiveMatch />
            )}
          </div>
        )}

        {/* Side panels */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Clock size={14} className="text-green-400" />
              <span className="text-xs font-bold tracking-widest text-gray-300">NADCHODZACE</span>
            </div>
            {nextMatches.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">Brak zaplanowanych meczy</div>
            ) : (
              <div className="divide-y divide-white/5">
                {nextMatches.map(m => (
                  <div key={m.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                    <div className="text-[10px] text-gray-500 mb-1.5 font-medium">{formatDate(m.match_date)} &bull; kolejka {m.round}</div>
                    <div className="flex items-center gap-2">
                      <TeamBadge color={m.home_team?.color} letter={m.home_team?.logo_letter} />
                      <span className="text-white text-xs font-semibold flex-1 truncate">{m.home_team?.short_name}</span>
                      <span className="text-gray-500 text-xs font-bold">vs</span>
                      <span className="text-white text-xs font-semibold flex-1 text-right truncate">{m.away_team?.short_name}</span>
                      <TeamBadge color={m.away_team?.color} letter={m.away_team?.logo_letter} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <ChevronRight size={14} className="text-pink-400" />
              <span className="text-xs font-bold tracking-widest text-gray-300">OSTATNIE WYNIKI</span>
            </div>
            {recentMatches.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">Brak rozegranych meczy</div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentMatches.map(m => (
                  <div key={m.id} className="px-4 py-3">
                    <div className="text-[10px] text-gray-500 mb-1.5">kolejka {m.round}</div>
                    <div className="flex items-center gap-2">
                      <TeamBadge color={m.home_team?.color} letter={m.home_team?.logo_letter} />
                      <span className="text-white text-xs font-semibold flex-1 truncate">{m.home_team?.short_name}</span>
                      <span className="text-white text-sm font-black tabular-nums px-2 bg-black/40 rounded py-0.5">{m.home_score} : {m.away_score}</span>
                      <span className="text-white text-xs font-semibold flex-1 text-right truncate">{m.away_team?.short_name}</span>
                      <TeamBadge color={m.away_team?.color} letter={m.away_team?.logo_letter} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Eye size={14} className="text-blue-400" />
              <span className="text-xs font-bold tracking-widest text-gray-300">TABELA SKROCONA</span>
            </div>
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              Sprawdz pelna tabele w zakladce <span className="text-white font-bold">TABELA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExampleLiveMatch() {
  const e = EXAMPLE_LIVE;
  const maxRows = Math.max(e.homeEvents.length, e.awayEvents.length);

  return (
    <div className="bg-gradient-to-b from-gray-900/80 to-black border border-red-500/20 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-red-600/10">
        <div className="flex items-center gap-2">
          <Radio size={12} className="text-red-500 animate-pulse" />
          <span className="text-red-400 text-[10px] font-bold tracking-widest">NA ZYWO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-black tabular-nums">{e.minute}'</span>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-2 ring-2 ring-white/10" style={{ backgroundColor: e.homeTeam.color }}>{e.homeTeam.letter}</div>
          <div className="text-white font-black text-sm">{e.homeTeam.name}</div>
          <div className="text-gray-500 text-[10px] mt-0.5">{e.homeTeam.short}</div>
        </div>
        <div className="flex items-center gap-3 px-4">
          <span className="text-6xl font-black text-white tabular-nums">{e.homeScore}</span>
          <span className="text-pink-500 font-black text-2xl">:</span>
          <span className="text-6xl font-black text-white tabular-nums">{e.awayScore}</span>
        </div>
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-2 ring-2 ring-white/10" style={{ backgroundColor: e.awayTeam.color }}>{e.awayTeam.letter}</div>
          <div className="text-white font-black text-sm">{e.awayTeam.name}</div>
          <div className="text-gray-500 text-[10px] mt-0.5">{e.awayTeam.short}</div>
        </div>
      </div>

      <div className="px-5 py-1.5 flex items-center justify-between border-b border-white/5 bg-black/30">
        <div className="flex items-center gap-1">
          {e.homeEvents.filter(ev => ev.type === 'yellow_card').map((_, i) => <div key={i} className="w-2.5 h-3 rounded-[1px] bg-yellow-400" />)}
        </div>
        <span className="text-[10px] text-gray-600 tracking-widest font-bold">PRZEBIEG MECZU</span>
        <div className="flex items-center gap-1">
          {e.awayEvents.filter(ev => ev.type === 'yellow_card').map((_, i) => <div key={i} className="w-2.5 h-3 rounded-[1px] bg-yellow-400" />)}
        </div>
      </div>

      <div className="px-5 py-3">
        {Array.from({ length: maxRows }).map((_, i) => {
          const homeEv = e.homeEvents[i];
          const awayEv = e.awayEvents[i];
          return (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <div className="flex-1 flex items-center gap-2 justify-end">
                {homeEv ? (
                  <>
                    <span className="text-white text-xs font-semibold text-right">{homeEv.player}</span>
                    <div className="flex items-center gap-1">
                      {homeEv.type === 'goal' && <span className="text-green-400 font-black text-[10px]">GOL</span>}
                      {homeEv.type === 'yellow_card' && <div className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />}
                      {homeEv.type === 'red_card' && <div className="w-2.5 h-3.5 rounded-[1px] bg-red-500" />}
                    </div>
                    <span className="text-gray-600 text-[10px] font-bold tabular-nums">{homeEv.minute}'</span>
                  </>
                ) : <div className="flex-1" />}
              </div>
              <div className="w-px h-5 bg-white/5 flex-shrink-0" />
              <div className="flex-1 flex items-center gap-2">
                {awayEv ? (
                  <>
                    <span className="text-gray-600 text-[10px] font-bold tabular-nums">{awayEv.minute}'</span>
                    <div className="flex items-center gap-1">
                      {awayEv.type === 'goal' && <span className="text-green-400 font-black text-[10px]">GOL</span>}
                      {awayEv.type === 'yellow_card' && <div className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />}
                      {awayEv.type === 'red_card' && <div className="w-2.5 h-3.5 rounded-[1px] bg-red-500" />}
                    </div>
                    <span className="text-white text-xs font-semibold">{awayEv.player}</span>
                  </>
                ) : <div className="flex-1" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-2.5 border-t border-white/5 bg-yellow-500/5 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-yellow-400 text-[10px] font-bold tracking-widest">CZAS ZATRZYMANY &bull; {e.minute}'</span>
      </div>
    </div>
  );
}

function LiveMatchTracker({
  live, liveMatch, homeEvents, awayEvents, homeYellows, awayYellows, homeReds, awayReds,
  adminOpen, setAdminOpen, addEvent, removeEvent, updateLiveScore, startMatch, endMatch, matches,
}: {
  live: any; liveMatch: any; homeEvents: LiveEvent[]; awayEvents: LiveEvent[];
  homeYellows: any[]; awayYellows: any[]; homeReds: any[]; awayReds: any[];
  adminOpen: boolean; setAdminOpen: (v: boolean) => void;
  addEvent: (e: Omit<LiveEvent, 'id' | 'created_at'>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  updateLiveScore: (u: any) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  endMatch: (matchId: string, hs: number, as: number) => Promise<void>;
  matches: any[];
}) {
  const maxRows = Math.max(homeEvents.length, awayEvents.length);

  return (
    <div className="bg-gradient-to-b from-gray-900/80 to-black border border-red-500/20 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-red-600/10">
        <div className="flex items-center gap-2">
          <Radio size={12} className="text-red-500 animate-pulse" />
          <span className="text-red-400 text-[10px] font-bold tracking-widest">NA ZYWO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-black tabular-nums">{live?.minute ?? 0}'</span>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-2 ring-2 ring-white/10" style={{ backgroundColor: liveMatch.home_team?.color }}>{liveMatch.home_team?.logo_letter}</div>
          <div className="text-white font-black text-sm">{liveMatch.home_team?.name}</div>
          <div className="text-gray-500 text-[10px] mt-0.5">{liveMatch.home_team?.short_name}</div>
        </div>
        <div className="flex items-center gap-3 px-4">
          <span className="text-6xl font-black text-white tabular-nums">{live?.home_score ?? 0}</span>
          <span className="text-pink-500 font-black text-2xl">:</span>
          <span className="text-6xl font-black text-white tabular-nums">{live?.away_score ?? 0}</span>
        </div>
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-2 ring-2 ring-white/10" style={{ backgroundColor: liveMatch.away_team?.color }}>{liveMatch.away_team?.logo_letter}</div>
          <div className="text-white font-black text-sm">{liveMatch.away_team?.name}</div>
          <div className="text-gray-500 text-[10px] mt-0.5">{liveMatch.away_team?.short_name}</div>
        </div>
      </div>

      <div className="px-5 py-1.5 flex items-center justify-between border-b border-white/5 bg-black/30">
        <div className="flex items-center gap-1">
          {homeYellows.map((_, i) => <div key={i} className="w-2.5 h-3 rounded-[1px] bg-yellow-400" />)}
          {homeReds.map((_, i) => <div key={i} className="w-2.5 h-3 rounded-[1px] bg-red-500" />)}
        </div>
        <span className="text-[10px] text-gray-600 tracking-widest font-bold">PRZEBIEG MECZU</span>
        <div className="flex items-center gap-1">
          {awayReds.map((_, i) => <div key={i} className="w-2.5 h-3 rounded-[1px] bg-red-500" />)}
          {awayYellows.map((_, i) => <div key={i} className="w-2.5 h-3 rounded-[1px] bg-yellow-400" />)}
        </div>
      </div>

      <div className="px-5 py-3 max-h-64 overflow-y-auto">
        {homeEvents.length === 0 && awayEvents.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-4">Brak zdarzen w meczu</p>
        ) : (
          Array.from({ length: maxRows }).map((_, i) => {
            const homeEv = homeEvents[i];
            const awayEv = awayEvents[i];
            return (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className="flex-1 flex items-center gap-2 justify-end">
                  {homeEv ? (
                    <>
                      <span className="text-white text-xs font-semibold text-right truncate">{homeEv.player_name}</span>
                      <EventIcon type={homeEv.event_type} />
                      <span className="text-gray-600 text-[10px] font-bold tabular-nums">{homeEv.minute}'</span>
                    </>
                  ) : <div className="flex-1" />}
                </div>
                <div className="w-px h-5 bg-white/5 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  {awayEv ? (
                    <>
                      <span className="text-gray-600 text-[10px] font-bold tabular-nums">{awayEv.minute}'</span>
                      <EventIcon type={awayEv.event_type} />
                      <span className="text-white text-xs font-semibold truncate">{awayEv.player_name}</span>
                    </>
                  ) : <div className="flex-1" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-white/5">
        <button onClick={() => setAdminOpen(!adminOpen)} className="w-full px-5 py-2.5 flex items-center justify-center gap-2 text-gray-500 hover:text-white text-xs font-bold tracking-widest transition-colors">
          <Settings size={12} /> PROWADZENIE MECZU {adminOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {adminOpen && (
          <AdminPanel live={live} liveMatch={liveMatch} events={[...homeEvents, ...awayEvents]} addEvent={addEvent} removeEvent={removeEvent} updateLiveScore={updateLiveScore} startMatch={startMatch} endMatch={endMatch} matches={matches} />
        )}
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  if (type === 'goal') return <span className="text-green-400 font-black text-[10px]">GOL</span>;
  if (type === 'yellow_card') return <div className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />;
  if (type === 'red_card') return <div className="w-2.5 h-3.5 rounded-[1px] bg-red-500" />;
  if (type === 'substitution') return <span className="text-blue-400 font-black text-[10px]">ZMIANA</span>;
  return <span className="text-gray-400 text-[10px]">INNE</span>;
}

function AdminPanel({
  live, liveMatch, events, addEvent, removeEvent, updateLiveScore, startMatch, endMatch, matches,
}: {
  live: any; liveMatch: any; events: LiveEvent[];
  addEvent: (e: Omit<LiveEvent, 'id' | 'created_at'>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  updateLiveScore: (u: any) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  endMatch: (matchId: string, hs: number, as: number) => Promise<void>;
  matches: any[];
}) {
  const [eventType, setEventType] = useState<LiveEvent['event_type']>('goal');
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');
  const [playerName, setPlayerName] = useState('');
  const [description, setDescription] = useState('');
  const [minute, setMinute] = useState(live?.minute ?? 0);

  async function handleAddEvent() {
    if (!live?.current_match_id) return;
    await addEvent({ match_id: live.current_match_id, event_type: eventType, minute, player_name: playerName, team_side: teamSide, description });
    if (eventType === 'goal') {
      await updateLiveScore({ home_score: live.home_score + (teamSide === 'home' ? 1 : 0), away_score: live.away_score + (teamSide === 'away' ? 1 : 0) });
    }
    setPlayerName(''); setDescription('');
  }

  async function handleMinuteChange(m: number) {
    setMinute(m);
    await updateLiveScore({ minute: m });
  }

  async function handleEndMatch() {
    if (!live?.current_match_id) return;
    await endMatch(live.current_match_id, live.home_score, live.away_score);
  }

  return (
    <div className="p-4 bg-black/60 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs font-bold tracking-widest">MINUTA:</span>
        <div className="flex items-center gap-1">
          <button onClick={() => handleMinuteChange(Math.max(0, minute - 1))} className="w-8 h-8 rounded-lg bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">-</button>
          <input type="number" value={minute} onChange={e => handleMinuteChange(parseInt(e.target.value) || 0)} className="w-12 h-8 rounded-lg bg-white/5 text-white text-center font-black text-sm border border-white/10 focus:border-pink-500/50 outline-none" />
          <button onClick={() => handleMinuteChange(minute + 1)} className="w-8 h-8 rounded-lg bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">+</button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-3">
        <div className="text-gray-400 text-[10px] font-bold tracking-widest">DODAJ ZDARZENIE</div>
        <div className="flex flex-wrap gap-1">
          {EVENT_TYPES.map(t => (
            <button key={t.value} onClick={() => setEventType(t.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all ${eventType === t.value ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-gray-500 hover:text-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTeamSide('home')} className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${teamSide === 'home' ? 'bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-400 ring-1 ring-pink-500/30' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
            {liveMatch?.home_team?.short_name || 'GOSPODARZE'}
          </button>
          <button onClick={() => setTeamSide('away')} className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${teamSide === 'away' ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 ring-1 ring-green-500/30' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
            {liveMatch?.away_team?.short_name || 'GOSCIE'}
          </button>
        </div>
        <input type="text" placeholder="Imie zawodnika" value={playerName} onChange={e => setPlayerName(e.target.value)} className="w-full h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600" />
        <input type="text" placeholder="Opis (opcjonalnie)" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600" />
        <button onClick={handleAddEvent} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
          <Plus size={12} /> DODAJ ZDARZENIE
        </button>
      </div>

      {events.length > 0 && (
        <div className="space-y-1">
          <div className="text-gray-500 text-[10px] font-bold tracking-widest mb-1">ZDARZENIA ({events.length})</div>
          {events.map(ev => (
            <div key={ev.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/[0.02] group hover:bg-white/5">
              <span className="text-gray-600 text-[10px] font-bold tabular-nums w-6">{ev.minute}'</span>
              <span className={`text-[10px] font-bold ${ev.event_type === 'goal' ? 'text-green-400' : ev.event_type === 'yellow_card' ? 'text-yellow-400' : ev.event_type === 'red_card' ? 'text-red-400' : 'text-gray-400'}`}>
                {ev.event_type === 'goal' ? 'GOL' : ev.event_type === 'yellow_card' ? 'ZOLTA' : ev.event_type === 'red_card' ? 'CZERWONA' : ev.event_type === 'substitution' ? 'ZMIANA' : 'INNE'}
              </span>
              <span className="text-gray-400 text-[10px]">{ev.team_side === 'home' ? liveMatch?.home_team?.short_name : liveMatch?.away_team?.short_name}</span>
              <span className="text-white text-xs flex-1 truncate">{ev.player_name}</span>
              <button onClick={() => removeEvent(ev.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleEndMatch} className="w-full py-2.5 rounded-lg bg-red-600/20 text-red-400 font-bold text-xs tracking-widest hover:bg-red-600/30 transition-colors flex items-center justify-center gap-1.5 border border-red-500/20">
        <Square size={12} /> ZAKONCZ MECZ
      </button>
    </div>
  );
}

function TeamBadge({ color, letter }: { color?: string; letter?: string }) {
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ backgroundColor: color || '#374151' }}>
      {letter}
    </div>
  );
}
