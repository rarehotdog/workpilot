import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, ListTree, TriangleAlert } from 'lucide-react';
import type { DecisionLogViewItem } from '../../types/app';
import { Badge, Button, Card, CardContent } from '../ui';

interface DecisionLogSectionProps {
  items: DecisionLogViewItem[];
  windowDays?: number;
  lastUpdatedAt?: string | null;
  onOpenItem: (item: DecisionLogViewItem) => void;
}

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;

  return new Date(parsed).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatStatus(status: DecisionLogViewItem['execution']['latestStatus']): {
  label: string;
  className: string;
} {
  if (status === 'applied') {
    return {
      label: 'applied',
      className: 'bg-emerald-50 text-emerald-700',
    };
  }
  if (status === 'delayed') {
    return {
      label: 'delayed',
      className: 'bg-amber-50 text-amber-700',
    };
  }
  if (status === 'skipped') {
    return {
      label: 'skipped',
      className: 'bg-slate-100 text-slate-700',
    };
  }

  return {
    label: 'pending',
    className: 'bg-violet-50 text-violet-700',
  };
}

export default function DecisionLogSection({
  items,
  windowDays = 14,
  lastUpdatedAt,
  onOpenItem,
}: DecisionLogSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(
    () => (expanded ? items : items.slice(0, 5)),
    [expanded, items],
  );

  return (
    <Card data-testid="decision-log-section" className="rounded-2xl border-gray-100 shadow-sm">
      <CardContent className="card-padding">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="heading-3 text-gray-900">Decision Log</h3>
            <p className="caption-12 mt-0.5 text-gray-500">
              최근 {windowDays}일 의사결정 기록
            </p>
          </div>
          <div className="rounded-lg bg-violet-50 px-2 py-1 caption-12 font-semibold text-violet-700">
            {items.length}건
          </div>
        </div>

        {lastUpdatedAt ? (
          <p className="caption-12 mb-3 text-gray-400">
            마지막 갱신 {formatDateTime(lastUpdatedAt)}
          </p>
        ) : null}

        {items.length === 0 ? (
          <div
            data-testid="decision-log-empty"
            className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4"
          >
            <p className="body-14 font-medium text-gray-700">
              아직 Decision Log가 없어요.
            </p>
            <p className="caption-12 mt-1 text-gray-500">
              퀘스트 생성/재생성 이후 의사결정 기록이 쌓입니다.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleItems.map((item) => {
              const statusMeta = formatStatus(item.execution.latestStatus);
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid="decision-log-item"
                  onClick={() => onOpenItem(item)}
                  className="w-full rounded-xl border border-gray-100 bg-white p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="caption-12 text-gray-500">
                      {formatDateTime(item.createdAt)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`rounded-full caption-11 font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </Badge>
                      <Badge
                        className={`rounded-full caption-11 font-semibold ${
                          item.validation.pass
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.validation.pass ? 'valid' : 'needs-review'}
                      </Badge>
                    </div>
                  </div>
                  <p className="body-14 font-semibold text-gray-900 line-clamp-1">
                    {item.question}
                  </p>
                  <p className="caption-12 mt-1 text-gray-600 line-clamp-1">
                    선택: {item.selectedOptionTitle}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {items.length > 5 ? (
          <Button
            data-testid="decision-log-toggle"
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => setExpanded((previous) => !previous)}
          >
            <ListTree className="h-4 w-4" />
            {expanded ? '최근 5개만 보기' : '전체 보기'}
          </Button>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-50 p-2.5">
            <p className="caption-12 text-emerald-600">Validation</p>
            <div className="mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <p className="body-13 font-semibold text-emerald-700">
                {items.filter((item) => item.validation.pass).length} valid
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 p-2.5">
            <p className="caption-12 text-amber-600">Review</p>
            <div className="mt-1 flex items-center gap-1">
              <TriangleAlert className="h-3.5 w-3.5 text-amber-600" />
              <p className="body-13 font-semibold text-amber-700">
                {items.filter((item) => !item.validation.pass).length} needs review
              </p>
            </div>
          </div>
        </div>
        <div className="mt-2 rounded-xl bg-slate-50 p-2.5">
          <p className="caption-12 text-slate-500">최근 실행</p>
          <div className="mt-1 flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5 text-slate-500" />
            <p className="body-13 text-slate-700">
              최신 기록의 실행 상태를 기준으로 회고를 제공합니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
