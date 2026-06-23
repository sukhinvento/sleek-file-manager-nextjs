import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useNavigation } from "react-day-picker";
import type { CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// ── Month/year jump caption ────────────────────────────────────────────────────
// Keeps the EXACT same visual design (centered label, absolute-positioned nav
// buttons, same variant/sizing) but makes month & year selectable.

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CURR_YEAR = new Date().getFullYear();
// Covers DOB (back to 1920) and future order/delivery dates (5 years ahead)
const YEAR_OPTIONS: number[] = Array.from(
  { length: CURR_YEAR + 5 - 1919 },
  (_, i) => CURR_YEAR + 5 - i,
);

function CalendarCaption({ displayMonth }: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();

  return (
    <div className="flex justify-center pt-1 relative items-center">
      {/* ← Previous */}
      <button
        type="button"
        aria-label="Go to previous month"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Month · Year — styled to match existing caption_label exactly */}
      <div className="flex items-center gap-0.5">
        {/* Month select */}
        <div className="relative">
          <select
            value={displayMonth.getMonth()}
            onChange={e =>
              goToMonth(new Date(displayMonth.getFullYear(), +e.target.value, 1))
            }
            className="
              appearance-none cursor-pointer
              bg-transparent text-sm font-medium
              rounded px-1 py-0.5 pr-4
              focus:outline-none hover:text-primary
              transition-colors
            "
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          {/* Inline chevron — same colour as the muted nav icon */}
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Year select */}
        <div className="relative">
          <select
            value={displayMonth.getFullYear()}
            onChange={e =>
              goToMonth(new Date(+e.target.value, displayMonth.getMonth(), 1))
            }
            className="
              appearance-none cursor-pointer
              bg-transparent text-sm font-medium
              rounded px-1 py-0.5 pr-4
              focus:outline-none hover:text-primary
              transition-colors
            "
          >
            {YEAR_OPTIONS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Next → */}
      <button
        type="button"
        aria-label="Go to next month"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // Use our custom caption for month/year jump; keep the default day/nav icons
        Caption: CalendarCaption,
        IconLeft:  ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
