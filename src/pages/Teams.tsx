import { useEffect, useState } from 'react';
import { supabase, type Team, type Player } from '../lib/supabase';
import { Users, Shield } from 'lucide-react';

type TeamWithPlayers = Team & { players: Player[] };

export default function Teams() {
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: teamsData } = await supabase.from('teams').select('*').order('name');
      if (!teamsData) { setLoading(false); return; }

      const { data: playersData } = await supabase.from('players').select('*').order('number');
      const playerMap: Record<string, Player[]> = {};
      for (const p of (playersData as Player[]) ?? []) {
        if (!playerMap[p.team_id]) playerMap[p.team_id] = [];
        playerMap[p.team_id].push(p);
      }

      const result = (teamsData as Team[]).map(t => ({
        ...t,
        players: playerMap[t.id] ?? [],
      }));
      setTeams(result);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
            <Users size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-wider">DRUZYNY</h1>
            <p className="text-gray-500 text-xs">Skady zespolow &bull; Sezon 2026</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 bg-gray-900/60 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {teams.map(team => (
              <div
                key={team.id}
                className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
              >
                <button
                  onClick={() => setExpanded(expanded === team.id ? null : team.id)}
                  className="w-full px-5 py-4 flex items-center gap-4"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0 ring-2 ring-white/10"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.logo_letter}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-black text-base">{team.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{team.short_name} &bull; {team.players.length} zawodnikow</div>
                  </div>
                  <div className="text-gray-600 text-xs font-bold">
                    {expanded === team.id ? '-' : '+'}
                  </div>
                </button>

                {expanded === team.id && (
                  <div className="border-t border-white/5 px-5 py-3">
                    <div className="text-[10px] font-bold tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                      <Shield size={10} />
                      SKAD
                    </div>
                    <div className="space-y-1.5">
                      {team.players.map(p => (
                        <div key={p.id} className="flex items-center gap-2 py-1">
                          <span className="text-gray-600 text-xs font-bold w-6 text-right tabular-nums">
                            {p.number ?? '-'}
                          </span>
                          <span className="text-white text-sm">{p.name}</span>
                        </div>
                      ))}
                      {team.players.length === 0 && (
                        <p className="text-gray-600 text-xs py-2">Brak zawodnikow w skladzie</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
