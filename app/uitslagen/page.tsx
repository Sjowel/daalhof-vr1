"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Team = {
  name: string;
  logo: string;
};

type Result = {
  id: string;
  date: string; // YYYY-MM-DD
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number; away: number };
};

type HomeApiResponse = {
  results: Result[];
};

export default function UitslagenPage() {
  const pathname = usePathname();

  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setStatus("loading");
        const res = await fetch("/api/home", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as HomeApiResponse;
        if (!mounted) return;

        setResults(json.results ?? []);
        setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setStatus("error");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // sorteer nieuwste eerst
  const sorted = useMemo(() => {
    return [...results].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [results]);

  const formatDateNl = (dateStr: string) => {
    const dt = new Date(`${dateStr}T00:00:00`);
    // voorbeeld: "Zondag 21 December"
    const weekday = dt.toLocaleDateString("nl-NL", { weekday: "long" });
    const day = dt.toLocaleDateString("nl-NL", { day: "numeric" });
    const month = dt.toLocaleDateString("nl-NL", { month: "long" });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} ${month}`;
  };

  return (
    <>
      <main className="phone">
        
        <section className="resultsPage" aria-label="Uitslagen">
<div className="pageHeader">
  <h1 className="programPageTitle">Stand</h1>

  <a href="/" className="backButton">
     ← Terug naar overzicht
  </a>
</div>


          {status === "loading" && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}
          {status === "error" && (
            <p style={{ margin: 0, opacity: 0.7 }}>
              Kon uitslagen niet laden. Check of <code>/api/home</code> werkt.
            </p>
          )}

          {status === "ready" && sorted.length === 0 && (
            <p style={{ margin: 0, opacity: 0.7 }}>Nog geen uitslagen beschikbaar.</p>
          )}

          {status === "ready" && sorted.length > 0 && (
            <div className="resultsList" role="list">
              {sorted.map((r) => (
                <article className="resultCard" key={r.id} role="listitem">
                  <div className="resultDateBar">{formatDateNl(r.date)}</div>

                  <div className="resultRow">
                    <div className="resultLogo" aria-label={`${r.homeTeam.name} logo`}>
                      <img src={r.homeTeam.logo} alt={r.homeTeam.name} />
                    </div>

                    <div className="resultScoreBox" aria-label="Uitslag">
                      <span className="resultScore">{r.score.home}</span>
                      <span className="resultDash">-</span>
                      <span className="resultScore">{r.score.away}</span>
                    </div>

                    <div className="resultLogo" aria-label={`${r.awayTeam.name} logo`}>
                      <img src={r.awayTeam.logo} alt={r.awayTeam.name} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* footer */}
      <nav className="footer" aria-label="Hoofd navigatie">
        <a className={`footerItem ${pathname === "/wedstrijden" ? "isActive" : ""}`} href="/wedstrijden">
          <span className="footerIcon" aria-hidden>📅</span>
          <span className="footerLabel">Programma</span>
        </a>

        <a className={`footerItem ${pathname === "/uitslagen" ? "isActive" : ""}`} href="/uitslagen">
          <span className="footerIcon" aria-hidden>🧾</span>
          <span className="footerLabel">Uitslagen</span>
        </a>

        <a className={`footerItem ${pathname === "/stand" ? "isActive" : ""}`} href="/stand">
          <span className="footerIcon" aria-hidden>⭐</span>
          <span className="footerLabel">Stand</span>
        </a>
      </nav>
    </>
  );
}
