"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type EnrollmentData = {
  date: string
  enrollments: number
}

export function ChartAreaInteractive({ data }: { data: EnrollmentData[] }) {
  const totalEnrollments = React.useMemo(
    () => data.reduce((total, item) => total + item.enrollments, 0),
    [data],
  )

  return (
    <Card className="rounded-sm border-border/80 bg-card">
      <CardHeader className="px-7">
        <CardTitle className="text-xl">Total Enrollments</CardTitle>
        <CardDescription className="text-base">
          Total Enrollments for the last 30 days: {totalEnrollments}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-3 pb-3 sm:px-7 sm:pb-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={28}
              tickFormatter={(value) =>
                new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis hide allowDecimals={false} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.35 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar
              dataKey="enrollments"
              fill="var(--color-enrollments)"
              radius={[2, 2, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
