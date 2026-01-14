"use client";

import { useEffect, useMemo, useState } from "react";

type Team = {
  name: string;
  logo: string;
};

type Fixture = {
  id: string;
  kickoff: string; // ISO string
  homeTeam: Team;
  awayTeam: Team;
};

type StandingRow = {
  rank: number;
  team: Team;
  played: number; // G
  points: number; // P
};

type HomeApiResponse = {
  fixtures: Fixture[];
  lastResult: {
    homeTeam: Team;
    awayTeam: Team;
    score: { home: number; away: number };
  };
  standings: StandingRow[];
  results: Result[];
};


type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
};

type Result = {
  id: string;
  date: string; // "YYYY-MM-DD"
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number; away: number };
};

function getCountdown(targetMs: number): Countdown {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true };
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isExpired: false };
}

// Zorgt dat "mijn team" altijd in het midden staat: 3 boven + mijn team + 3 onder (= 7)
// Als er te weinig boven/onder is, vult hij aan vanaf de andere kant.
function buildStandWindow(rows: StandingRow[], myTeamName: string) {
  if (!rows || rows.length === 0) return [];

  const norm = (s: string) => s.trim().toLowerCase();
  const myIdx = rows.findIndex((r) => norm(r.team.name) === norm(myTeamName));

  // Fallback: team niet gevonden => toon top 7
  if (myIdx === -1) return rows.slice(0, 7);

  const needAbove = 3;
  const needBelow = 3;

  let start = myIdx - needAbove;
  let end = myIdx + needBelow + 1; // +1 want slice end is exclusive

  // Clamp eerste poging
  if (start < 0) {
    end += -start; // schuif window naar beneden
    start = 0;
  }
  if (end > rows.length) {
    const over = end - rows.length;
    start = Math.max(0, start - over); // schuif window naar boven
    end = rows.length;
  }

  // Pak window
  let windowRows = rows.slice(start, end);

  // Zorg dat window maximaal 7 is
  if (windowRows.length > 7) {
    // prefer: mijn team in het midden houden -> neem precies 7 rond myIdx binnen bounds
    const fixedStart = Math.max(0, Math.min(myIdx - needAbove, rows.length - 7));
    windowRows = rows.slice(fixedStart, fixedStart + 7);
  }

  return windowRows;
}

