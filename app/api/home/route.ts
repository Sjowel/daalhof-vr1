import { NextResponse } from "next/server";

type Team = { name: string; logo: string };

type Match = {
  id: string;
  kickoff: string; // ISO
  homeTeam: Team;
  awayTeam: Team;
  // Alleen aanwezig als gespeeld:
  score?: { home: number; away: number };
};

type Result = {
  id: string;
  date: string; // YYYY-MM-DD
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number; away: number };
};

type StandingRow = {
  rank: number;
  team: Team;
  played: number; // G
  points: number; // P
};

function isoToDate(iso: string) {
  return iso.slice(0, 10);
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// herkent "Daalhof", "Daalhof VR1", "Daalhof VR 1"
function isMyTeam(teamName: string) {
  return normalizeName(teamName).includes("daalhof");
}

/**
 * Rekent Daalhof ALTIJD opnieuw uit op basis van results waar Daalhof in voorkomt.
 * Alle andere teams blijven exact zoals jij invult in standings.
 */
function recomputeMyTeamRow(standings: StandingRow[], results: Result[]) {
  const idx = standings.findIndex((r) => isMyTeam(r.team.name));
  if (idx === -1) return standings;

  let played = 0;
  let points = 0;

  for (const r of results) {
    const isHomeMine = isMyTeam(r.homeTeam.name);
    const isAwayMine = isMyTeam(r.awayTeam.name);
    if (!isHomeMine && !isAwayMine) continue;

    played += 1;

    const myGoals = isHomeMine ? r.score.home : r.score.away;
    const oppGoals = isHomeMine ? r.score.away : r.score.home;

    if (myGoals > oppGoals) points += 3;
    else if (myGoals === oppGoals) points += 1;
    // verlies: +0
  }

  const updated = standings.map((r) => ({ ...r, team: { ...r.team } }));
  updated[idx] = { ...updated[idx], played, points };

  return updated;
}

/**
 * Sorteert de volledige stand opnieuw en kent rank opnieuw toe.
 * Hierdoor schuift Daalhof omhoog/omlaag als de punten veranderen.
 *
 * Tiebreakers (simpel):
 * 1) points (desc)
 * 2) played (asc)  -> minder wedstrijden gespeeld is beter bij gelijke punten
 * 3) teamnaam (asc)
 */
function reorderAndRankStandings(rows: StandingRow[]) {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.played !== b.played) return a.played - b.played;

    const na = a.team.name.toLowerCase();
    const nb = b.team.name.toLowerCase();
    return na < nb ? -1 : na > nb ? 1 : 0;
  });

  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function GET() {
  // =========================
  // 1) ÉÉN bron: matches
  //    - toekomstige wedstrijden: geen score
  //    - gespeelde wedstrijden: score invullen
  // =========================
  const matches: Match[] = [
    // Gespeelde wedstrijden (zet score erin)
    {
      id: "m1",
      kickoff: "2025-09-28T10:00:00+02:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "RKHSV", logo: "/logos/rkhsv.png" },
      score: { home: 1, away: 1 },
    },
    {
      id: "m2",
      kickoff: "2025-10-05T10:00:00+02:00",
      homeTeam: { name: "GSV'28", logo: "/logos/gsv.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      score: { home: 1, away: 2 },
    },
    {
      id: "m3",
      kickoff: "2025-10-12T10:00:00+02:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "RKHSB", logo: "/logos/rkhsb.png" },
      score: { home: 2, away: 0 },
    },
    {
      id: "m4",
      kickoff: "2025-10-26T10:00:00+01:00",
      homeTeam: { name: "Schimmert", logo: "/logos/schimmert.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      score: { home: 0, away: 1 },
    },
    {
      id: "m5",
      kickoff: "2025-11-23T10:00:00+01:00",
      homeTeam: { name: "SVO DVC'16", logo: "/logos/dvc.png" },
      awayTeam: { name: "Daalhof VR 1", logo: "/logos/daalhof.png" },
      score: { home: 1, away: 3 },
    },
    {
      id: "m6",
      kickoff: "2025-11-30T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "Sportclub'25", logo: "/logos/sportclub.png" },
      score: { home: 0, away: 3 },
    },
    {
      id: "m7",
      kickoff: "2025-12-07T10:00:00+01:00",
      homeTeam: { name: "Leonidas - W", logo: "/logos/leonidas.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      score: { home: 2, away: 0 },
    },
    {
      id: "m8",
      kickoff: "2025-12-14T10:00:00+01:00",
      homeTeam: { name: "BSV Limburgia", logo: "/logos/limburgia.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      score: { home: 3, away: 4 },
    },
    {
      id: "m9",
      kickoff: "2025-12-21T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "SV Argo", logo: "/logos/argo.png" },
      score: { home: 0, away: 1 },
    },

    // Toekomstige wedstrijden (laat score weg)
    {
      id: "w1",
      kickoff: "2026-01-18T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "Groene Ster VR1", logo: "/logos/groenester.png" },

      
    },
    {
      id: "w2",
      kickoff: "2026-01-25T13:00:00+01:00",
      homeTeam: { name: "ST UOW'02 VR2", logo: "/logos/uow.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
    {
      id: "w3",
      kickoff: "2026-02-01T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "BSV Limburgia/Kamerland VR1", logo: "/logos/limburgia.png" },
    },
    {
      id: "w4",
      kickoff: "2026-02-08T12:00:00+01:00",
      homeTeam: { name: "RKHSV VR1", logo: "/logos/rkhsv.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
    {
      id: "w5",
      kickoff: "2026-03-01T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "GSB'28 VR1", logo: "/logos/gsv.png" },
    },
    {
      id: "w6",
      kickoff: "2026-03-08T11:00:00+01:00",
      homeTeam: { name: "RKHBS VR2", logo: "/logos/rkhsb.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
    {
      id: "w7",
      kickoff: "2026-03-15T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "Schimmert VR1", logo: "/logos/schimmert.png" },
    },
    {
      id: "w8",
      kickoff: "2026-03-22T10:00:00+01:00",
      homeTeam: { name: "SV Argo VR1", logo: "/logos/argo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
    {
      id: "w9",
      kickoff: "2026-04-06T13:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "Weltania VR1", logo: "/logos/weltania.png" },
    },
    {
      id: "w10",
      kickoff: "2026-04-12T09:30:00+01:00",
      homeTeam: { name: "Weltania VR1", logo: "/logos/weltania.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
    {
      id: "w11",
      kickoff: "2026-04-19T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "SVO DVC'16", logo: "/logos/dvc.png" },
    },
    {
      id: "w12",
      kickoff: "2026-04-26T10:00:00+01:00",
      homeTeam: { name: "Sportclub'25", logo: "/logos/sportclub.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
    {
      id: "w13",
      kickoff: "2026-05-10T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "Leonidas - W VR1", logo: "/logos/leonidas.png" },
    },
    {
      id: "w14",
      kickoff: "2026-05-17T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
      awayTeam: { name: "ST UOW'02 VR2", logo: "/logos/uow.png" },
    },
    {
      id: "w15",
      kickoff: "2026-05-24T11:00:00+01:00",
      homeTeam: { name: "Groene Ster VR1", logo: "/logos/groenester.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/logos/daalhof.png" },
    },
  ];

  // =========================
  // 2) Split automatisch naar fixtures/results
  // =========================
  const fixtures = matches
    .filter((m) => !m.score)
    .map(({ id, kickoff, homeTeam, awayTeam }) => ({
      id,
      kickoff,
      homeTeam,
      awayTeam,
    }));

  const results: Result[] = matches
    .filter((m) => !!m.score)
    .map((m) => ({
      id: m.id,
      date: isoToDate(m.kickoff),
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      score: m.score!,
    }));

  // =========================
  // 3) lastResult = nieuwste result op basis van date
  // =========================
  const resultsSorted = [...results].sort((a, b) => (a.date < b.date ? 1 : -1));
  const newest = resultsSorted[0] ?? null;

  const lastResult = newest
    ? { homeTeam: newest.homeTeam, awayTeam: newest.awayTeam, score: newest.score }
    : null;

  // =========================
  // 4) standings HANDMATIG invullen (andere teams)
  //    maar Daalhof wordt automatisch herberekend uit results
  // =========================
  const standings: StandingRow[] = [
    { rank: 1, team: { name: "Leonidas - W", logo: "/logos/leonidas.png" }, played: 10, points: 22 },
    { rank: 2, team: { name: "Sportclub'25", logo: "/logos/sportclub.png" }, played: 9, points: 21 },
    { rank: 3, team: { name: "RKHSV", logo: "/logos/rkhsv.png" }, played: 8, points: 20 },
    { rank: 4, team: { name: "GSV’28", logo: "/logos/gsv.png" }, played: 9, points: 20 },
    { rank: 5, team: { name: "S.V. Argo", logo: "/logos/argo.png" }, played: 7, points: 17 },
    // Daalhof: played/points worden overschreven
    { rank: 6, team: { name: "Daalhof", logo: "/logos/daalhof.png" }, played: 9, points: 16 },
    { rank: 7, team: { name: "ST UOW’02", logo: "/logos/uow.png" }, played: 9, points: 8 },
    { rank: 8, team: { name: "Groene Ster", logo: "/logos/groenester.png" }, played: 9, points: 8 },
    { rank: 9, team: { name: "Schimmert", logo: "/logos/schimmert.png" }, played: 8, points: 6 },
    { rank: 10, team: { name: "BSV Limburgia/Kamerland", logo: "/logos/limburgia.png" }, played: 8, points: 6 },
    { rank: 11, team: { name: "SVO DVC'16", logo: "/logos/dvc.png" }, played: 9, points: 6 },
    { rank: 12, team: { name: "Weltania", logo: "/logos/weltania.png" }, played: 7, points: 2 },
    { rank: 13, team: { name: "RKHBS", logo: "/logos/rkhsb.png" }, played: 10, points: 2 },
  ];

  // 5) Update alleen Daalhof op basis van results
  const updatedStandings = recomputeMyTeamRow(standings, results);

  // 6) Sorteer opnieuw en ken ranks opnieuw toe (zodat Daalhof kan stijgen/dalen)
  const rankedStandings = reorderAndRankStandings(updatedStandings);

  return NextResponse.json({
    fixtures,
    results,
    lastResult,
    standings: rankedStandings,
  });
}
