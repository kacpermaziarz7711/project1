import { useTopScorers, useCards, useCleanSheets } from '../hooks/useTournament';
import { Target, AlertTriangle, Shield, BarChart3 } from 'lucide-react';
import { useState } from 'react';

type Tab = 'scorers' | 'cards' | 'cleansheets';

export default function Statistics() {
  const [tab, setTab] = useState<Tab>('scorers');
  const { scorers, loading: l1 } = useTopScorers();
  const { cards, loading: l2 } = useCards();
  const { cleanSheets, loading: l3 } = useCleanSheets();

  const loading = l1 || l2 || l3;
  const topGoals = scorers[0]?.goals ?? 1;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'scorers', label: 'STRZELCY', icon: <Target size={14} /> },
    { id: 'cards', label: 'KARTKI', icon: <AlertTriangle size={14} /> },
    { id: 'cleansheets', label: 'CZYSTE KONTA', icon: <Shield size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-wider">STATYSTYKI</h1>
            <p className="text-gray-500 text-xs">Strzelcy &bull; Kartki &bull; Czyste konta &bull; Sezon 2026</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-gray-900/60 border border-white/5 rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-pink-500 to-green-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-gray-900/60 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {tab === 'scorers' && (
              <>
                {/* Top 3 podium */}
                {scorers.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[scorers[1], scorers[0], scorers[2]].map((s, podiumIdx) => {
                      const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                      const heights = ['h-28', 'h-36', 'h-24'];
                      return (
                        <div key={s.player.id} className={`flex flex-col items-center justify-end ${heights[podiumIdx]}`}>
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mb-2 ring-2"
                            style={{ backgroundColor: s.team.color, ringColor: s.team.color }}
                          >
                            {s.player.name.charAt(0)}
                          </div>
                          <div className="text-white font-bold text-xs text-center truncate w-full px-1">{s.player.name.split(' ')[0]}</div>
                          <div className="text-gray-400 text-[10px] text-center">{s.team.short_name}</div>
                          <div className={`mt-2 w-full rounded-t-lg flex items-center justify-center py-3 ${
                            rank === 1 ? 'bg-gradient-to-b from-yellow-400/30 to-yellow-600/10 border-t-2 border-yellow-400/50' :
                            rank === 2 ? 'bg-gradient-to-b from-gray-300/20 to-gray-600/10 border-t-2 border-gray-400/50' :
                            'bg-gradient-to-b from-amber-700/20 to-amber-900/10 border-t-2 border-amber-700/50'
                          }`}>
                            <div className="flex items-baseline gap-1">
                              <span className={`font-black text-2xl ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                                {s.goals}
                              </span>
                              <span className="text-gray-500 text-[10px]">goli</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Full list */}
                <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[2.5rem_1fr_6rem_5rem] gap-2 px-4 py-2 bg-black/40 border-b border-white/5 text-[10px] font-bold tracking-widest text-gray-500">
                    <span className="text-center">#</span>
                    <span>ZAWODNIK</span>
                    <span className="text-center">DRUZYNA</span>
                    <span className="text-center">GOLE</span>
                  </div>
                  {scorers.map((s, i) => (
                    <div key={s.player.id} className="grid grid-cols-[2.5rem_1fr_6rem_5rem] gap-2 px-4 py-3 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <div className="flex justify-center">
                        {i < 3 ? (
                          <span className={`text-sm font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`}>{i + 1}</span>
                        ) : (
                          <span className="text-gray-600 text-sm font-bold">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                          style={{ backgroundColor: s.team.color }}
                        >
                          {s.player.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-sm font-semibold truncate">{s.player.name}</div>
                          {s.player.number && <div className="text-gray-500 text-[10px]">#{s.player.number}</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black" style={{ backgroundColor: s.team.color }}>
                          {s.team.logo_letter}
                        </div>
                        <span className="text-gray-400 text-xs">{s.team.short_name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-12">
                          <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-green-500" style={{ width: `${Math.round((s.goals / topGoals) * 100)}%` }} />
                        </div>
                        <span className={`font-black text-lg tabular-nums ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>{s.goals}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <StatCard label="Wszystkich goli" value={scorers.reduce((s, r) => s + r.goals, 0).toString()} color="from-pink-600/20 to-pink-900/10" />
                  <StatCard label="Strzelcy" value={scorers.length.toString()} color="from-green-600/20 to-green-900/10" />
                  <StatCard label="Srednia na mecz" value={scorers.length > 0 ? (scorers.reduce((s, r) => s + r.goals, 0) / 6).toFixed(1) : '0'} color="from-gray-600/20 to-gray-900/10" />
                </div>
              </>
            )}

            {tab === 'cards' && (
              <>
                {/* Cards summary */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <StatCard
                    label="ZOLTE KARTKI"
                    value={cards.reduce((s, c) => s + c.yellow, 0).toString()}
                    color="from-yellow-600/20 to-yellow-900/10"
                    valueColor="text-yellow-400"
                  />
                  <StatCard
                    label="CZERWONE KARTKI"
                    value={cards.reduce((s, c) => s + c.red, 0).toString()}
                    color="from-red-600/20 to-red-900/10"
                    valueColor="text-red-400"
                  />
                  <StatCard
                    label="ZAWODNIKOW UKARANYCH"
                    value={cards.length.toString()}
                    color="from-gray-600/20 to-gray-900/10"
                  />
                </div>

                {cards.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">Brak kartek w sezonie</div>
                ) : (
                  <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[2.5rem_1fr_6rem_3.5rem_3.5rem] gap-2 px-4 py-2 bg-black/40 border-b border-white/5 text-[10px] font-bold tracking-widest text-gray-500">
                      <span className="text-center">#</span>
                      <span>ZAWODNIK</span>
                      <span className="text-center">DRUZYNA</span>
                      <span className="text-center"><span className="text-yellow-500">Z</span></span>
                      <span className="text-center"><span className="text-red-500">C</span></span>
                    </div>
                    {cards.map((c, i) => (
                      <div key={c.player_id} className="grid grid-cols-[2.5rem_1fr_6rem_3.5rem_3.5rem] gap-2 px-4 py-3 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <span className="text-gray-600 text-sm font-bold text-center">{i + 1}</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ backgroundColor: c.team.color }}
                          >
                            {c.player.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{c.player.name}</div>
                            {c.player.number && <div className="text-gray-500 text-[10px]">#{c.player.number}</div>}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black" style={{ backgroundColor: c.team.color }}>
                            {c.team.logo_letter}
                          </div>
                          <span className="text-gray-400 text-xs">{c.team.short_name}</span>
                        </div>
                        <div className="flex justify-center">
                          {c.yellow > 0 ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-5 rounded-sm bg-yellow-400 flex items-center justify-center">
                                <span className="text-black text-[8px] font-black">{c.yellow}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-700 text-xs">-</span>
                          )}
                        </div>
                        <div className="flex justify-center">
                          {c.red > 0 ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-5 rounded-sm bg-red-500 flex items-center justify-center">
                                <span className="text-white text-[8px] font-black">{c.red}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-700 text-xs">-</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'cleansheets' && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatCard
                    label="CZYSTE KONTA"
                    value={cleanSheets.reduce((s, cs) => s + cs.clean_sheets, 0).toString()}
                    color="from-green-600/20 to-green-900/10"
                    valueColor="text-green-400"
                  />
                  <StatCard
                    label="BRAMKARZY"
                    value={cleanSheets.length.toString()}
                    color="from-blue-600/20 to-blue-900/10"
                    valueColor="text-blue-400"
                  />
                </div>

                {cleanSheets.length === 0 ? (
                  <div className="text-center py-16">
                    <Shield size={40} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Brak czystych kont w sezonie</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cleanSheets.map((cs, i) => (
                      <div key={cs.player_id} className="bg-gray-900/60 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-green-500/20 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-700/20 flex items-center justify-center text-green-400 font-black text-sm">
                          {i + 1}
                        </div>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 ring-2 ring-white/10"
                          style={{ backgroundColor: cs.team.color }}
                        >
                          {cs.player.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm">{cs.player.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-black" style={{ backgroundColor: cs.team.color }}>
                              {cs.team.logo_letter}
                            </div>
                            {cs.team.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-black text-2xl tabular-nums">{cs.clean_sheets}</div>
                          <div className="text-gray-500 text-[10px] tracking-wider">CZYSTE KONTA</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, valueColor }: { label: string; value: string; color: string; valueColor?: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} border border-white/5 rounded-xl p-4 text-center`}>
      <div className={`font-black text-3xl ${valueColor || 'text-white'}`}>{value}</div>
      <div className="text-gray-500 text-[10px] font-medium mt-1 leading-tight">{label}</div>
    </div>
  );
}
