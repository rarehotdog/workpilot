import * as React from 'react';
import { cn } from './utils';

const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('Chart helpers must be used within <ChartContainer>.');
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div data-slot="chart" data-chart={chartId} className={cn('flex aspect-video items-center justify-center text-xs', className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <div className="h-full w-full">{children}</div>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, value]) => value.theme || value.color);
  if (!colorConfig.length) return null;

  const styleText = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const lines = colorConfig
        .map(([key, item]) => {
          const color = item.theme?.[theme as keyof typeof item.theme] ?? item.color;
          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join('\n');

      return `${prefix} [data-chart=${id}] {\n${lines}\n}`;
    })
    .join('\n');

  return <style dangerouslySetInnerHTML={{ __html: styleText }} />;
}

export function ChartTooltip(props: React.ComponentProps<'div'>) {
  return <div data-slot="chart-tooltip" {...props} />;
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<'div'> & {
  active?: boolean;
  payload?: Array<Record<string, unknown>>;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (value: React.ReactNode, payload?: Array<Record<string, unknown>>) => React.ReactNode;
  labelClassName?: string;
  formatter?: (value: unknown, name: unknown, item: Record<string, unknown>, index: number, raw: unknown) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const visibleLabel = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label, payload)
      : label;

  return (
    <div className={cn('grid min-w-[8rem] gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-xl', className)}>
      {visibleLabel ? <div className={cn('font-medium', labelClassName)}>{visibleLabel}</div> : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = String(nameKey ? item[nameKey] : item.name ?? item.dataKey ?? 'value');
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const itemColor = color ?? String(item.color ?? item.fill ?? '#9ca3af');
          const value = item.value;
          const name = item.name;

          return (
            <div key={`${key}-${index}`} className="flex w-full items-center gap-2">
              {!hideIndicator ? (
                <div
                  className={cn('shrink-0 rounded-[2px]', {
                    'h-2.5 w-2.5': indicator === 'dot',
                    'h-2.5 w-1': indicator === 'line',
                    'h-2.5 w-2 border border-dashed bg-transparent': indicator === 'dashed',
                  })}
                  style={{ backgroundColor: indicator === 'dashed' ? 'transparent' : itemColor, borderColor: itemColor }}
                />
              ) : null}
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="text-gray-500">{itemConfig?.label ?? String(name ?? key)}</span>
                <span className="font-mono font-medium tabular-nums text-gray-900">
                  {formatter ? formatter(value, name, item, index, item.payload) : String(value ?? '')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {labelKey ? <span className="sr-only">{labelKey}</span> : null}
    </div>
  );
}

export function ChartLegend(props: React.ComponentProps<'div'>) {
  return <div data-slot="chart-legend" {...props} />;
}

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: React.ComponentProps<'div'> & {
  hideIcon?: boolean;
  payload?: Array<Record<string, unknown>>;
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}>
      {payload.map((item, index) => {
        const key = String(nameKey ? item[nameKey] : item.dataKey ?? 'value');
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div key={`${key}-${index}`} className="flex items-center gap-1.5 text-sm">
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: String(item.color ?? '#9ca3af') }} />
            )}
            {itemConfig?.label ?? key}
          </div>
        );
      })}
    </div>
  );
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const payloadRecord = payload as Record<string, unknown>;
  const nested = typeof payloadRecord.payload === 'object' && payloadRecord.payload !== null
    ? (payloadRecord.payload as Record<string, unknown>)
    : undefined;

  let configKey = key;

  if (typeof payloadRecord[key] === 'string') {
    configKey = payloadRecord[key] as string;
  } else if (nested && typeof nested[key] === 'string') {
    configKey = nested[key] as string;
  }

  return config[configKey] ?? config[key];
}
