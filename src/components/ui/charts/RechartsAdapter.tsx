"use client";

import { 
  LineChart as RechartsLine, 
  BarChart as RechartsBar, 
  AreaChart as RechartsArea, 
  PieChart as RechartsPie,
  Line, Bar, Area, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

import { ChartProps } from "./ChartAdapter";

const DEFAULT_SERIES = [{ dataKey: "value", color: "#ffffff" }];
const MONOCHROME_PALETTE = ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"];

export function RechartsAdapter({ type, data, series = DEFAULT_SERIES, height = 300, hideLegend }: ChartProps & { type: "line" | "bar" | "area" | "donut" }) {
  
  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: -20, bottom: 0 }
  };

  const renderTooltip = () => (
    <Tooltip 
      contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px", color: "#fff" }}
      itemStyle={{ color: "#fff" }}
    />
  );

  const renderAxes = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
      <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} />
      <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
    </>
  );

  if (type === "line") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RechartsLine {...commonProps}>
            {renderAxes()}
            {renderTooltip()}
            {!hideLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {series.map((s, i) => (
              <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color || MONOCHROME_PALETTE[i % 5]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name={s.name} />
            ))}
          </RechartsLine>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RechartsBar {...commonProps}>
            {renderAxes()}
            {renderTooltip()}
            {!hideLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {series.map((s, i) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} fill={s.color || MONOCHROME_PALETTE[i % 5]} radius={[4, 4, 0, 0]} name={s.name} />
            ))}
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "area") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RechartsArea {...commonProps}>
            {renderAxes()}
            {renderTooltip()}
            {!hideLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {series.map((s, i) => (
              <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} fill={s.color || MONOCHROME_PALETTE[i % 5]} stroke={s.color || MONOCHROME_PALETTE[i % 5]} fillOpacity={0.2} name={s.name} />
            ))}
          </RechartsArea>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "donut") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RechartsPie>
            {renderTooltip()}
            {!hideLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MONOCHROME_PALETTE[index % MONOCHROME_PALETTE.length]} />
              ))}
            </Pie>
          </RechartsPie>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
