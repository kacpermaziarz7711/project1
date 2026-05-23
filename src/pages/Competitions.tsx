import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Calendar, Users, BarChart3 } from 'lucide-react';

type Tournament = {
  id: string;
  name: string;
  slug: string;
  season: string;
  format: string;
  status: string;
  settings: Record<string, any>;
  created_at: string;
  team_count?: number;
  match_count?: number;
};

const FORMAT_LABELS: Record<string, string> = {
  league: 'Liga',
  knockout: 'Puchar',
  group_knockout: 'Grupy + Puchar',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Szkic', color: 'text-gray-400 bg-gray-400/10' },
  active: { label: 'Aktywny', color: 'text-green-400 bg-green-400/10' },
  finished: { label: 'Zakonczony', color: 'text-blue-400 bg-blue-400/10' },
};

export default function Competitions() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: tournamentsData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      if (!tournamentsData) { setLoading(false); return; }

      const enriched: Tournament[] = [];
      for (const t of tournamentsData as Tournament[]) {
        const { count: teamCount } = await supabase.from('tournament_teams').select('*', { count: 'exact', head: true }).eq('tournament_id', t.id);
        const { count: matchCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('tournament_id', t.id);
        enriched.push({ ...t, team_count: teamCount ?? 0, match_count: matchCount ?? 0 });
      }
      setTournaments(enriched);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
            <Trophy size={20} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-wider">ROZGRYWKI</h1>
            <p className="text-gray-500 text-xs">Turnieje i zawody &bull; JTS</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-40 bg-gray-900/60 rounded-xl animate-pulse" />)}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Brak rozgrywek</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map(t => {
              const status = STATUS_LABELS[t.status] ?? STATUS_LABELS.draft;
              return (
                <div key={t.id} className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-white font-black text-lg">{t.name}</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-gray-600 text-[10px]">&bull;</span>
                          <span className="text-gray-500 text-[10px] font-medium">{FORMAT_LABELS[t.format] ?? t.format}</span>
                          <span className="text-gray-600 text-[10px]">&bull;</span>
                          <span className="text-gray-500 text-[10px] font-medium">Sezon {t.season}</span>
                        </div>
                      </div>
                      <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500 to-green-500 rotate-3" />
                        <div className="relative w-full h-full rounded-xl bg-black flex items-center justify-center">
                          <Trophy size={16} className="text-pink-400" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <Users size={14} className="text-gray-600 mx-auto mb-1" />
                        <div className="text-white font-black text-xl">{t.team_count ?? 0}</div>
                        <div className="text-gray-600 text-[9px] tracking-widest">DRUZYNY</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <Calendar size={14} className="text-gray-600 mx-auto mb-1" />
                        <div className="text-white font-black text-xl">{t.match_count ?? 0}</div>
                        <div className="text-gray-600 text-[9px] tracking-widest">MECZE</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <BarChart3 size={14} className="text-gray-600 mx-auto mb-1" />
                        <div className="text-white font-black text-xl">{t.settings?.points_win ?? 3}/{t.settings?.points_draw ?? 1}/{t.settings?.points_loss ?? 0}</div>
                        <div className="text-gray-600 text-[9px] tracking-widest">PKT W/R/P</div>
                      </div>
                    </div>

                    {t.settings?.match_duration && (
                      <div className="mt-3 text-gray-600 text-[10px]">
                        Czas meczu: {t.settings.match_duration} min
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
