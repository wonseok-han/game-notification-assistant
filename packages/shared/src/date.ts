import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// dayjs 플러그인 확장
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export type { Dayjs };

export type ParsedDateType =
  | 'date'
  | 'timestamp_sec'
  | 'timestamp_ms'
  | 'invalid';

/**
 * 입력값을 dayjs 객체로 파싱합니다.
 * @param input timestamp(초/밀리초) 또는 날짜 문자열
 * @returns Dayjs 객체 또는 null
 */
export function parseDate(input: string): Dayjs | null {
  if (/^\d{13}$/.test(input.trim())) {
    // 13자리: 밀리초 timestamp
    return dayjs(Number(input.trim()));
  } else if (/^\d{10}$/.test(input.trim())) {
    // 10자리: 초 timestamp
    return dayjs.unix(Number(input.trim()));
  } else if (dayjs(input.trim()).isValid()) {
    // 날짜 문자열
    return dayjs(input.trim());
  }
  return null;
}

/**
 * 입력값을 dayjs 객체와 타입으로 파싱합니다.
 * @param input timestamp(초/밀리초) 또는 날짜 문자열
 * @returns { date: Dayjs, type: ParsedDateType }
 */
export function parseDateWithType(input: string): {
  date: Dayjs;
  type: ParsedDateType;
} {
  if (/^\d{13}$/.test(input.trim())) {
    return { date: dayjs(Number(input.trim())), type: 'timestamp_ms' };
  } else if (/^\d{10}$/.test(input.trim())) {
    return { date: dayjs.unix(Number(input.trim())), type: 'timestamp_sec' };
  } else if (dayjs(input.trim()).isValid()) {
    return { date: dayjs(input.trim()), type: 'date' };
  }
  return { date: dayjs(NaN), type: 'invalid' };
}

/**
 * dayjs 객체를 원하는 포맷과 타임존으로 변환합니다.
 * @param date Dayjs 객체
 * @param format 포맷 문자열 (예: 'YYYY-MM-DD HH:mm:ss')
 * @param tz 타임존 (예: 'Asia/Seoul')
 * @returns 변환된 문자열
 */
export function formatDate(date: Dayjs, format: string, tz?: string): string {
  if (!date.isValid()) return '-';
  if (tz) {
    return date.tz(tz).format(format);
  }
  return date.format(format);
}

/**
 * dayjs 객체의 상대적 시간을 반환합니다.
 * @param date Dayjs 객체
 * @returns 예: '3시간 전', '2일 후'
 */
export function getRelative(date: Dayjs): string {
  return date.fromNow();
}
