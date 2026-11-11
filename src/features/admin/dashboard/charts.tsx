"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { StudentSegment, WeekPoint } from "./model";
import { weekBars } from "./model";

const reading = "#e87532";
const listening = "#9060f8";

export function LearningChart({ week }: { week: WeekPoint[] }) {
  const bars = weekBars(week);
  return (
    <div className="h-64">
      <ul className="sr-only">
        {bars.map((bar) => (
          <li key={bar.day}>
            {bar.day}: reading {bar.readingHours} hours, listening{" "}
            {bar.listeningHours} hours
          </li>
        ))}
      </ul>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} barGap={4}>
          <CartesianGrid vertical={false} stroke="#e0e0e0" strokeDasharray="4 4" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}h`}
            width={36}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value) =>
              value === "readingHours" ? "Reading" : "Listening"
            }
          />
          <Bar
            dataKey="readingHours"
            fill={reading}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="listeningHours"
            fill={listening}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StudentDonut({
  total,
  segments,
}: {
  total: number;
  segments: StudentSegment[];
}) {
  const data = segments.length > 0 ? segments : [{ label: "Students", percent: 100 }];
  return (
    <div className="relative h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="percent"
            nameKey="label"
            innerRadius={58}
            outerRadius={78}
            stroke="none"
          >
            {data.map((segment, index) => (
              <Cell
                key={segment.label}
                fill={index % 2 === 0 ? reading : listening}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs text-muted-foreground">Total</p>
        <p className="text-2xl font-semibold text-foreground">{total}</p>
      </div>
    </div>
  );
}
