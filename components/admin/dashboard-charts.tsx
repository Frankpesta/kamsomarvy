"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useMemo } from "react";

interface DashboardChartsProps {
  stats: {
    total: number;
    forSale: number;
    forRent: number;
    land: number;
    carcass: number;
    preFinish: number;
    finished: number;
    featured: number;
  };
}

// Theme-aware colors (light mode)
const lightColors = [
  "#3b82f6", // blue (primary)
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
];

// Theme-aware colors (dark mode)
const darkColors = [
  "#60a5fa", // lighter blue
  "#34d399", // lighter green
  "#fbbf24", // lighter amber
  "#f87171", // lighter red
  "#a78bfa", // lighter purple
];

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const { resolvedTheme } = useTheme();

  // Use resolvedTheme which is only available after mount, avoiding hydration issues
  const colors = useMemo(
    () => (resolvedTheme === "dark" ? darkColors : lightColors),
    [resolvedTheme]
  );
  const primaryColor = useMemo(
    () => (resolvedTheme === "dark" ? "#60a5fa" : "#3b82f6"),
    [resolvedTheme]
  );

  const categoryData = [
    { name: "For Sale", value: stats.forSale },
    { name: "For Rent", value: stats.forRent },
  ];

  const propertyTypeData = [
    { name: "Land", value: stats.land },
    { name: "Carcass", value: stats.carcass },
    { name: "Pre-Finish", value: stats.preFinish },
    { name: "Finished", value: stats.finished },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Properties by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Properties by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Properties by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Properties by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={primaryColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

