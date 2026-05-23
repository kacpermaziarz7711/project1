import { useEffect, useState, useCallback } from 'react';
import { supabase, type SiteContent, type Sponsor } from '../lib/supabase';

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('*')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          for (const row of data as SiteContent[]) {
            map[row.key] = row.value;
          }
          setContent(map);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel('site_content_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => {
        supabase.from('site_content').select('*').then(({ data }) => {
          if (data) {
            const map: Record<string, string> = {};
            for (const row of data as SiteContent[]) {
              map[row.key] = row.value;
            }
            setContent(map);
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const get = useCallback((key: string, fallback: string = '') => content[key] ?? fallback, [content]);

  return { content, get, loading };
}

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('sponsors')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setSponsors((data as Sponsor[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel('sponsors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, () => {
        supabase
          .from('sponsors')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .then(({ data }) => setSponsors((data as Sponsor[]) ?? []));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { sponsors, loading };
}
