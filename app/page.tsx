"use client";

import { useEffect, useMemo, useState } from "react";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
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

export default function HomePage() {
  // Voorbeeld: 7 januari 2026 om 14:30 (maand is 0-based: 0=januari)
  const targetDate = useMemo(() => new Date(2026, 0, 18, 10, 0, 0), []);
  const targetMs = targetDate.getTime();

  const [cd, setCd] = useState<Countdown>(() => getCountdown(targetMs));

  useEffect(() => {
    setCd(getCountdown(targetMs));
    const id = window.setInterval(() => setCd(getCountdown(targetMs)), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  return (
    <main className="phone">
      {/* Volgende wedstrijd */}
      <section className="nextMatch" aria-label="Volgende wedstrijd">
        <h2 className="nextMatchTitle">Volgende wedstrijd</h2>

        <div className="nextMatchRow">
          <div className="teamLogo" aria-label="Thuisteam logo">
            <img src="/home-logo.png" alt="Thuisteam" />
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

          <div className="teamLogo" aria-label="Uitteam logo">
            <img src="/away-logo.png" alt="Uitteam" />
          </div>
        </div>

        {cd.isExpired && (
          <p className="nextMatchExpired" role="status">
            De wedstrijd is gestart (of de tijd is verstreken).
          </p>
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

        <div className="lastResultRow">
          <div className="teamLogo" aria-label="Thuisteam logo (laatste uitslag)">
            <img src="/home-logo.png" alt="Thuisteam" />
          </div>

          <div className="scoreBox" aria-label="Uitslag">
            <span className="scoreNumber">0</span>
            <span className="scoreDash">-</span>
            <span className="scoreNumber">1</span>
          </div>

          <div className="teamLogo" aria-label="Uitteam logo (laatste uitslag)">
            <img src="/away-logo.png" alt="Uitteam" />
          </div>
        </div>
      </section>
    </main>
  );
}
