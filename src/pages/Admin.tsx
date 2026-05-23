import { useState, useEffect, useCallback } from 'react';
import { supabase, type Team, type Player, type SiteContent, type Sponsor } from '../lib/supabase';
import { useAuth, signOut } from '../hooks/useAuth';
import { Settings, Upload, Trash2, Plus, Save, LogOut, Database, Shield, ChevronDown, ChevronUp, AlertCircle, FileText, Users, Image, Type, Hash, Eye, EyeOff, GripVertical, Radio, Trophy } from 'lucide-react';

type Tournament = {
  id: string;
  name: string;
  slug: string;
  season: string;
  format: string;
  status: string;
  settings: Record<string, any>;
};

type ImportRow = {
  team: string;
  shortName: string;
  color: string;
  playerName: string;
  playerNumber: string;
};

type Section = 'content' | 'sponsors' | 'import' | 'tournaments' | 'teams' | 'settings';

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [section, setSection] = useState<Section>('content');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pasteData, setPasteData] = useState('');
  const [parsedRows, setParsedRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const [tName, setTName] = useState('');
  const [tSlug, setTSlug] = useState('');
  const [tSeason, setTSeason] = useState('2026');
  const [tFormat, setTFormat] = useState('league');
  const [tStatus, setTStatus] = useState('draft');
  const [tMatchDuration, setTMatchDuration] = useState('25');
  const [tPointsWin, setTPointsWin] = useState('3');
  const [tPointsDraw, setTPointsDraw] = useState('1');
  const [tPointsLoss, setTPointsLoss] = useState('0');

  useEffect(() => {
    loadTournaments();
    loadTeams();
  }, []);

  async function loadTournaments() {
    const { data } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
    setTournaments((data as Tournament[]) ?? []);
  }

  async function loadTeams() {
    const { data } = await supabase.from('teams').select('*').order('name');
    setTeams((data as Team[]) ?? []);
  }

  function parsePaste(raw: string) {
    const lines = raw.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) { setParsedRows([]); return; }
    const rows: ImportRow[] = [];
    for (const line of lines) {
      const cols = line.split('\t').map(c => c.trim());
      if (cols.length < 1) continue;
      rows.push({
        team: cols[0] || '',
        shortName: cols[1] || '',
        color: cols[2] || '#374151',
        playerName: cols[3] || '',
        playerNumber: cols[4] || '',
      });
    }
    setParsedRows(rows);
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setImportResult('');
    let teamsCreated = 0;
    let playersCreated = 0;
    let errors = 0;

    const teamMap: Record<string, string> = {};
    for (const t of teams) {
      teamMap[t.name.toLowerCase()] = t.id;
      teamMap[t.short_name.toLowerCase()] = t.id;
    }

    const teamGroups: Record<string, ImportRow[]> = {};
    for (const row of parsedRows) {
      const key = row.team.toLowerCase();
      if (!teamGroups[key]) teamGroups[key] = [];
      teamGroups[key].push(row);
    }

    for (const [teamKey, rows] of Object.entries(teamGroups)) {
      const first = rows[0];
      let teamId = teamMap[teamKey];

      if (!teamId && first.team) {
        const { data, error } = await supabase.from('teams').insert({
          name: first.team,
          short_name: first.shortName || first.team.substring(0, 3).toUpperCase(),
          color: first.color || '#374151',
          logo_letter: (first.shortName || first.team).charAt(0).toUpperCase(),
        }).select('id').maybeSingle();

        if (error) { errors++; continue; }
        if (data) {
          teamId = data.id;
          teamMap[teamKey] = data.id;
          teamsCreated++;
        }
      }

      if (!teamId) { errors++; continue; }

      const activeT = tournaments.find(t => t.status === 'active');
      if (activeT) {
        await supabase.from('tournament_teams').upsert({
          tournament_id: activeT.id,
          team_id: teamId,
        }, { onConflict: 'tournament_id,team_id' });
      }

      for (const row of rows) {
        if (!row.playerName) continue;
        const { error } = await supabase.from('players').insert({
          team_id: teamId,
          name: row.playerName,
          number: parseInt(row.playerNumber) || null,
        });
        if (error) { errors++; } else { playersCreated++; }
      }
    }

    await loadTeams();
    setImportResult(`Zaimportowano: ${teamsCreated} druzyn, ${playersCreated} zawodnikow${errors > 0 ? `, ${errors} bledow` : ''}`);
    setImporting(false);
  }

  async function createTournament() {
    const { error } = await supabase.from('tournaments').insert({
      name: tName,
      slug: tSlug || tName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      season: tSeason,
      format: tFormat,
      status: tStatus,
      settings: {
        match_duration: parseInt(tMatchDuration) || 25,
        points_win: parseInt(tPointsWin) || 3,
        points_draw: parseInt(tPointsDraw) || 1,
        points_loss: parseInt(tPointsLoss) || 0,
      },
    });
    if (error) { alert('Blad: ' + error.message); return; }
    await loadTournaments();
    setTName(''); setTSlug('');
  }

  async function deleteTeam(id: string) {
    if (!confirm('Usunac druzyne i wszystkich jej zawodnikow?')) return;
    await supabase.from('players').delete().eq('team_id', id);
    await supabase.from('teams').delete().eq('id', id);
    await loadTeams();
  }

  async function deleteTournament(id: string) {
    if (!confirm('Usunac caly turniej? To usunie tez powiazane mecze i dane.')) return;
    await supabase.from('tournaments').delete().eq('id', id);
    await loadTournaments();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500">Musisz byc zalogowany</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-black text-lg mb-2">Brak uprawnien</h2>
          <p className="text-gray-500 text-sm mb-4">
            Twoje konto nie ma uprawnien administratora. Skontaktuj sie z administratorem aby dodac Twoje konto do listy adminow.
          </p>
          <p className="text-gray-600 text-xs mb-4">Twoj email: <span className="text-white">{user.email}</span></p>
          <button
            onClick={() => signOut()}
            className="px-6 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:text-white transition-colors"
          >
            WYLOGUJ SIE
          </button>
        </div>
      </div>
    );
  }

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'content', label: 'TRESC STRONY', icon: <FileText size={14} /> },
    { id: 'sponsors', label: 'SPONSORZY', icon: <Image size={14} /> },
    { id: 'import', label: 'IMPORT DANYCH', icon: <Upload size={14} /> },
    { id: 'tournaments', label: 'TURNIEJE', icon: <Trophy size={14} /> },
    { id: 'teams', label: 'DRUZYNY', icon: <Shield size={14} /> },
    { id: 'settings', label: 'USTAWIENIA', icon: <Settings size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/20 to-green-600/20 border border-white/10 flex items-center justify-center">
              <Settings size={20} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-wider">ZARZADZANIE STRONA</h1>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:text-white transition-colors"
          >
            <LogOut size={12} /> WYLOGUJ
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-900/60 border border-white/5 rounded-xl p-1 overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all whitespace-nowrap ${
                section === s.id
                  ? 'bg-gradient-to-r from-pink-500 to-green-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {section === 'content' && <ContentEditor />}
        {section === 'sponsors' && <SponsorsManager />}
        {section === 'import' && (
          <div className="space-y-4">
            <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-black text-sm tracking-wider mb-1">IMPORT Z EXCELA / ARKUSZA</h2>
              <p className="text-gray-500 text-xs mb-4">
                Wklej dane z excela (tab-separated). Format kolumn: Nazwa druzyny | Skrot | Kolor | Imie zawodnika | Numer
              </p>
              <textarea
                value={pasteData}
                onChange={e => { setPasteData(e.target.value); parsePaste(e.target.value); }}
                placeholder={"Orly Warszawy\tORL\t#e91e8c\tMarek Kowalski\t1\nOrly Warszawy\tORL\t#e91e8c\tPiotr Nowak\t7\nZielona Sila\tZSI\t#22c55e\tAdam Wojcik\t1"}
                className="w-full h-48 rounded-xl bg-black/60 text-white text-sm p-4 border border-white/10 focus:border-pink-500/50 outline-none font-mono placeholder:text-gray-700 resize-y"
              />
              {parsedRows.length > 0 && (
                <div className="mt-4">
                  <div className="text-gray-400 text-[10px] font-bold tracking-widest mb-2">ZNALEZIONO {parsedRows.length} WIERSZY</div>
                  <div className="max-h-48 overflow-y-auto bg-black/40 rounded-lg border border-white/5">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 text-[10px] tracking-widest border-b border-white/5">
                          <th className="px-3 py-2 text-left">DRUZYNA</th>
                          <th className="px-3 py-2 text-left">SKROT</th>
                          <th className="px-3 py-2 text-left">KOLOR</th>
                          <th className="px-3 py-2 text-left">ZAWODNIK</th>
                          <th className="px-3 py-2 text-left">NR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((r, i) => (
                          <tr key={i} className="border-b border-white/5 last:border-0">
                            <td className="px-3 py-1.5 text-white">{r.team}</td>
                            <td className="px-3 py-1.5 text-gray-400">{r.shortName}</td>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                <span className="text-gray-400">{r.color}</span>
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-white">{r.playerName}</td>
                            <td className="px-3 py-1.5 text-gray-400">{r.playerNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Upload size={12} /> {importing ? 'IMPORTOWANIE...' : 'IMPORTUJ DO BAZY'}
                  </button>
                  {importResult && (
                    <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 text-green-400 text-xs">{importResult}</div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-black text-sm tracking-wider mb-3">SZYBKIE DODAWANIE</h2>
              <QuickAdd onAdded={() => loadTeams()} />
            </div>
          </div>
        )}
        {section === 'tournaments' && (
          <div className="space-y-4">
            <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-black text-sm tracking-wider mb-3">NOWY TURNIEJ</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Nazwa turnieju" value={tName} onChange={e => { setTName(e.target.value); setTSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600" />
                <input type="text" placeholder="Slug (auto)" value={tSlug} onChange={e => setTSlug(e.target.value)} className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600" />
                <select value={tSeason} onChange={e => setTSeason(e.target.value)} className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none">
                  <option value="2026">2026</option><option value="2025">2025</option><option value="2027">2027</option>
                </select>
                <select value={tFormat} onChange={e => setTFormat(e.target.value)} className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none">
                  <option value="league">Liga</option><option value="knockout">Puchar</option><option value="group_knockout">Grupy + Puchar</option>
                </select>
                <select value={tStatus} onChange={e => setTStatus(e.target.value)} className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none">
                  <option value="draft">Szkic</option><option value="active">Aktywny</option><option value="finished">Zakonczony</option>
                </select>
                <input type="number" placeholder="Minuty meczu" value={tMatchDuration} onChange={e => setTMatchDuration(e.target.value)} className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="flex items-center gap-1.5"><label className="text-gray-500 text-[10px] font-bold">W:</label><input type="number" value={tPointsWin} onChange={e => setTPointsWin(e.target.value)} className="w-12 h-8 rounded-lg bg-white/5 text-white text-sm px-2 border border-white/10 outline-none text-center" /></div>
                <div className="flex items-center gap-1.5"><label className="text-gray-500 text-[10px] font-bold">R:</label><input type="number" value={tPointsDraw} onChange={e => setTPointsDraw(e.target.value)} className="w-12 h-8 rounded-lg bg-white/5 text-white text-sm px-2 border border-white/10 outline-none text-center" /></div>
                <div className="flex items-center gap-1.5"><label className="text-gray-500 text-[10px] font-bold">P:</label><input type="number" value={tPointsLoss} onChange={e => setTPointsLoss(e.target.value)} className="w-12 h-8 rounded-lg bg-white/5 text-white text-sm px-2 border border-white/10 outline-none text-center" /></div>
                <button onClick={createTournament} className="ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1.5"><Plus size={12} /> UTWORZ</button>
              </div>
            </div>
            <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 text-[10px] font-bold tracking-widest text-gray-500">ISTNIEJACE TURNIEJE ({tournaments.length})</div>
              {tournaments.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-gray-500 text-[10px]">{t.slug} &bull; {t.format} &bull; {t.status} &bull; sezon {t.season}</div>
                  </div>
                  <button onClick={() => deleteTournament(t.id)} className="text-red-400/50 hover:text-red-400 transition-colors p-1.5"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {section === 'teams' && (
          <div className="space-y-4">
            <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 text-[10px] font-bold tracking-widest text-gray-500">DRUZYNY ({teams.length})</div>
              {teams.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ backgroundColor: t.color }}>
                    {t.logo_url ? <img src={t.logo_url} alt={t.name} className="w-6 h-6 object-contain rounded-full" /> : t.logo_letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-gray-500 text-[10px]">{t.short_name}</div>
                  </div>
                  <button onClick={() => deleteTeam(t.id)} className="text-red-400/50 hover:text-red-400 transition-colors p-1.5"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-black text-sm tracking-wider mb-3">EDYTUJ LOGO DRUZYNY</h2>
              <TeamLogoEditor teams={teams} onTeamsUpdated={loadTeams} />
            </div>
          </div>
        )}
        {section === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-black text-sm tracking-wider mb-1">KONFIGURACJA STRONY</h2>
              <p className="text-gray-500 text-xs mb-4">Ustawienia ogolne strony i turnieju</p>
              <div className="space-y-3">
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-gray-400 text-[10px] font-bold tracking-widest mb-1">YOUTUBE VIDEO ID</div>
                  <p className="text-gray-600 text-[10px] mb-2">ID filmu z YouTube do osadzenia na stronie glownej (czesc po v=)</p>
                  <YouTubeConfig />
                </div>
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-gray-400 text-[10px] font-bold tracking-widest mb-1">DOSTEP ADMINA</div>
                  <p className="text-gray-600 text-[10px] mb-2">Aby dodac nowego admina, zarejestruj konto a nastepnie dodaj jego user_id do tabeli admin_users w bazie danych.</p>
                  <p className="text-gray-500 text-[10px]">Twoj user_id: <span className="text-white font-mono">{user?.id}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Content Editor ── */
function ContentEditor() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from('site_content').select('*').order('key').then(({ data }) => {
      setItems((data as SiteContent[]) ?? []);
      setLoading(false);
    });
  }, []);

  async function saveItem(key: string, value: string) {
    setSaving(s => ({ ...s, [key]: true }));
    await supabase.from('site_content').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    setSaving(s => ({ ...s, [key]: false }));
    setSaved(s => ({ ...s, [key]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000);
  }

  function updateValue(key: string, value: string) {
    setItems(items.map(i => i.key === key ? { ...i, value } : i));
  }

  const groups: { label: string; icon: React.ReactNode; keys: { key: string; label: string; type: 'text' | 'textarea' | 'number' }[] }[] = [
    {
      label: 'NAZWA I NAGLOWEK',
      icon: <Type size={14} />,
      keys: [
        { key: 'tournament_name', label: 'Nazwa turnieju', type: 'text' },
        { key: 'tournament_subtitle', label: 'Podtytul', type: 'text' },
      ],
    },
    {
      label: 'OPISY',
      icon: <FileText size={14} />,
      keys: [
        { key: 'about_tournament', label: 'O turnieju', type: 'textarea' },
        { key: 'about_us', label: 'Kim jestesmy', type: 'textarea' },
      ],
    },
    {
      label: 'STATYSTYKI',
      icon: <Hash size={14} />,
      keys: [
        { key: 'stat_teams', label: 'Liczba druzyn', type: 'text' },
        { key: 'stat_teams_label', label: 'Etykieta druzyny', type: 'text' },
        { key: 'stat_rounds', label: 'Liczba kolejek', type: 'text' },
        { key: 'stat_rounds_label', label: 'Etykieta kolejek', type: 'text' },
        { key: 'stat_matches', label: 'Liczba meczy', type: 'text' },
        { key: 'stat_matches_label', label: 'Etykieta meczy', type: 'text' },
        { key: 'stat_duration', label: 'Czas meczu', type: 'text' },
        { key: 'stat_duration_label', label: 'Etykieta czasu', type: 'text' },
      ],
    },
    {
      label: 'PRZYCISK LIVE',
      icon: <Radio size={14} />,
      keys: [
        { key: 'live_button_text', label: 'Tekst przycisku', type: 'text' },
        { key: 'live_button_active_text', label: 'Tekst aktywny', type: 'text' },
      ],
    },
    {
      label: 'STOPKA',
      icon: <Database size={14} />,
      keys: [
        { key: 'footer_text', label: 'Tekst stopki', type: 'text' },
      ],
    },
  ];

  if (loading) return <div className="text-gray-500 text-sm text-center py-8">Ladowanie...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
        <h2 className="text-white font-black text-sm tracking-wider mb-1">EDYCJA TRESCI STRONY</h2>
        <p className="text-gray-500 text-xs mb-4">Zmieniasz teksty ktore widza odwiedzajacy. Zmiany sa widoczne natychmiast po zapisaniu.</p>
      </div>

      {groups.map(group => (
        <div key={group.label} className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400">
            {group.icon} {group.label}
          </div>
          <div className="p-5 space-y-4">
            {group.keys.map(k => {
              const item = items.find(i => i.key === k.key);
              const value = item?.value ?? '';
              return (
                <div key={k.key}>
                  <label className="text-gray-400 text-xs font-bold tracking-wider block mb-1.5">{k.label}</label>
                  <div className="flex gap-2">
                    {k.type === 'textarea' ? (
                      <textarea
                        value={value}
                        onChange={e => updateValue(k.key, e.target.value)}
                        className="flex-1 h-24 rounded-lg bg-black/60 text-white text-sm p-3 border border-white/10 focus:border-pink-500/50 outline-none resize-y placeholder:text-gray-600"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={e => updateValue(k.key, e.target.value)}
                        className="flex-1 h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600"
                      />
                    )}
                    <button
                      onClick={() => saveItem(k.key, value)}
                      disabled={saving[k.key]}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold text-xs tracking-widest hover:bg-white/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                    >
                      <Save size={10} />
                      {saved[k.key] ? 'ZAPISANO!' : saving[k.key] ? '...' : 'ZAPISZ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Sponsors Manager ── */
function SponsorsManager() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState<'title' | 'gold' | 'silver' | 'bronze'>('bronze');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTier, setEditTier] = useState<string>('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSponsors();
  }, []);

  async function loadSponsors() {
    const { data } = await supabase.from('sponsors').select('*').order('sort_order', { ascending: true });
    setSponsors((data as Sponsor[]) ?? []);
    setLoading(false);
  }

  async function addSponsor() {
    if (!newName) return;
    const maxOrder = sponsors.reduce((max, s) => Math.max(max, s.sort_order), 0);
    await supabase.from('sponsors').insert({
      name: newName,
      tier: newTier,
      logo_url: newLogoUrl || null,
      sort_order: maxOrder + 1,
      is_active: true,
    });
    setNewName(''); setNewLogoUrl('');
    await loadSponsors();
  }

  async function deleteSponsor(id: string) {
    if (!confirm('Usunac sponsora?')) return;
    await supabase.from('sponsors').delete().eq('id', id);
    await loadSponsors();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await supabase.from('sponsors').update({ is_active: !isActive }).eq('id', id);
    await loadSponsors();
  }

  async function startEdit(s: Sponsor) {
    setEditingId(s.id);
    setEditName(s.name);
    setEditTier(s.tier);
    setEditLogoUrl(s.logo_url || '');
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await supabase.from('sponsors').update({
      name: editName,
      tier: editTier,
      logo_url: editLogoUrl || null,
    }).eq('id', editingId);
    setEditingId(null);
    setSaving(false);
    await loadSponsors();
  }

  async function moveSponsor(id: string, direction: 'up' | 'down') {
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sponsors.length) return;

    const a = sponsors[idx];
    const b = sponsors[swapIdx];
    await Promise.all([
      supabase.from('sponsors').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('sponsors').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    await loadSponsors();
  }

  const tierLabels: Record<string, string> = { title: 'TYTULARNY', gold: 'ZLOTY', silver: 'SREBRNY', bronze: 'BRONZOWY' };
  const tierColors: Record<string, string> = { title: 'text-yellow-400', gold: 'text-amber-400', silver: 'text-gray-300', bronze: 'text-gray-500' };

  if (loading) return <div className="text-gray-500 text-sm text-center py-8">Ladowanie...</div>;

  return (
    <div className="space-y-4">
      {/* Add new sponsor */}
      <div className="bg-gray-900/60 border border-white/5 rounded-xl p-5">
        <h2 className="text-white font-black text-sm tracking-wider mb-3">DODAJ SPONSORA</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Nazwa sponsora"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 min-w-[160px] h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600"
          />
          <select
            value={newTier}
            onChange={e => setNewTier(e.target.value as any)}
            className="h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none"
          >
            <option value="title">Tytularny</option>
            <option value="gold">Zloty</option>
            <option value="silver">Srebrny</option>
            <option value="bronze">Bronzowy</option>
          </select>
          <input
            type="text"
            placeholder="URL logo (opcjonalnie)"
            value={newLogoUrl}
            onChange={e => setNewLogoUrl(e.target.value)}
            className="flex-1 min-w-[160px] h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 focus:border-pink-500/50 outline-none placeholder:text-gray-600"
          />
          <button
            onClick={addSponsor}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Plus size={12} /> DODAJ
          </button>
        </div>
      </div>

      {/* Sponsors list */}
      <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 text-[10px] font-bold tracking-widest text-gray-500">
          SPONSORZY ({sponsors.length})
        </div>
        {sponsors.map((s, idx) => (
          <div key={s.id} className="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
            {/* Move buttons */}
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button onClick={() => moveSponsor(s.id, 'up')} disabled={idx === 0} className="text-gray-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronUp size={12} /></button>
              <button onClick={() => moveSponsor(s.id, 'down')} disabled={idx === sponsors.length - 1} className="text-gray-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown size={12} /></button>
            </div>

            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              {s.logo_url ? <img src={s.logo_url} alt={s.name} className="w-6 h-6 object-contain" /> : <span className="font-black text-xs text-gray-400">{s.name.charAt(0)}</span>}
            </div>

            {editingId === s.id ? (
              /* Edit mode */
              <div className="flex-1 flex gap-2 flex-wrap items-center">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 min-w-[120px] h-8 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none" />
                <select value={editTier} onChange={e => setEditTier(e.target.value)} className="h-8 rounded-lg bg-white/5 text-white text-sm px-2 border border-white/10 outline-none">
                  <option value="title">Tytularny</option><option value="gold">Zloty</option><option value="silver">Srebrny</option><option value="bronze">Bronzowy</option>
                </select>
                <input type="text" value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} placeholder="URL logo" className="flex-1 min-w-[120px] h-8 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
                <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 font-bold text-[10px] tracking-widest hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"><Save size={10} /> ZAPISZ</button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 font-bold text-[10px] tracking-widest hover:text-white transition-colors">ANULUJ</button>
              </div>
            ) : (
              /* Display mode */
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">{s.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold ${tierColors[s.tier] || 'text-gray-400'}`}>{tierLabels[s.tier] || s.tier}</span>
                    {!s.is_active && <span className="text-[10px] font-bold text-red-400/60">UKRYTY</span>}
                  </div>
                </div>
                <button onClick={() => toggleActive(s.id, s.is_active)} className={`p-1.5 rounded-lg transition-colors ${s.is_active ? 'text-green-400/60 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}>
                  {s.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => startEdit(s)} className="text-gray-500 hover:text-white transition-colors p-1.5"><Settings size={14} /></button>
                <button onClick={() => deleteSponsor(s.id)} className="text-red-400/50 hover:text-red-400 transition-colors p-1.5"><Trash2 size={14} /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickAdd({ onAdded }: { onAdded: () => void }) {
  const [mode, setMode] = useState<'team' | 'player'>('team');
  const [teamName, setTeamName] = useState('');
  const [teamShort, setTeamShort] = useState('');
  const [teamColor, setTeamColor] = useState('#374151');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  useEffect(() => {
    supabase.from('teams').select('*').order('name').then(({ data }) => setAllTeams((data as Team[]) ?? []));
  }, [onAdded]);

  async function addTeam() {
    if (!teamName) return;
    await supabase.from('teams').insert({
      name: teamName,
      short_name: teamShort || teamName.substring(0, 3).toUpperCase(),
      color: teamColor,
      logo_letter: (teamShort || teamName).charAt(0).toUpperCase(),
    });
    setTeamName(''); setTeamShort('');
    onAdded();
  }

  async function addPlayer() {
    if (!playerName || !playerTeamId) return;
    await supabase.from('players').insert({
      name: playerName,
      team_id: playerTeamId,
      number: parseInt(playerNumber) || null,
    });
    setPlayerName(''); setPlayerNumber('');
    onAdded();
  }

  return (
    <div>
      <div className="flex gap-1 mb-3">
        <button onClick={() => setMode('team')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${mode === 'team' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>DRUZYNA</button>
        <button onClick={() => setMode('player')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${mode === 'player' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>ZAWODNIK</button>
      </div>
      {mode === 'team' ? (
        <div className="flex gap-2 flex-wrap">
          <input type="text" placeholder="Nazwa" value={teamName} onChange={e => setTeamName(e.target.value)} className="flex-1 min-w-[120px] h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
          <input type="text" placeholder="Skrot" value={teamShort} onChange={e => setTeamShort(e.target.value)} className="w-20 h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
          <input type="color" value={teamColor} onChange={e => setTeamColor(e.target.value)} className="w-9 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
          <button onClick={addTeam} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1"><Plus size={10} /> DODAJ</button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <select value={playerTeamId} onChange={e => setPlayerTeamId(e.target.value)} className="flex-1 min-w-[120px] h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none">
            <option value="">Wybierz druzyne</option>
            {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="text" placeholder="Imie zawodnika" value={playerName} onChange={e => setPlayerName(e.target.value)} className="flex-1 min-w-[120px] h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
          <input type="text" placeholder="Nr" value={playerNumber} onChange={e => setPlayerNumber(e.target.value)} className="w-16 h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
          <button onClick={addPlayer} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1"><Plus size={10} /> DODAJ</button>
        </div>
      )}
    </div>
  );
}

function TeamLogoEditor({ teams, onTeamsUpdated }: { teams: Team[]; onTeamsUpdated: () => void }) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveLogo() {
    if (!selectedTeamId) return;
    setSaving(true);
    await supabase.from('teams').update({ logo_url: logoUrl || null }).eq('id', selectedTeamId);
    setSaving(false);
    setLogoUrl('');
    setSelectedTeamId('');
    onTeamsUpdated();
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="flex-1 min-w-[160px] h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none">
        <option value="">Wybierz druzyne</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <input type="text" placeholder="URL logo" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="flex-1 min-w-[160px] h-10 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600" />
      <button onClick={saveLogo} disabled={saving || !selectedTeamId} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-green-500 text-black font-bold text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50">
        <Save size={12} /> {saving ? '...' : 'ZAPISZ'}
      </button>
    </div>
  );
}

function YouTubeConfig() {
  const [videoId, setVideoId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('live_score').select('youtube_video_id').order('updated_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setVideoId(data.youtube_video_id); });
  }, []);

  async function save() {
    const { data } = await supabase.from('live_score').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (data) {
      await supabase.from('live_score').update({ youtube_video_id: videoId, updated_at: new Date().toISOString() }).eq('id', data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="flex gap-2">
      <input type="text" value={videoId} onChange={e => setVideoId(e.target.value)} placeholder="np. dQw4w9WgXcQ" className="flex-1 h-9 rounded-lg bg-white/5 text-white text-sm px-3 border border-white/10 outline-none placeholder:text-gray-600 font-mono" />
      <button onClick={save} className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold text-xs tracking-widest hover:bg-white/20 transition-colors flex items-center gap-1.5"><Save size={10} />{saved ? 'ZAPISANO!' : 'ZAPISZ'}</button>
    </div>
  );
}
