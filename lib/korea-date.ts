const KOREA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function koreaDateKey(value: Date | string = new Date()) {
  return KOREA_DATE_FORMATTER.format(typeof value === "string" ? new Date(value) : value);
}
