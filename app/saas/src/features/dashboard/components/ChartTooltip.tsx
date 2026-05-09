/**
 * ChartTooltip — Recharts custom tooltip component.
 * Uses .chart-tooltip CSS class (defined in index.css) instead of contentStyle inline objects.
 * The dot color accent is a static ring class — chart accent colors come from the chart series itself.
 */
interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number | string; name?: string }[];
  label?: string;
  /** Unit suffix, e.g. " MMK" or " Tenants" */
  unit?: string;
  /** Format value with toLocaleString() for large numbers */
  formatNumber?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
  formatNumber = false,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip__label">{label}</p>}
      {payload.map((entry, i) => {
        const raw = Number(entry.value ?? 0);
        const display = formatNumber ? raw.toLocaleString() : String(raw);
        return (
          <div key={i} className="chart-tooltip__row">
            <span className="font-bold text-white">
              {display}
              {unit}
            </span>
            {entry.name && (
              <span className="chart-tooltip__name">{entry.name}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
