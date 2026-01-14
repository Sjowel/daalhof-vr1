"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Team = {
  name: string;
  logo: string;
};

type Fixture = {
  id: string;
  kickoff: string; // ISO
  homeTeam: Team;
  awayTeam: Team;
};

type HomeApiResponse = {
  fixtures: Fixture[];
};

export default function WedstrijdenPage() {
  const pathname = usePathname();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
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

        setFixtures(json.fixtures ?? []);
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

  // Sorteer op datum (oud -> nieuw)
  const sorted = useMemo(() => {
    return [...fixtures]
      .map((f) => ({ ...f, ms: new Date(f.kickoff).getTime() }))
      .filter((f) => Number.isFinite(f.ms))
      .sort((a, b) => a.ms - b.ms);
  }, [fixtures]);

  const formatDateBar = (kickoff: string) => {
    const dt = new Date(kickoff);
    const weekday = dt.toLocaleDateString("nl-NL", { weekday: "long" });
    const day = dt.toLocaleDateString("nl-NL", { day: "numeric" });
    const month = dt.toLocaleDateString("nl-NL", { month: "long" });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} ${month}`;
  };

  const formatTime = (kickoff: string) => {
    const dt = new Date(kickoff);
    return dt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <main className="phone">
        
        <section className="programPage" aria-label="Programma">
<div className="pageHeader">
  <h1 className="programPageTitle">Programma</h1>

  <a href="/" className="backButton">
     ← Terug naar overzicht
  </a>
</div>


          {status === "loading" && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}
          {status === "error" && (
            <p style={{ margin: 0, opacity: 0.7 }}>
              Kon programma niet laden. Check of <code>/api/home</code> werkt.
            </p>
          )}

          {status === "ready" && sorted.length === 0 && (
            <p style={{ margin: 0, opacity: 0.7 }}>Geen wedstrijden gevonden.</p>
          )}

          {status === "ready" && sorted.length > 0 && (
            <div className="programList" role="list">
              {sorted.map((m) => (
                <article className="programListItem" key={m.id} role="listitem">
                  <div className="programDateBar">{formatDateBar(m.kickoff)}</div>

                  <div className="programMatchRow">
                    <div className="programTeamLogo" aria-label={`${m.homeTeam.name} logo`}>
                      <img src={m.homeTeam.logo} alt={m.homeTeam.name} />
                    </div>

                    <div className="programKickoffBox" aria-label="Aftrap tijd">
                      {formatTime(m.kickoff)}
                    </div>

                    <div className="programTeamLogo" aria-label={`${m.awayTeam.name} logo`}>
                      <img src={m.awayTeam.logo} alt={m.awayTeam.name} />
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
