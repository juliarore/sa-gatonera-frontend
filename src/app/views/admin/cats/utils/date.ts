export function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function toInputDate(displayDate: string): string {
  const [day, month, year] = displayDate.split('/');
  return `${year}-${month}-${day}`;
}
