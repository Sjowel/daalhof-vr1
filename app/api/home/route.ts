import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    fixtures: [
      {
        id: "w1",
        kickoff: "2026-01-18T10:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w2",
        kickoff: "2026-01-25T13:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
      {
        id: "w3",
        kickoff: "2026-02-01T10:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w4",
        kickoff: "2026-02-08T12:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
      {
        id: "w5",
        kickoff: "2026-03-01T10:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w6",
        kickoff: "2026-03-08T11:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
      {
        id: "w7",
        kickoff: "2026-03-15T10:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w8",
        kickoff: "2026-03-22T13:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
      {
        id: "w9",
        kickoff: "2026-04-06T13:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w10",
        kickoff: "2026-04-12T09:30:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
      {
        id: "w11",
        kickoff: "2026-04-19T10:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w12",
        kickoff: "2026-04-26T10:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
      {
        id: "w13",
        kickoff: "2026-05-10T10:00:00+01:00",
        homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w14",
        kickoff: "2026-05-17T13:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      },
      {
        id: "w15",
        kickoff: "2026-05-24T11:00:00+01:00",
        homeTeam: { name: "Uitteam", logo: "/home-logo.png" },
        awayTeam: { name: "Daalhof VR1", logo: "/away-logo.png" },
      },
    ],
    lastResult: {
      homeTeam: { name: "Daalhof VR1", logo: "/home-logo.png" },
      awayTeam: { name: "Uitteam", logo: "/away-logo.png" },
      score: { home: 0, away: 1 },
    },

    // Nieuw: standings data voor de Stand-sectie
    standings: [
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
    ],
  });
}
