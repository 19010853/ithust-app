import { differenceInCalendarDays, format, getISOWeek, isSameDay, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export class TimeAgo {
  static transform(value: string | number | Date): string {
    if (!value) {
      return '';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    return this.timeDifference(new Date(), new Date(date));
  }

  static chatMessageTransform(value: string | number | Date): string {
    if (!value) {
      return '';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    const yesterday = subDays(new Date(), 1);
    if (isSameDay(date, new Date())) {
      return 'Hôm nay';
    } else if (isSameDay(date, yesterday)) {
      return 'Hôm qua';
    } else if (getISOWeek(new Date()) === getISOWeek(date) || getISOWeek(new Date()) - getISOWeek(date) === 1) {
      return format(date, 'EEEE', { locale: vi });
    } else {
      return format(date, 'd MMMM, yyyy', { locale: vi });
    }
  }

  static formatDateToMonthAndYear(value: string): string {
    if (!value) {
      return '';
    }
    const date: Date = new Date(value);
    return format(date, 'MMMM, yyyy', { locale: vi });
  }

  static dayMonthYear(value: string): string {
    const date: Date = new Date(value);
    return format(date, 'd MMMM, yyyy', { locale: vi });
  }

  static dayWithTime(value: string): string {
    const date: Date = new Date(value);
    return `${format(date, 'd MMM', { locale: vi })} lúc ${format(date, 'HH:mm')}`;
  }

  static timeFormat(value: string): string {
    const date: Date = new Date(value);
    return format(date, 'HH:mm a');
  }

  static compareDates(date1: string, date2: string): number {
    const firstDate: string = format(new Date(date1), 'd/MM/yyyy');
    const secondDate: string = format(new Date(date2), 'd/MM/yyyy');
    if (firstDate > secondDate) {
      return -1;
    } else if (firstDate < secondDate) {
      return 1;
    } else {
      return 0;
    }
  }

  static dateInDays(date: string): string {
    if (!date) {
      return 'Chưa có';
    }
    let result = '';
    const difference: number = differenceInCalendarDays(new Date(), new Date(date));
    const months: number = Math.floor(difference / 30);
    if (months <= 0) {
      const weeks: number = Math.floor(difference / 7);
      result = weeks >= 1 ? `${weeks} tuần` : `${difference} ngày`;
    } else if (months === 1) {
      result = `${months} tháng`;
    } else {
      result = `${months} tháng`;
    }
    return result;
  }

  static timeDifference(current: number | Date, date: number | Date): string {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const elapsed = current.valueOf() - date.valueOf();

    if (format(current, 'yyyy') === format(date, 'yyyy')) {
      if (elapsed < msPerMinute) {
        return this.secondsAgo(elapsed);
      } else if (elapsed < msPerHour) {
        return this.minutesAgo(elapsed, msPerMinute);
      } else if (elapsed < msPerDay) {
        return this.hoursAgo(elapsed, msPerHour);
      } else if (elapsed < msPerMonth) {
        return this.monthsAgo(date, elapsed, msPerDay);
      } else {
        return format(date, 'd MMM', { locale: vi });
      }
    } else {
      return format(date, 'd MMM, yyyy', { locale: vi });
    }
  }

  static secondsAgo(elapsed: number): string {
    if (Math.round(elapsed / 1000) <= 1) {
      return 'vừa xong';
    } else {
      return `${Math.round(elapsed / 1000)} giây trước`;
    }
  }

  static minutesAgo(elapsed: number, msPerMinute: number): string {
    if (Math.round(elapsed / msPerMinute) <= 1) {
      return '1 phút trước';
    } else {
      return `${Math.round(elapsed / msPerMinute)} phút trước`;
    }
  }

  static hoursAgo(elapsed: number, msPerHour: number): string {
    if (Math.round(elapsed / msPerHour) <= 1) {
      return '1 giờ trước';
    } else {
      return `${Math.round(elapsed / msPerHour)} giờ trước`;
    }
  }

  static monthsAgo(date: number | Date, elapsed: number, msPerDay: number): string {
    if (Math.round(elapsed / msPerDay) <= 7) {
      return format(date, 'eeee', { locale: vi });
    } else {
      return format(date, 'd MMM', { locale: vi });
    }
  }
}
