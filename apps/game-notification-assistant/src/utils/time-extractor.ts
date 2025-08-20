/**
 * 게임 스크린샷에서 시간 추출 유틸리티
 */
import { extractTextWithGoogleVision } from './google-vision';

/**
 * 시간 패턴 타입
 * @interface ExtractedTimeType
 * @property {number} hours - 시간
 * @property {number} minutes - 분
 * @property {number} seconds - 초
 * @property {number} totalMinutes - 총 분으로 환산한 시간
 */
export interface ExtractedTimeType {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
}

/**
 * 시간 추출을 위한 정규식 패턴들
 * 다양한 게임 시간 표기 형식을 지원
 */
const TIME_PATTERNS = [
  // 기본 패턴들
  /(\d+)시간\s*(\d+)분\s*(\d+)초\s*남음/, // "3시간 15분 2초 남음" 패턴
  /(\d+)시간\s*(\d+)분\s*남음/, // "3시간 15분 남음" 패턴
  /(\d+)분\s*(\d+)초\s*남음/, // "12분 2초 남음" 패턴
  /(\d+)시간\s*남음/, // "3시간 남음" 패턴
  /(\d+)분\s*남음/, // "15분 남음" 패턴
  /(\d+)초\s*남음/, // "30초 남음" 패턴

  // "남음" 없이 끝나는 패턴들
  /(\d+)시간\s*(\d+)분\s*(\d+)초/, // "3시간 15분 2초" 패턴
  /(\d+)시간\s*(\d+)분/, // "3시간 15분" 패턴
  /(\d+)분\s*(\d+)초/, // "12분 2초" 패턴
  /(\d+)시간/, // "3시간" 패턴
  /(\d+)분/, // "15분" 패턴
  /(\d+)초/, // "30초" 패턴

  // "까지" 패턴들
  /(\d+)시간\s*(\d+)분\s*(\d+)초\s*까지/, // "3시간 15분 2초까지" 패턴
  /(\d+)시간\s*(\d+)분\s*까지/, // "3시간 15분까지" 패턴
  /(\d+)분\s*(\d+)초\s*까지/, // "12분 2초까지" 패턴
  /(\d+)시간\s*까지/, // "3시간까지" 패턴
  /(\d+)분\s*까지/, // "15분까지" 패턴
  /(\d+)초\s*까지/, // "30초까지" 패턴

  // 절대적인 날짜/시간 패턴들
  /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/, // "2024년 12월 25일 오후 3시 30분"
  /(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/, // "12월 25일 오후 3시 30분"
  /(\d{1,2})일\s*(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/, // "25일 오후 3시 30분"
  /(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/, // "오후 3시 30분"
  /(\d{1,2}):(\d{2})/, // "15:30"
  /(\d{1,2}):(\d{2})\s*(AM|PM)/, // "3:30 PM"
];

/**
 * 텍스트에서 시간 정보를 추출하는 함수
 * @param {string} text - 분석할 텍스트
 * @returns {ExtractedTimeType | null} 추출된 시간 정보 또는 null
 */
export function extractTimeFromText(text: string): ExtractedTimeType | null {
  for (const pattern of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (
        pattern.source.includes('시간') &&
        pattern.source.includes('분') &&
        pattern.source.includes('초')
      ) {
        // "3시간 15분 2초 남음" 패턴
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseInt(match[3] || '0', 10);
        return {
          hours,
          minutes,
          seconds,
          totalMinutes: hours * 60 + minutes + seconds / 60,
        };
      } else if (
        pattern.source.includes('시간') &&
        pattern.source.includes('분')
      ) {
        // "3시간 15분 남음" 패턴
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        return {
          hours,
          minutes,
          seconds: 0,
          totalMinutes: hours * 60 + minutes,
        };
      } else if (
        pattern.source.includes('분') &&
        pattern.source.includes('초')
      ) {
        // "12분 2초 남음" 패턴
        const minutes = parseInt(match[1] || '0', 10);
        const seconds = parseInt(match[2] || '0', 10);
        return {
          hours: 0,
          minutes,
          seconds,
          totalMinutes: minutes + seconds / 60,
        };
      } else if (pattern.source.includes('시간')) {
        // "3시간 남음" 패턴
        const hours = parseInt(match[1] || '0', 10);
        return {
          hours,
          minutes: 0,
          seconds: 0,
          totalMinutes: hours * 60,
        };
      } else if (pattern.source.includes('분')) {
        // "15분 남음" 패턴
        const minutes = parseInt(match[1] || '0', 10);
        return {
          hours: 0,
          minutes,
          seconds: 0,
          totalMinutes: minutes,
        };
      } else if (pattern.source.includes('초')) {
        // "30초 남음" 패턴
        const seconds = parseInt(match[1] || '0', 10);
        return {
          hours: 0,
          minutes: 0,
          seconds,
          totalMinutes: seconds / 60,
        };
      } else if (
        pattern.source.includes('년') ||
        pattern.source.includes('월') ||
        pattern.source.includes('일') ||
        pattern.source.includes('시') ||
        pattern.source.includes(':')
      ) {
        // 절대적인 날짜/시간 패턴들
        return extractAbsoluteTime(match, pattern.source);
      }
    }
  }
  return null;
}

/**
 * 절대적인 날짜/시간을 상대 시간으로 변환하는 함수
 * @param {RegExpMatchArray} match - 정규식 매치 결과
 * @param {string} patternSource - 패턴 소스 문자열
 * @returns {ExtractedTimeType | null} 변환된 시간 정보 또는 null
 */
function extractAbsoluteTime(
  match: RegExpMatchArray,
  patternSource: string
): ExtractedTimeType | null {
  try {
    const now = new Date();
    let targetDate = new Date();

    if (
      patternSource.includes('년') &&
      patternSource.includes('월') &&
      patternSource.includes('일')
    ) {
      // "2024년 12월 25일 오후 3시 30분" 패턴
      const year = parseInt(match[1] || now.getFullYear().toString(), 10);
      const month =
        parseInt(match[2] || (now.getMonth() + 1).toString(), 10) - 1;
      const day = parseInt(match[3] || now.getDate().toString(), 10);
      const isPM = match[4] === '오후';
      const hour =
        parseInt(match[5] || '0', 10) + (isPM && match[5] !== '12' ? 12 : 0);
      const minute = parseInt(match[6] || '0', 10);

      targetDate = new Date(year, month, day, hour, minute);
    } else if (patternSource.includes('월') && patternSource.includes('일')) {
      // "12월 25일 오후 3시 30분" 패턴
      const month =
        parseInt(match[1] || (now.getMonth() + 1).toString(), 10) - 1;
      const day = parseInt(match[2] || now.getDate().toString(), 10);
      const isPM = match[3] === '오후';
      const hour =
        parseInt(match[4] || '0', 10) + (isPM && match[4] !== '12' ? 12 : 0);
      const minute = parseInt(match[5] || '0', 10);

      targetDate = new Date(now.getFullYear(), month, day, hour, minute);
    } else if (patternSource.includes('일')) {
      // "25일 오후 3시 30분" 패턴
      const day = parseInt(match[1] || now.getDate().toString(), 10);
      const isPM = match[2] === '오후';
      const hour =
        parseInt(match[3] || '0', 10) + (isPM && match[3] !== '12' ? 12 : 0);
      const minute = parseInt(match[4] || '0', 10);

      targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        day,
        hour,
        minute
      );
    } else if (patternSource.includes('시') && patternSource.includes('분')) {
      // "오후 3시 30분" 패턴
      const isPM = match[1] === '오후';
      const hour =
        parseInt(match[2] || '0', 10) + (isPM && match[2] !== '12' ? 12 : 0);
      const minute = parseInt(match[3] || '0', 10);

      targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute
      );
    } else if (patternSource.includes(':')) {
      // "15:30" 또는 "3:30 PM" 패턴
      const hour = parseInt(match[1] || '0', 10);
      const minute = parseInt(match[2] || '0', 10);

      if (patternSource.includes('PM') && hour !== 12) {
        targetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hour + 12,
          minute
        );
      } else if (patternSource.includes('AM') && hour === 12) {
        targetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          minute
        );
      } else {
        targetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hour,
          minute
        );
      }
    }

    // 현재 시간과의 차이 계산
    const diffMs = targetDate.getTime() - now.getTime();
    if (diffMs < 0) {
      // 이미 지난 시간인 경우
      return null;
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return {
      hours,
      minutes,
      seconds: 0,
      totalMinutes: diffMinutes,
    };
  } catch (error) {
    console.error('절대 시간 변환 실패:', error);
    return null;
  }
}

