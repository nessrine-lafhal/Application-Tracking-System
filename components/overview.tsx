"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Jan", candidatures: 45, embauches: 8 },
  { name: "Fév", candidatures: 52, embauches: 12 },
  { name: "Mar", candidatures: 48, embauches: 9 },
  { name: "Avr", candidatures: 61, embauches: 15 },
  { name: "Mai", candidatures: 55, embauches: 11 },
  { name: "Juin", candidatures: 67, embauches: 18 },
  { name: "Juil", candidatures: 43, embauches: 7 },
  { name: "Août", candidatures: 39, embauches: 6 },
  { name: "Sep", candidatures: 58, embauches: 14 },
  { name: "Oct", candidatures: 72, embauches: 21 },
  { name: "Nov", candidatures: 69, embauches: 19 },
  { name: "Déc", candidatures: 156, embauches: 23 },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey="candidatures" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Candidatures" />
        <Bar dataKey="embauches" fill="hsl(var(--primary) / 0.6)" radius={[4, 4, 0, 0]} name="Embauches" />
      </BarChart>
    </ResponsiveContainer>
  )
}
