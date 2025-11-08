import { type Locale } from './i18n';

export class DateUtils {
    constructor(private getLang: () => Locale) {}

    getFormattedDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = this.getWeekdayName(date);
        
        return `${year}-${month}-${day}_${weekday}`;
    }

    getWeekdayName(date: Date): string {
        const lang = this.getLang();
        const weekdays = lang === 'zh'
            ? ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekdays[date.getDay()];
    }

    getWeekNumber(date: Date): number {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
        return weekNumber;
    }
    // 获取前一天的日期
    getPreviousDate(date: Date): Date {
        const prevDate = new Date(date);
        prevDate.setDate(date.getDate() - 1);
        return prevDate;
    }
}