/**
 * 현재 시간에 추출된 시간을 더해 알림 시간을 계산하는 함수
 * @param {ExtractedTimeType} extractedTime - 추출된 시간 정보
 * @returns {Date} 계산된 알림 시간
 */
export function calculateNotificationTime(
  extractedTime: ExtractedTimeType
): Date {
  const now = new Date();

  // 올바른 계산 방식: totalMinutes를 밀리초로 변환하여 정확한 시간 계산
  const notificationTime = new Date(
    now.getTime() + extractedTime.totalMinutes * 60 * 1000
  );

  console.log('현재 시간:', now.toLocaleString('ko-KR'));
  console.log('추출된 시간:', extractedTime);
  console.log('계산된 알림 시간:', notificationTime.toLocaleString('ko-KR'));
  console.log('차이 (분):', extractedTime.totalMinutes);

  return notificationTime;
}

/**
 * 시간을 사용자에게 읽기 쉬운 형태로 변환하는 함수
 * @param {ExtractedTimeType} extractedTime - 추출된 시간 정보
 * @returns {string} 포맷된 시간 문자열 (예: "3시간 15분 후")
 */
export function formatTimeForDisplay(extractedTime: ExtractedTimeType): string {
  const parts: string[] = [];

  if (extractedTime.hours > 0) {
    parts.push(`${extractedTime.hours}시간`);
  }
  if (extractedTime.minutes > 0) {
    parts.push(`${extractedTime.minutes}분`);
  }
  if (extractedTime.seconds > 0) {
    parts.push(`${extractedTime.seconds}초`);
  }

  return `${parts.join(' ')} 후`;
}

