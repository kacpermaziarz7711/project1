import { useStandings } from '../hooks/useTournament';
import { Trophy, TrendingUp } from 'lucide-react';

export default function Standings() {
  const { standings, loading } = useStandings();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader icon={<Trophy size={20} className="text-pink-400" />} title="TABELA LIGOWA" subtitle="Sezon 2026" />

        {loading ? (
          <Skeleton />
        ) : (
          <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2.5rem_2.5rem_2rem_2.5rem] gap-1 px-4 py-2 bg-black/40 border-b border-white/5 text-[10px] font-bold tracking-widest text-gray-500">
              <span className="text-center">#</span>
              <span>DRUZYNA</span>
              <span className="text-center">M</span>
              <span className="text-center">W</span>
              <span className="text-center">R</span>
              <span className="text-center">P</span>
              <span className="text-center">GZ</span>
              <span className="text-center">GS</span>
              <span className="text-center">+/-</span>
              <span className="text-center text-white">PKT</span>
            </div>

            {standings.map((row, i) => (
              <div
                key={row.team.id}
                className={`grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2.5rem_2.5rem_2rem_2.5rem] gap-1 px-4 py-3 items-center border-b border-white/5 last:border-0 transition-colors hover:bg-white/5 ${i === 0 ? 'bg-yellow-400/5' : ''}`}
              >
                <span className={`text-center text-sm font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: row.team.color }}
                  >
                    {row.team.logo_letter}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{row.team.name}</div>
                    <div className="text-gray-500 text-[10px]">{row.team.short_name}</div>
                  </div>
                </div>
                <span className="text-center text-sm text-gray-300">{row.played}</span>
                <span className="text-center text-sm text-green-400 font-semibold">{row.won}</span>
                <span className="text-center text-sm text-gray-400">{row.drawn}</span>
                <span className="text-center text-sm text-red-400 font-semibold">{row.lost}</span>
                <span className="text-center text-sm text-gray-300">{row.gf}</span>
                <span className="text-center text-sm text-gray-300">{row.ga}</span>
                <span className={`text-center text-sm font-semibold ${row.gd > 0 ? 'text-green-400' : row.gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </span>
                <div className="flex justify-center">
                  <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-lg ${
                    i === 0
                      ? 'bg-gradient-to-br from-pink-500 to-green-500 text-white'
                      : 'text-white bg-white/10'
                  }`}>
                    {row.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> Lider</span>
          <span>M - mecze &bull; W - wygrane &bull; R - remisy &bull; P - porazki &bull; GZ - gole zdobyte &bull; GS - gole stracone &bull; PKT - punkty</span>
        </div>

        {/* Form guide */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-400" />
            <h2 className="text-sm font-bold tracking-widest text-gray-300">FORMA DRUZYN</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {standings.map((row, i) => (
              <div key={row.team.id} className="bg-gray-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <span className="text-gray-600 text-sm font-bold w-5">{i + 1}</span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black"
                  style={{ backgroundColor: row.team.color }}
                >
                  {row.team.logo_letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{row.team.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{row.played} mecze &bull; {row.gf} bramek</div>
                </div>
                <ProgressBar value={row.points} max={standings[0]?.points || 1} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / Math.max(max, 1)) * 100);
  return (
    <div className="text-right">
      <div className="text-white font-black text-lg tabular-nums">{value}</div>
      <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-green-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PageHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h1 className="text-white font-black text-xl tracking-wider">{title}</h1>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-900/60 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
