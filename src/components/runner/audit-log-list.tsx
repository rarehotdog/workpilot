import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RunLog } from '@/lib/types';

function formatDateLabel(dateIso: string): string {
  const date = new Date(dateIso);
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

type AuditLogListProps = {
  logs: RunLog[];
  selectedLogId?: string | null;
  onSelectLog?: (log: RunLog) => void;
};

export function AuditLogList({ logs, selectedLogId, onSelectLog }: AuditLogListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log (최근 3건)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">실행 이력이 없습니다.</p>
        ) : (
          logs.map((log) => (
            <button
              key={log.id}
              type="button"
              onClick={() => onSelectLog?.(log)}
              className={cn(
                'w-full rounded-lg border border-border p-3 text-left transition hover:border-sky-300/70',
                selectedLogId === log.id ? 'border-sky-300/70 bg-sky-500/10' : null
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{formatDateLabel(log.createdAt)} / anonymous</span>
                <span className={log.status === 'success' ? 'text-emerald-300' : 'text-rose-300'}>{log.status}</span>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">입력: {JSON.stringify(log.inputValues)}</p>
              <p className="text-xs">{log.outputPreview}</p>
              {typeof log.totalTokens === 'number' ? (
                <p className="mt-2 text-xs text-muted-foreground">tokens: {log.totalTokens}</p>
              ) : null}
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
