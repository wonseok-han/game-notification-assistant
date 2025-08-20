import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseBoolean,
  parseCommaSeparated,
  toValidJSVariableName,
  transformFileName,
  setLoggingConfig,
  log,
  error,
  warn,
  info,
} from './utils';

// Mock fs module
vi.mock('fs');
vi.mock('path');

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset logging config
    setLoggingConfig(true, false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseBoolean', () => {
    it('문자열 "true"를 true로 파싱해야 함', () => {
      expect(parseBoolean('true')).toBe(true);
    });

    it('문자열 "false"를 false로 파싱해야 함', () => {
      expect(parseBoolean('false')).toBe(false);
    });

    it('boolean true에 대해 true를 반환해야 함', () => {
      expect(parseBoolean(true)).toBe(true);
    });

    it('undefined에 대해 undefined를 반환해야 함', () => {
      expect(parseBoolean(undefined)).toBeUndefined();
    });

    it('잘못된 문자열에 대해 undefined를 반환해야 함', () => {
      expect(parseBoolean('invalid')).toBeUndefined();
    });
  });

  describe('parseCommaSeparated', () => {
    it('쉼표로 구분된 문자열을 배열로 파싱해야 함', () => {
      expect(parseCommaSeparated('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('공백을 제거해야 함', () => {
      expect(parseCommaSeparated(' a , b , c ')).toEqual(['a', 'b', 'c']);
    });

    it('빈 값을 필터링해야 함', () => {
      expect(parseCommaSeparated('a,,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('빈 문자열에 대해 undefined를 반환해야 함', () => {
      expect(parseCommaSeparated('')).toBeUndefined();
    });

    it('undefined에 대해 undefined를 반환해야 함', () => {
      expect(parseCommaSeparated(undefined)).toBeUndefined();
    });
  });

  describe('toValidJSVariableName', () => {
    it('잘못된 문자를 제거해야 함', () => {
      expect(toValidJSVariableName('user-name')).toBe('username');
    });

    it('숫자로 시작하는 경우 언더스코어 접두사를 추가해야 함', () => {
      expect(toValidJSVariableName('123name')).toBe('_123name');
    });

    it('유효한 문자를 보존해야 함', () => {
      expect(toValidJSVariableName('userName_123')).toBe('userName_123');
    });
  });

  describe('transformFileName', () => {
    it('camelCase로 변환해야 함', () => {
      expect(transformFileName('user-profile', 'camelCase')).toBe(
        'userProfile'
      );
    });

    it('PascalCase로 변환해야 함', () => {
      expect(transformFileName('user-profile', 'PascalCase')).toBe(
        'UserProfile'
      );
    });

    it('원래 명명 규칙을 사용해야 함', () => {
      expect(transformFileName('user-profile', 'original')).toBe('userprofile');
    });

    it('언더스코어를 처리해야 함', () => {
      expect(transformFileName('user_profile', 'camelCase')).toBe(
        'userProfile'
      );
    });

    it('기본값으로 PascalCase를 사용해야 함', () => {
      expect(transformFileName('user-profile', 'PascalCase')).toBe(
        'UserProfile'
      );
    });
  });

  describe('로깅 함수들', () => {
    let consoleSpy: {
      log: any;
      error: any;
      warn: any;
      info: any;
    };

    beforeEach(() => {
      consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      };
    });

    afterEach(() => {
      Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
    });

    it('로깅이 활성화되었을 때 console.log를 호출해야 함', () => {
      setLoggingConfig(true, false);
      log('test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('test message');
    });

    it('로깅이 비활성화되었을 때 console.log를 호출하지 않아야 함', () => {
      setLoggingConfig(false, false);
      log('test message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('로깅이 활성화되었을 때 console.error를 호출해야 함', () => {
      setLoggingConfig(true, false);
      error('test error');
      expect(consoleSpy.error).toHaveBeenCalledWith('test error');
    });

    it('로깅이 비활성화되었을 때 console.error를 호출하지 않아야 함', () => {
      setLoggingConfig(false, false);
      error('test error');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('로깅이 활성화되었을 때 console.warn을 호출해야 함', () => {
      setLoggingConfig(true, false);
      warn('test warning');
      expect(consoleSpy.warn).toHaveBeenCalledWith('test warning');
    });

    it('로깅이 비활성화되었을 때 console.warn을 호출하지 않아야 함', () => {
      setLoggingConfig(false, false);
      warn('test warning');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('디버그가 활성화되었을 때 console.info를 호출해야 함', () => {
      setLoggingConfig(true, true);
      info('test info');
      expect(consoleSpy.info).toHaveBeenCalledWith('test info');
    });

    it('디버그가 비활성화되었을 때 console.info를 호출하지 않아야 함', () => {
      setLoggingConfig(true, false);
      info('test info');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });
});
