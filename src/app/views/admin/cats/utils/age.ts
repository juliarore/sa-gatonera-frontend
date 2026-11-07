/** Edat en text a partir d'una data de naixement dd/mm/yyyy: "N mesos", "1 any" o "N anys". */
export function getAgeLabel(birthDate: string, now: Date = new Date()): string {
  const parts = birthDate.split('/').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return '';
  }
  const [birthDay, birthMonth, birthYear] = parts;

  let months = (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth);
  if (now.getDate() < birthDay) {
    months--;
  }
  months = Math.max(months, 0);

  if (months < 12) {
    const shownMonths = Math.max(months, 1);
    return shownMonths === 1 ? '1 mes' : `${shownMonths} mesos`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 any' : `${years} anys`;
}
