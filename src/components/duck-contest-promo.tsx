'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type OpenContest = { id: string; title: string };

export function DuckContestPromo() {
  const [contest, setContest] = useState<OpenContest | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function refresh() {
      const { data } = await supabase.from('duck_contests')
        .select('id,title').eq('status', 'open').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (active) setContest(data as OpenContest | null);
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  if (!contest) return null;
  return <div className="duck-contest-banner" role="region" aria-label="Concours de codage en cours">
    <span className="duck-contest-banner-icon"><Trophy size={17}/></span>
    <span className="duck-contest-banner-copy"><strong>Concours ouvert : {contest.title}</strong><small>Participe pour tenter de gagner le jackpot de 10 000 DuckMoney.</small></span>
    <Link href="/concours">Découvrir et participer <ArrowUpRight size={15}/></Link>
  </div>;
}
