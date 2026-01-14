"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Team = {
  name: string;
  logo: string;
};

type StandingRow = {
  rank: number;
  team: Team;
  played: number; // G
  points: number; // P
};

type HomeApiResponse = {
  standings: StandingRow[];
};

export default function StandPage() {
  const pathname = usePathname();

  const [rows, setRows] = useState<StandingRow[]>([]);
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

        setRows(json.standings ?? []);
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

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => a.rank - b.rank);
  }, [rows]);

  const myTeamName = "Daalhof";
  const norm = (s: string) => s.trim().toLowerCase();

  return (
    <>
      <main className="phone">
        <section className="standPage" aria-label="Stand">
          <h1 className="standPageTitle">Stand</h1>

          <div className="standMeta">
            <div className="standMetaLabel">Competitie</div>
            <div className="standMetaValue">5e klasse - 1</div>
          </div>

          <div className="standHeaderRow" aria-label="Stand header">
            <div />
            <div />
            <div />
            <div className="standHeaderRight">
              <span className="standHeaderCol">G</span>
              <span className="standHeaderCol">P</span>
            </div>
          </div>

          {status === "loading" && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}
          {status === "error" && (
            <p style={{ margin: 0, opacity: 0.7 }}>
              Kon stand niet laden. Check of <code>/api/home</code> werkt.
            </p>
          )}
          {status === "ready" && sorted.length === 0 && (
            <p style={{ margin: 0, opacity: 0.7 }}>Geen stand beschikbaar.</p>
          )}

          {status === "ready" && sorted.length > 0 && (
            <div className="standTable" role="list" aria-label="Standings">
              {sorted.map((r) => {
                const isMine = norm(r.team.name) === norm(myTeamName);

                return (
                  <div
                    className={`standTableRow ${isMine ? "isMine" : ""}`}
                    role="listitem"
                    key={r.rank}
                  >
                    <div className="standRankCell">{r.rank}</div>

                    <div className="standLogoCell" aria-label={`${r.team.name} logo`}>
                      <img src={r.team.logo} alt={r.team.name} />
                    </div>

                    <div className="standNameCell">{r.team.name}</div>

                    <div className="standNumsCell">
                      <span className="standNumCell">{r.played}</span>
                      <span className="standNumCell">{r.points}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="standFootnote">*RKHBS heeft 1 punt in mindering</div>
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
