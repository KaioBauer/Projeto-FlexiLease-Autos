export class DateUtils {
  static parseDateString(dateString: string): Date | null {
    const [day, month, year] = dateString.split('/').map(Number);
    if (!day || !month || !year) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  static calculateDays(startDate: Date, endDate: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000; // number of milliseconds in a day
    return Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
  }
}
