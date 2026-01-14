import { NextResponse } from "next/server";

type Team = { name: string; logo: string };

type Result = {
  id: string;
  date: string; // YYYY-MM-DD
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number; away: number };

  // Alleen results met countForStand: true tellen mee voor automatische stand update
  countForStand?: boolean;
};

type StandingRow = {
  rank: number;
  team: Team;
  played: number; // G
  points: number; // P
};

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
 * Past ALLEEN Daalhof aan op basis van results die countForStand: true hebben.
 * Alle andere teams blijven exact zoals jij in standings hebt gezet.
 */
function applyCountedResultsToMyTeam(standings: StandingRow[], results: Result[]) {
  const counted = results.filter((r) => r.countForStand);

  if (counted.length === 0) return standings;

  const idx = standings.findIndex((r) => isMyTeam(r.team.name));
  if (idx === -1) return standings;

  const updated = standings.map((r) => ({ ...r, team: { ...r.team } }));
  const myRow = updated[idx];

  for (const r of counted) {
    const isHomeMine = isMyTeam(r.homeTeam.name);
    const isAwayMine = isMyTeam(r.awayTeam.name);

    // als Daalhof niet meedoet: skip
    if (!isHomeMine && !isAwayMine) continue;

    // altijd +1 gespeeld
    myRow.played += 1;

    // punten op basis van winst/gelijk/verlies
    const myGoals = isHomeMine ? r.score.home : r.score.away;
    const oppGoals = isHomeMine ? r.score.away : r.score.home;

    if (myGoals > oppGoals) myRow.points += 3;
    else if (myGoals === oppGoals) myRow.points += 1;
    // verlies: +0
  }

  return updated;
}

