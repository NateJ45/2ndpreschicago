// Single source of truth for the worship service time.
//
// The church edits ONE object in Sanity (siteSettings.worshipService); every
// structured place that shows the time (header bar, footer, home service band,
// worship "when we gather", the "This Sunday" line, and the Google/JSON-LD
// opening hours) derives its display string from here. So changing the time is
// one edit. Prose sentences (closing-CTA subheads, SEO descriptions) are
// intentionally time-agnostic so the actual time never has to be repeated there.
//
// When the field is unset, every value falls back to the church's current
// wording, so the site is unchanged until an editor sets it.

export interface WorshipService {
  /** Human time shown across the site, e.g. "11am". */
  time?: string;
  /** Day of the week, singular, e.g. "Sunday". Pluralized + composed as needed. */
  day?: string;
  /** 24-hour start, for the Google/JSON-LD opening hours, e.g. "11:00". */
  startTime24?: string;
  /** 24-hour end, for the Google/JSON-LD opening hours, e.g. "12:15". */
  endTime24?: string;
}

export interface ServiceTimeStrings {
  time: string;
  day: string;
  opens: string;
  closes: string;
  /** "Sundays at 11am" — header utility bar + footer. */
  line: string;
  /** "11am, every Sunday" — home service-times band. */
  bandTime: string;
  /** "Sundays, 11am" — weekly-rhythm style. */
  rhythmTime: string;
  /** "11am" — worship "when we gather" big time. */
  gatherTime: string;
  /** "Every Sunday morning" — worship "when we gather" day line. */
  gatherDay: string;
  /** "11am" — the small "This Sunday" line under the home hero. */
  thisSunday: string;
}

export function serviceTime(ws?: WorshipService | null): ServiceTimeStrings {
  const time = ws?.time?.trim() || '11am';
  const day = ws?.day?.trim() || 'Sunday';
  const opens = ws?.startTime24?.trim() || '11:00';
  const closes = ws?.endTime24?.trim() || '12:15';
  return {
    time,
    day,
    opens,
    closes,
    line: `${day}s at ${time}`,
    bandTime: `${time}, every ${day}`,
    rhythmTime: `${day}s, ${time}`,
    gatherTime: time,
    gatherDay: `Every ${day} morning`,
    thisSunday: time,
  };
}
