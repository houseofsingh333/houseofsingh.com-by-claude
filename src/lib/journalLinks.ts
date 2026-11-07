/** The address of one month of the journal archive (no leading zero). */
export function journalMonthHref(year: number, month: number): string {
  return `/journal/archive/${year}/${month}`;
}

/**
 * A plain left click with no modifier keys: the page handles it itself
 * (switching the view at once). Any other click (new tab, new window)
 * follows the link as normal.
 */
export function isPlainClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
