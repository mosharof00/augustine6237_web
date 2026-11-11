"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ClassProgressSegment, TeacherWeekPoint } from "./model";

const COLORS = [
  "#e87532", // Primary orange
  "#9060f8", // Purple
  "#06b6d4", // Cyan
  "#18b030", // Success green
  "#f59e0b", // Amber
];

export function QuizAverageChart({ week }: { week: TeacherWeekPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ul className="sr-only">
        {week.map((item) => (
          <li key={item.day}>
            {item.day}: {item.quizAverage}% quiz average, {item.points} points awarded
          </li>
        ))}
      </ul>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={week} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="quizBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f89050" stopOpacity={1} />
              <stop offset="100%" stopColor="#e87532" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#e0e0e0"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#485070", fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => `${val}%`}
            tick={{ fill: "#485070", fontSize: 12 }}
            width={45}
          />
          <Bar
            dataKey="quizAverage"
            fill="url(#quizBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClassProgressDonut({
  total,
  segments,
}: {
  total: number;
  segments: ClassProgressSegment[];
}) {
  const chartData =
    segments.length > 0
      ? segments.map((s) => ({ name: s.name, value: s.share || 1 }))
      : [{ name: "No classes", value: 1 }];

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={72}
              stroke="none"
              paddingAngle={segments.length > 1 ? 3 : 0}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">
            {total < 10 && total >= 0 ? `0${total}` : total}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {segments.map((seg, index) => (
          <div key={seg.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{seg.name}</span>
            {seg.share > 0 ? (
              <span className="text-xs text-muted-foreground">
                ({seg.share}%)
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