export default function HomePage() {
  const [data, setData] = useState<HomeApiResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [cd, setCd] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    isExpired: false,
  });

  // 1) Data ophalen
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setStatus("loading");
        const res = await fetch("/api/home", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as HomeApiResponse;
        if (!isMounted) return;

        setData(json);
        setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!isMounted) return;
        setStatus("error");
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // veilige defaults
  const fixtures = data?.fixtures ?? [];
  const lastResult = data?.lastResult ?? null;
  const standings = data?.standings ?? [];

  // 2) Kies automatisch de eerstvolgende wedstrijd
  const nextMatch = useMemo(() => {
    const now = Date.now();

    const upcoming = fixtures
      .map((m) => ({ ...m, ms: new Date(m.kickoff).getTime() }))
      .filter((m) => Number.isFinite(m.ms) && m.ms > now)
      .sort((a, b) => a.ms - b.ms);

    return upcoming[0] ?? null;
  }, [fixtures]);

  // 3) Countdown target uit nextMatch
  const targetMs = useMemo(() => {
    if (!nextMatch) return null;
    const ms = new Date(nextMatch.kickoff).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [nextMatch]);

  // 4) Interval voor countdown
  useEffect(() => {
    if (!targetMs) {
      setCd({ days: 0, hours: 0, minutes: 0, isExpired: false });
      return;
    }

    setCd(getCountdown(targetMs));

    const id = window.setInterval(() => {
      setCd(getCountdown(targetMs));
    }, 1000);

    return () => window.clearInterval(id);
  }, [targetMs]);

  // render flags
  const isLoading = status === "loading";
  const isError = status === "error";
  const hasNextMatch = !!nextMatch;
  const hasLastResult = !!lastResult;

  // Programma: altijd 3 komende wedstrijden vanaf de eerstvolgende
  const programMatches = useMemo(() => {
    const now = Date.now();

    const upcomingSorted = fixtures
      .map((m) => ({ ...m, ms: new Date(m.kickoff).getTime() }))
      .filter((m) => Number.isFinite(m.ms) && m.ms > now)
      .sort((a, b) => a.ms - b.ms);

    return upcomingSorted.slice(0, 3);
  }, [fixtures]);

  // Stand: window van 7 met Daalhof in midden
  const standWindow = useMemo(() => {
    // belangrijk: sorteren op rank (voor zekerheid)
    const sorted = [...standings].sort((a, b) => a.rank - b.rank);
    return buildStandWindow(sorted, "Daalhof");
  }, [standings]);

  return (
    <main className="phone">
      {/* Volgende wedstrijd */}
      <section className="nextMatch" aria-label="Volgende wedstrijd">
        <h2 className="nextMatchTitle">Volgende wedstrijd</h2>

        {isLoading && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}

        {isError && (
          <p style={{ margin: 0, opacity: 0.7 }}>
            Kon data niet laden. Check of <code>/api/home</code> werkt.
          </p>
        )}

        {!isLoading && !isError && !hasNextMatch && (
          <p style={{ margin: 0, opacity: 0.7 }}>Geen komende wedstrijd gevonden.</p>
        )}

        {!isLoading && !isError && hasNextMatch && (
          <>
            <div className="nextMatchRow">
              <div className="teamLogo" aria-label={`${nextMatch.homeTeam.name} logo`}>
                <img src={nextMatch.homeTeam.logo} alt={nextMatch.homeTeam.name} />
              </div>

              <div className="countdown" role="group" aria-label="Countdown tot volgende wedstrijd">
                <div className="countdownItem">
                  <div className="countdownLabel">Dagen</div>
                  <div className="countdownValue">{cd.days}</div>
                </div>

                <div className="countdownItem">
                  <div className="countdownLabel">Uren</div>
                  <div className="countdownValue">{cd.hours}</div>
                </div>

                <div className="countdownItem">
                  <div className="countdownLabel">Minuten</div>
                  <div className="countdownValue">{cd.minutes}</div>
                </div>
              </div>

              <div className="teamLogo" aria-label={`${nextMatch.awayTeam.name} logo`}>
                <img src={nextMatch.awayTeam.logo} alt={nextMatch.awayTeam.name} />
              </div>
            </div>

            {cd.isExpired && (
              <p className="nextMatchExpired" role="status">
                De wedstrijd is gestart (of de tijd is verstreken).
              </p>
            )}
          </>
        )}
      </section>

      {/* Laatste uitslag */}
      <section className="lastResult" aria-label="Laatste uitslag">
        <div className="lastResultHeader">
          <h2 className="lastResultTitle">Laatste uitslag</h2>
          <a className="lastResultLink" href="/uitslagen">
            Alle uitslagen &gt;
          </a>
        </div>

        {isLoading && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}

        {isError && (
          <p style={{ margin: 0, opacity: 0.7 }}>
            Kon data niet laden. Check of <code>/api/home</code> werkt.
          </p>
        )}

        {!isLoading && !isError && !hasLastResult && (
          <p style={{ margin: 0, opacity: 0.7 }}>Nog geen uitslag beschikbaar.</p>
        )}

        {!isLoading && !isError && hasLastResult && (
          <div className="lastResultRow">
            <div className="teamLogo" aria-label={`${lastResult.homeTeam.name} logo`}>
              <img src={lastResult.homeTeam.logo} alt={lastResult.homeTeam.name} />
            </div>

            <div className="scoreBox" aria-label="Uitslag">
              <span className="scoreNumber">{lastResult.score.home}</span>
              <span className="scoreDash">-</span>
              <span className="scoreNumber">{lastResult.score.away}</span>
            </div>

            <div className="teamLogo" aria-label={`${lastResult.awayTeam.name} logo`}>
              <img src={lastResult.awayTeam.logo} alt={lastResult.awayTeam.name} />
            </div>
          </div>
        )}
      </section>

      {/* Programma */}
      <section className="program" aria-label="Programma">
        <div className="programHeader">
          <h2 className="programTitle">Programma</h2>
          <a className="programLink" href="/wedstrijden">
            Alle wedstrijden &gt;
          </a>
        </div>

        {isLoading && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}

        {!isLoading && !isError && programMatches.length === 0 && (
          <p style={{ margin: 0, opacity: 0.7 }}>Geen komende wedstrijden.</p>
        )}

        {!isLoading && !isError && programMatches.length > 0 && (
          <div className="programRow" role="list" aria-label="Komende wedstrijden">
            {programMatches.map((match) => {
              const dt = new Date(match.kickoff);

              const weekday = dt.toLocaleDateString("nl-NL", { weekday: "short" });
              const day = dt.getDate();
              const month = dt.getMonth() + 1;
              const dateLabel = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day}-${month}`;

              const timeLabel = dt.toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const isHome = match.homeTeam.name.toLowerCase().includes("daalhof");
              const homeAwayLabel = isHome ? "(T)" : "(U)";

              const opponent = isHome ? match.awayTeam : match.homeTeam;

              return (
                <article className="programCard" role="listitem" key={match.id}>
                  <div className="programLogoWrap" aria-label={`${opponent.name} logo`}>
                    <img className="programLogo" src={opponent.logo} alt={opponent.name} />
                  </div>

                  <div className="programDate">{dateLabel}</div>
                  <div className="programTime">
                    {timeLabel} <span className="programHomeAway">{homeAwayLabel}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Stand */}
      <section className="stand" aria-label="Stand">
        <div className="standHeader">
          <h2 className="standTitle">Stand</h2>
          <div className="standCols" aria-label="Kolommen">
            <span className="standCol">G</span>
            <span className="standCol">P</span>
          </div>
        </div>

        {isLoading && <p style={{ margin: 0, opacity: 0.7 }}>Laden…</p>}

        {!isLoading && !isError && standWindow.length === 0 && (
          <p style={{ margin: 0, opacity: 0.7 }}>Geen stand beschikbaar.</p>
        )}

        {!isLoading && !isError && standWindow.length > 0 && (
          <>
            <div className="standList" role="list" aria-label="Standings">
              {standWindow.map((r) => {
                const isMine = r.team.name.trim().toLowerCase() === "daalhof";
                return (
                  <div className={`standRow ${isMine ? "isMine" : ""}`} role="listitem" key={r.rank}>
                    <div className="standRank">{r.rank}</div>

                    <div className="standLogo" aria-label={`${r.team.name} logo`}>
                      <img src={r.team.logo} alt={r.team.name} />
                    </div>

                    <div className="standName">{r.team.name}</div>

                    <div className="standNum">{r.played}</div>
                    <div className="standNum">{r.points}</div>
                  </div>
                );
              })}
            </div>

            <a className="standMore" href="/stand">
              Volledige stand &gt;
            </a>
          </>
        )}
      </section>
            {/* Footer / Tabbar */}
      <nav className="footer" aria-label="Hoofd navigatie">
        <a className="footerItem" href="/wedstrijden" aria-label="Programma">
          <span className="footerIcon" aria-hidden>📅</span>
          <span className="footerLabel">Programma</span>
        </a>

        <a className="footerItem" href="/uitslagen" aria-label="Uitslagen">
          <span className="footerIcon" aria-hidden>🧾</span>
          <span className="footerLabel">Uitslagen</span>
        </a>

        <a className="footerItem" href="/stand" aria-label="Stand">
          <span className="footerIcon" aria-hidden>⭐</span>
          <span className="footerLabel">Stand</span>
        </a>
      </nav>

    </main>
    
  );
}


