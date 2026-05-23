import { useEffect, useState, useCallback } from 'react';
import { supabase, type Match, type StandingRow, type TopScorer, type LiveScore, type LiveEvent, type Team, type Player } from '../lib/supabase';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .order('match_date', { ascending: true })
      .then(({ data }) => {
        setMatches((data as Match[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { matches, loading };
}

export function useStandings() {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function compute() {
      const [{ data: teams }, { data: matches }] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('matches').select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)').eq('status', 'finished'),
      ]);

      if (!teams || !matches) return;

      const map: Record<string, StandingRow> = {};
      for (const t of teams as Team[]) {
        map[t.id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      }

      for (const m of matches as Match[]) {
        const h = map[m.home_team_id];
        const a = map[m.away_team_id];
        if (!h || !a) continue;
        h.played++; a.played++;
        h.gf += m.home_score; h.ga += m.away_score;
        a.gf += m.away_score; a.ga += m.home_score;
        if (m.home_score > m.away_score) { h.won++; h.points += 3; a.lost++; }
        else if (m.home_score < m.away_score) { a.won++; a.points += 3; h.lost++; }
        else { h.drawn++; h.points++; a.drawn++; a.points++; }
      }

      const rows = Object.values(map).map(r => ({ ...r, gd: r.gf - r.ga }));
      rows.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
      setStandings(rows);
      setLoading(false);
    }
    compute();
  }, []);

  return { standings, loading };
}

export function useTopScorers() {
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('goals')
      .select('player_id, team_id, is_own_goal, players(id, name, number, team_id), teams(id, name, short_name, color, logo_letter)')
      .eq('is_own_goal', false)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const count: Record<string, { player: Player; team: Team; goals: number }> = {};
        for (const g of data as { player_id: string; players: Player; teams: Team }[]) {
          if (!g.players) continue;
          if (!count[g.player_id]) count[g.player_id] = { player: g.players, team: g.teams, goals: 0 };
          count[g.player_id].goals++;
        }
        const list = Object.values(count).sort((a, b) => b.goals - a.goals);
        setScorers(list as TopScorer[]);
        setLoading(false);
      });
  }, []);

  return { scorers, loading };
}

export type CardEntry = {
  player_id: string;
  player: Player;
  team: Team;
  yellow: number;
  red: number;
};

export function useCards() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('cards')
      .select('player_id, team_id, card_type, players(id, name, number, team_id), teams(id, name, short_name, color, logo_letter)')
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const map: Record<string, CardEntry> = {};
        for (const c of data as { player_id: string; card_type: 'yellow' | 'red'; players: Player; teams: Team }[]) {
          if (!c.players) continue;
          if (!map[c.player_id]) map[c.player_id] = { player_id: c.player_id, player: c.players, team: c.teams, yellow: 0, red: 0 };
          if (c.card_type === 'yellow') map[c.player_id].yellow++;
          else map[c.player_id].red++;
        }
        const list = Object.values(map).sort((a, b) => b.red - a.red || b.yellow - a.yellow);
        setCards(list);
        setLoading(false);
      });
  }, []);

  return { cards, loading };
}

export type CleanSheetEntry = {
  player_id: string;
  player: Player;
  team: Team;
  clean_sheets: number;
};

export function useCleanSheets() {
  const [cleanSheets, setCleanSheets] = useState<CleanSheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('clean_sheets')
      .select('player_id, team_id, players(id, name, number, team_id), teams(id, name, short_name, color, logo_letter)')
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const map: Record<string, CleanSheetEntry> = {};
        for (const cs of data as { player_id: string; players: Player; teams: Team }[]) {
          if (!cs.players) continue;
          if (!map[cs.player_id]) map[cs.player_id] = { player_id: cs.player_id, player: cs.players, team: cs.teams, clean_sheets: 0 };
          map[cs.player_id].clean_sheets++;
        }
        const list = Object.values(map).sort((a, b) => b.clean_sheets - a.clean_sheets);
        setCleanSheets(list);
        setLoading(false);
      });
  }, []);

  return { cleanSheets, loading };
}

export function useLiveScore() {
  const [live, setLive] = useState<LiveScore | null>(null);

  useEffect(() => {
    supabase.from('live_score').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setLive(data));

    const channel = supabase
      .channel('live_score_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_score' }, payload => {
        setLive(payload.new as LiveScore);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return live;
}

export function useLiveEvents(matchId: string | null) {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    if (!matchId) { setEvents([]); return; }

    supabase
      .from('live_events')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setEvents((data as LiveEvent[]) ?? []));

    const channel = supabase
      .channel(`live_events_${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_events', filter: `match_id=eq.${matchId}` }, () => {
        supabase
          .from('live_events')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true })
          .then(({ data }) => setEvents((data as LiveEvent[]) ?? []));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  const addEvent = useCallback(async (event: Omit<LiveEvent, 'id' | 'created_at'>) => {
    await supabase.from('live_events').insert(event);
  }, []);

  const removeEvent = useCallback(async (id: string) => {
    await supabase.from('live_events').delete().eq('id', id);
  }, []);

  return { events, addEvent, removeEvent };
}

export function useLiveAdmin() {
  const updateLiveScore = useCallback(async (updates: Partial<LiveScore>) => {
    const { data } = await supabase.from('live_score').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (data) {
      await supabase.from('live_score').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', data.id);
    }
  }, []);

  const startMatch = useCallback(async (matchId: string) => {
    const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).maybeSingle();
    if (!match) return;

    await supabase.from('matches').update({ status: 'live' }).eq('id', matchId);

    const { data: ls } = await supabase.from('live_score').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (ls) {
      await supabase.from('live_score').update({
        current_match_id: matchId,
        home_score: 0,
        away_score: 0,
        minute: 0,
        is_live: true,
        updated_at: new Date().toISOString(),
      }).eq('id', ls.id);
    }

    await supabase.from('live_events').insert({
      match_id: matchId,
      event_type: 'period_start',
      minute: 0,
      player_name: '',
      team_side: 'home',
      description: 'Poczatek meczu',
    });
  }, []);

  const endMatch = useCallback(async (matchId: string, homeScore: number, awayScore: number) => {
    await supabase.from('matches').update({ status: 'finished', home_score: homeScore, away_score: awayScore }).eq('id', matchId);

    const { data: ls } = await supabase.from('live_score').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (ls) {
      await supabase.from('live_score').update({
        current_match_id: null,
        is_live: false,
        home_score: 0,
        away_score: 0,
        minute: 0,
        updated_at: new Date().toISOString(),
      }).eq('id', ls.id);
    }

    await supabase.from('live_events').insert({
      match_id: matchId,
      event_type: 'period_end',
      minute: 0,
      player_name: '',
      team_side: 'home',
      description: 'Koniec meczu',
    });
  }, []);

  return { updateLiveScore, startMatch, endMatch };
}