export async function GET() {
  // =========================
  // Fixtures (programma)
  // ids uniek gemaakt
  // =========================
  const fixtures = [
    {
      id: "w1",
      kickoff: "2026-01-18T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Groene Ster VR1", logo: "/away-logo.png" },
    },
    {
      id: "w2",
      kickoff: "2026-01-25T13:00:00+01:00",
      homeTeam: { name: "ST UOW'02 VR2", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
    {
      id: "w3",
      kickoff: "2026-02-01T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "BSV Limburgia/Kamerland VR1", logo: "/away-logo.png" },
    },
    {
      id: "w4",
      kickoff: "2026-02-08T12:00:00+01:00",
      homeTeam: { name: "RKHSV VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
    {
      id: "w5",
      kickoff: "2026-03-01T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "GSB'28 VR1", logo: "/away-logo.png" },
    },
    {
      id: "w6",
      kickoff: "2026-03-08T11:00:00+01:00",
      homeTeam: { name: "RKHBS VR2", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
    {
      id: "w7",
      kickoff: "2026-03-15T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Schimmert VR1", logo: "/away-logo.png" },
    },
    {
      id: "w8",
      kickoff: "2026-03-22T10:00:00+01:00",
      homeTeam: { name: "SV Argo VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
    {
      id: "w9",
      kickoff: "2026-04-06T13:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Weltania VR1", logo: "/away-logo.png" },
    },
    {
      id: "w10",
      kickoff: "2026-04-12T09:30:00+01:00",
      homeTeam: { name: "Weltania VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
    {
      id: "w11",
      kickoff: "2026-04-19T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "SVO DVC'16", logo: "/away-logo.png" },
    },
    {
      id: "w12",
      kickoff: "2026-04-26T10:00:00+01:00",
      homeTeam: { name: "Sportclub'25", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
    {
      id: "w13",
      kickoff: "2026-05-10T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Leonidas - W VR1", logo: "/away-logo.png" },
    },
    {
      id: "w14",
      kickoff: "2026-05-17T10:00:00+01:00",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "ST UOW'02 VR2", logo: "/away-logo.png" },
    },
    {
      id: "w15",
      kickoff: "2026-05-24T11:00:00+01:00",
      homeTeam: { name: "Groene Ster VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
    },
  ];

  // =========================
  // Results (uitslagen) – jouw input
  // Zet countForStand: true alleen bij de NIEUWE uitslag die je wilt laten meetellen.
  // =========================
  const results: Result[] = [
    {
      id: "r9",
      date: "2025-12-21",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Leonidas - W", logo: "/away-logo.png" },
      score: { home: 0, away: 1 },
    },
    {
      id: "r8",
      date: "2025-12-14",
      homeTeam: { name: "VV Iets", logo: "/away-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      score: { home: 3, away: 4 },
    },
    {
      id: "r7",
      date: "2025-12-07",
      homeTeam: { name: "RKVV", logo: "/away-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      score: { home: 2, away: 0 },
    },
    {
      id: "r6",
      date: "2025-11-30",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Sportclub'25", logo: "/away-logo.png" },
      score: { home: 0, away: 3 },
    },
    {
      id: "r5",
      date: "2025-11-23",
      homeTeam: { name: "SVO DVC'16", logo: "/away-logo.png" },
      awayTeam: { name: "Daalhof VR 1", logo: "/home-logo.png" },
      score: { home: 1, away: 3 },
    },
    {
      id: "r4",
      date: "2025-10-26",
      homeTeam: { name: "Schimmert", logo: "/away-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      score: { home: 1, away: 1 },
    },
    {
      id: "r3",
      date: "2025-10-12",
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "RKHSB", logo: "/away-logo.png" },
      score: { home: 2, away: 0 },
    },
    {
      id: "r2",
      date: "2025-10-05",
      homeTeam: { name: "GSV'28", logo: "/away-logo.png" },
      awayTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      score: { home: 2, away: 0 },
    },
    {
      id: "r1",
      date: "2025-09-28",
      homeTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      awayTeam: { name: "RKHSV", logo: "/home-logo.png" },
      score: { home: 1, away: 1 },
    },
  ];

  // =========================
  // Standings – blijft zoals jij het invult
  // =========================
  const standings: StandingRow[] = [
    { rank: 1, team: { name: "Leonidas - W", logo: "/away-logo.png" }, played: 10, points: 22 },
    { rank: 2, team: { name: "Sportclub'25", logo: "/away-logo.png" }, played: 9, points: 21 },
    { rank: 3, team: { name: "RKHSV", logo: "/away-logo.png" }, played: 8, points: 20 },
    { rank: 4, team: { name: "GSV’28", logo: "/away-logo.png" }, played: 9, points: 20 },
    { rank: 5, team: { name: "S.V. Argo", logo: "/away-logo.png" }, played: 7, points: 17 },
    { rank: 6, team: { name: "Daalhof", logo: "/home-logo.png" }, played: 9, points: 16 },
    { rank: 7, team: { name: "ST UOW’02", logo: "/away-logo.png" }, played: 9, points: 8 },
    { rank: 8, team: { name: "Groene Ster", logo: "/away-logo.png" }, played: 9, points: 8 },
    { rank: 9, team: { name: "Schimmert", logo: "/away-logo.png" }, played: 8, points: 6 },
    { rank: 10, team: { name: "BSV Limburgia/Kamerland", logo: "/away-logo.png" }, played: 8, points: 6 },
    { rank: 11, team: { name: "SVO DVC'16", logo: "/away-logo.png" }, played: 9, points: 6 },
    { rank: 12, team: { name: "Weltania", logo: "/away-logo.png" }, played: 7, points: 2 },
    { rank: 13, team: { name: "RKHBS", logo: "/away-logo.png" }, played: 10, points: 2 },
  ];

  // =========================
  // lastResult = nieuwste uitslag uit results op basis van date
  // =========================
  const resultsSorted = [...results].sort((a, b) => (a.date < b.date ? 1 : -1));
  const newest = resultsSorted[0] ?? null;

  const lastResult = newest
    ? {
        homeTeam: newest.homeTeam,
        awayTeam: newest.awayTeam,
        score: newest.score,
      }
    : null;

  // =========================
  // standings updaten: alleen Daalhof telt results met countForStand: true
  // =========================
  const updatedStandings = applyCountedResultsToMyTeam(standings, results);

  return NextResponse.json({
    fixtures,
    results,
    lastResult,
    standings: updatedStandings,
  });
}