/**
 * 텍스트에서 여러 시간을 추출하는 함수
 * @param {string} text - 분석할 텍스트
 * @returns {ExtractedTimeType[] | null} 추출된 시간 정보 배열 또는 null
 */
export function extractMultipleTimesFromText(
  text: string
): ExtractedTimeType[] | null {
  // 더 구체적인 패턴을 먼저 매칭하고, 해당 구간과 겹치는 짧은 패턴은 무시
  const orderedPatterns: RegExp[] = [
    // 절대 시간(날짜/시각) 우선
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/gu,
    /(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/gu,
    /(\d{1,2})일\s*(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/gu,
    /(오전|오후)?\s*(\d{1,2})시\s*(\d{1,2})분/gu,
    /(\d{1,2}):(\d{2})\s*(AM|PM)/gu,
    /(\d{1,2}):(\d{2})/gu,
    // 상대 시간(가장 구체적인 것부터)
    /(\d+)시간\s*(\d+)분\s*(\d+)초\s*(남음|까지)?/gu,
    /(\d+)시간\s*(\d+)분\s*(남음|까지)?/gu,
    /(\d+)분\s*(\d+)초\s*(남음|까지)?/gu,
    /(\d+)시간\s*(남음|까지)?/gu,
    /(\d+)분\s*(남음|까지)?/gu,
    /(\d+)초\s*(남음|까지)?/gu,
  ];

  const acceptedRanges: { start: number; end: number }[] = [];
  const acceptedTimes: ExtractedTimeType[] = [];

  const overlaps = (start: number, end: number): boolean =>
    acceptedRanges.some((r) => !(end <= r.start || start >= r.end));

  for (const regex of orderedPatterns) {
    let match: RegExpExecArray | null;
    // lastIndex를 이용한 반복 매칭
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      const matchedText = match[0];
      const start = match.index ?? text.indexOf(matchedText);
      const end = start + matchedText.length;

      // 이미 더 긴 패턴으로 수용된 구간과 겹치면 스킵
      if (overlaps(start, end)) continue;

      const extractedTime = extractTimeFromText(matchedText);
      if (!extractedTime) continue;

      acceptedTimes.push(extractedTime);
      acceptedRanges.push({ start, end });
    }
  }

  return acceptedTimes.length > 0 ? acceptedTimes : null;
}

// Google Vision 전용 유틸은 './google-vision'로 이동

/**
 * Google Cloud Vision API를 사용하여 게임 이미지에서 시간을 추출하는 함수
 * @param {File} imageFile - 게임 스크린샷 파일
 * @returns {Promise<Object | null>} 추출된 시간 정보와 계산된 알림 시간
 */
export async function extractTimeFromGameImage(imageFile: File): Promise<{
  extractedTime: ExtractedTimeType;
  notificationTime: Date;
  displayText: string;
} | null> {
  try {
    // Google Vision API로 텍스트 추출
    const extractedText = await extractTextWithGoogleVision(imageFile);

    if (!extractedText) {
      return null;
    }

    // 텍스트에서 시간 추출
    const extractedTime = extractTimeFromText(extractedText);

    if (!extractedTime) {
      return null;
    }

    // 알림 시간 계산
    const notificationTime = calculateNotificationTime(extractedTime);

    // 표시용 텍스트 생성
    const displayText = formatTimeForDisplay(extractedTime);

    return {
      extractedTime,
      notificationTime,
      displayText,
    };
  } catch (error) {
    console.error('Google Vision API로 게임 이미지에서 시간 추출 실패:', error);
    return null;
  }
}

/**
 * Google Cloud Vision API를 사용하여 게임 이미지에서 여러 시간을 추출하는 함수
 * @param {File} imageFile - 게임 스크린샷 파일
 * @returns {Promise<Object | null>} 추출된 여러 시간 정보와 계산된 알림 시간들
 */
export async function extractMultipleTimesFromImage(imageFile: File): Promise<{
  extractedTimes: ExtractedTimeType[];
  notificationTimes: Date[];
  displayTexts: string[];
} | null> {
  try {
    // Google Vision API로 텍스트 추출
    const extractedText = await extractTextWithGoogleVision(imageFile);

    if (!extractedText) {
      return null;
    }

    // 텍스트에서 여러 시간 추출
    const extractedTimes = extractMultipleTimesFromText(extractedText);

    if (!extractedTimes || extractedTimes.length === 0) {
      return null;
    }

    // 각 시간에 대해 알림 시간 계산
    const notificationTimes = extractedTimes.map((time) =>
      calculateNotificationTime(time)
    );

    // 각 시간에 대해 표시용 텍스트 생성
    const displayTexts = extractedTimes.map((time) =>
      formatTimeForDisplay(time)
    );

    return {
      extractedTimes,
      notificationTimes,
      displayTexts,
    };
  } catch (error) {
    console.error(
      'Google Vision API로 게임 이미지에서 여러 시간 추출 실패:',
      error
    );
    return null;
  }
}
