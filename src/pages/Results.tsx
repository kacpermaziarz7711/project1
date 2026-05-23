import { useMatches } from '../hooks/useTournament';
import { CheckCircle2 } from 'lucide-react';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pl-PL', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Results() {
  const { matches, loading } = useMatches();
  const finished = matches.filter(m => m.status === 'finished');

  const byRound = finished.reduce<Record<number, typeof finished>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  const rounds = Object.keys(byRound).map(Number).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader />

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-40 bg-gray-900/60 rounded-xl animate-pulse" />)}
          </div>
        ) : rounds.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Brak rozegranych meczy</div>
        ) : (
          <div className="space-y-8">
            {rounds.map(round => (
              <div key={round}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-xs font-bold tracking-widest text-gray-400 px-3 py-1 bg-white/5 rounded-full">
                    KOLEJKA {round}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="space-y-3">
                  {byRound[round].map(m => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match: m }: { match: ReturnType<typeof useMatches>['matches'][0] }) {
  const homeWon = m.home_score > m.away_score;
  const awayWon = m.away_score > m.home_score;

  return (
    <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-pink-500/20 transition-colors">
      <div className="flex items-center px-4 py-2 bg-black/20 gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
        <span className="text-[10px] text-gray-500 font-medium">{formatDate(m.match_date)}</span>
      </div>
      <div className="px-4 py-4 flex items-center gap-4">
        {/* Home team */}
        <div className={`flex-1 flex items-center gap-3 ${homeWon ? '' : 'opacity-60'}`}>
          <TeamBadge color={m.home_team?.color} letter={m.home_team?.logo_letter} size="lg" />
          <div>
            <div className={`font-black text-sm ${homeWon ? 'text-white' : 'text-gray-400'}`}>{m.home_team?.name}</div>
            <div className="text-gray-500 text-[10px]">{m.home_team?.short_name}</div>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 px-4">
          <span className={`text-3xl font-black tabular-nums ${homeWon ? 'text-white' : 'text-gray-500'}`}>{m.home_score}</span>
          <div className="flex flex-col items-center">
            <span className="text-pink-500 font-black text-sm">:</span>
            <span className="text-[9px] text-gray-600 font-bold mt-0.5">FIN</span>
          </div>
          <span className={`text-3xl font-black tabular-nums ${awayWon ? 'text-white' : 'text-gray-500'}`}>{m.away_score}</span>
        </div>

        {/* Away team */}
        <div className={`flex-1 flex items-center justify-end gap-3 ${awayWon ? '' : 'opacity-60'}`}>
          <div className="text-right">
            <div className={`font-black text-sm ${awayWon ? 'text-white' : 'text-gray-400'}`}>{m.away_team?.name}</div>
            <div className="text-gray-500 text-[10px]">{m.away_team?.short_name}</div>
          </div>
          <TeamBadge color={m.away_team?.color} letter={m.away_team?.logo_letter} size="lg" />
        </div>
      </div>
    </div>
  );
}

function TeamBadge({ color, letter, size = 'sm' }: { color?: string; letter?: string; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-xs';
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center text-white font-black flex-shrink-0`}
      style={{ backgroundColor: color || '#374151' }}
    >
      {letter}
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
        <CheckCircle2 size={20} className="text-green-400" />
      </div>
      <div>
        <h1 className="text-white font-black text-xl tracking-wider">WYNIKI MECZY</h1>
        <p className="text-gray-500 text-xs">Rozegrane spotkania &bull; Sezon 2026</p>
      </div>
    </div>
  );
}
