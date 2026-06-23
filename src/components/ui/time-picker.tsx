import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ─── Constants ─────────────────────────────────────────────────────────────
const ITEM_H  = 36;
const VISIBLE = 5;
const WHEEL_H = ITEM_H * VISIBLE;   // 180px
const PAD     = ITEM_H * 2;         // padding so first/last item can reach centre

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

// ─── Helpers ───────────────────────────────────────────────────────────────
function parse24(v: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  const [h = '9', m = '0'] = v.split(':');
  const n = parseInt(h, 10);
  const period: 'AM' | 'PM' = n >= 12 ? 'PM' : 'AM';
  const hour12 = n % 12 === 0 ? '12' : String(n % 12).padStart(2, '0');
  const min5   = String(Math.round(parseInt(m, 10) / 5) * 5 % 60).padStart(2, '0');
  return { hour: hour12, minute: min5, period };
}
function to24(h: string, m: string, p: 'AM' | 'PM') {
  let n = parseInt(h, 10);
  if (p === 'AM' && n === 12) n = 0;
  if (p === 'PM' && n !== 12) n += 12;
  return `${String(n).padStart(2, '0')}:${m}`;
}
function display(v: string) {
  const { hour, minute, period } = parse24(v);
  return `${hour}:${minute} ${period}`;
}

// ─── Wheel column ──────────────────────────────────────────────────────────
function WheelColumn({
  items, selected, onSelect, width = 52,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  width?: number;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const settling  = React.useRef(false);
  const debounce  = React.useRef<ReturnType<typeof setTimeout>>();

  const snapTo = React.useCallback((idx: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' as ScrollBehavior });
  }, []);

  // Initial position — instant, no animation
  React.useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0) snapTo(idx, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    if (settling.current) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.max(0, Math.min(Math.round(el.scrollTop / ITEM_H), items.length - 1));
      settling.current = true;
      snapTo(idx);
      onSelect(items[idx]);
      setTimeout(() => { settling.current = false; }, 300);
    }, 100);
  };

  // Also support mouse wheel on desktop inside a popover
  const onWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: e.deltaY > 0 ? ITEM_H : -ITEM_H, behavior: 'smooth' });
  };

  const MASK = 'linear-gradient(to bottom, transparent 0%, black 28%, black 72%, transparent 100%)';

  return (
    <div className="relative flex-shrink-0" style={{ width, height: WHEEL_H }}>
      {/* Selection highlight band — sits above the masked scroll div */}
      <div
        className="pointer-events-none absolute inset-x-1 z-20 rounded-lg border border-primary/25 bg-primary/10"
        style={{ top: PAD, height: ITEM_H }}
      />

      {/* Scrollable drum — masked at top & bottom for fade effect */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onWheel={onWheel}
        style={{
          height: WHEEL_H,
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          paddingTop: PAD,
          paddingBottom: PAD,
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          maskImage: MASK,
          WebkitMaskImage: MASK,
        } as React.CSSProperties}
      >
        {items.map(item => {
          const active = item === selected;
          return (
            <div
              key={item}
              onClick={() => {
                const idx = items.indexOf(item);
                settling.current = true;
                snapTo(idx);
                onSelect(item);
                setTimeout(() => { settling.current = false; }, 300);
              }}
              style={{ height: ITEM_H, scrollSnapAlign: 'center' } as React.CSSProperties}
              className={cn(
                'flex items-center justify-center cursor-pointer select-none transition-all duration-100',
                active
                  ? 'text-primary font-bold text-sm'
                  : 'text-muted-foreground font-normal text-xs'
              )}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────
interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
}

// ─── TimePicker ─────────────────────────────────────────────────────────────
export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  hasError = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { hour, minute, period } = value ? parse24(value) : { hour: '09', minute: '00', period: 'AM' as const };
  const emit = (h: string, m: string, p: 'AM' | 'PM') => onChange?.(to24(h, m, p));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !value && 'text-muted-foreground',
            hasError && 'border-destructive',
            className
          )}
        >
          <Clock className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          {value ? display(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      {/* No overflow:hidden on PopoverContent — that was blocking child scroll */}
      <PopoverContent
        className="p-0 shadow-xl border-border bg-background rounded-xl"
        style={{ width: 228 }}
        align="start"
      >
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-border bg-muted/40 rounded-t-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Time</p>
        </div>

        {/* Column labels */}
        <div className="flex items-center px-3 pt-3 pb-1">
          <div style={{ width: 52 }} className="text-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Hour</span>
          </div>
          <div className="w-6" />
          <div style={{ width: 52 }} className="text-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Min</span>
          </div>
          <div className="flex-1" />
          <div style={{ width: 44 }} className="text-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Period</span>
          </div>
        </div>

        {/* Wheels */}
        <div className="flex items-center px-3 pb-3 gap-0">
          <WheelColumn items={HOURS}   selected={hour}   onSelect={h => emit(h, minute, period)} width={52} />

          {/* Colon — centred with the selection band row */}
          <div className="w-6 flex items-center justify-center" style={{ height: WHEEL_H }}>
            <span className="text-sm font-bold text-muted-foreground/50 select-none">:</span>
          </div>

          <WheelColumn items={MINUTES} selected={minute} onSelect={m => emit(hour, m, period)}  width={52} />

          {/* Vertical rule */}
          <div className="self-center mx-2.5" style={{ width: 1, height: WHEEL_H - 24, background: 'hsl(var(--border))' }} />

          <WheelColumn items={PERIODS} selected={period} onSelect={p => emit(hour, minute, p as 'AM' | 'PM')} width={44} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 rounded-b-xl">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {value ? display(value) : <span className="text-muted-foreground text-xs">—</span>}
          </span>
          <Button size="sm" className="h-7 px-4 text-xs" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
