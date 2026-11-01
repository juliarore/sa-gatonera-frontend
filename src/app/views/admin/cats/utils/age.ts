/** Edat en text a partir d'una data de naixement yyyy-mm-dd: "N mesos", "1 any" o "N anys". */
export function getAgeLabel(birthDate: string, now: Date = new Date()): string {
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);

  let months =
    (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth);
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
