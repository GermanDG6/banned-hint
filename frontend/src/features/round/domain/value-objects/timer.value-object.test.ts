import { describe, it, expect } from 'vitest';
import { Timer } from './timer.value-object';
import { InvalidTimerException } from '../exceptions/invalid-timer.exception';

describe('Timer', () => {
  describe('create', () => {
    it('should create a valid timer with valid minutes and seconds', () => {
      const timer = Timer.create(1, 30);
      expect(timer.minutes).toBe(1);
      expect(timer.seconds).toBe(30);
    });

    it('should create a timer with 0 minutes', () => {
      const timer = Timer.create(0, 30);
      expect(timer.minutes).toBe(0);
      expect(timer.seconds).toBe(30);
    });

    it('should create a timer with 0 seconds', () => {
      const timer = Timer.create(1, 0);
      expect(timer.minutes).toBe(1);
      expect(timer.seconds).toBe(0);
    });

    it('should create a timer with maximum valid seconds (59)', () => {
      const timer = Timer.create(1, 59);
      expect(timer.seconds).toBe(59);
    });

    it('should throw InvalidTimerException when seconds > 59', () => {
      expect(() => Timer.create(1, 60)).toThrow(InvalidTimerException);
    });

    it('should throw InvalidTimerException when seconds < 0', () => {
      expect(() => Timer.create(1, -1)).toThrow(InvalidTimerException);
    });

    it('should throw InvalidTimerException when minutes < 0', () => {
      expect(() => Timer.create(-1, 30)).toThrow(InvalidTimerException);
    });

    it('should throw InvalidTimerException when both minutes and seconds are invalid', () => {
      expect(() => Timer.create(-1, 60)).toThrow(InvalidTimerException);
    });
  });

  describe('toSeconds', () => {
    it('should convert minutes and seconds to total seconds', () => {
      const timer = Timer.create(1, 30);
      expect(timer.toSeconds()).toBe(90);
    });

    it('should return only seconds when minutes is 0', () => {
      const timer = Timer.create(0, 45);
      expect(timer.toSeconds()).toBe(45);
    });

    it('should return only minutes converted when seconds is 0', () => {
      const timer = Timer.create(2, 0);
      expect(timer.toSeconds()).toBe(120);
    });

    it('should return 0 when both are 0', () => {
      const timer = Timer.create(0, 0);
      expect(timer.toSeconds()).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true when timers have the same minutes and seconds', () => {
      const timer1 = Timer.create(1, 30);
      const timer2 = Timer.create(1, 30);
      expect(timer1.equals(timer2)).toBe(true);
    });

    it('should return false when timers have different minutes', () => {
      const timer1 = Timer.create(1, 30);
      const timer2 = Timer.create(2, 30);
      expect(timer1.equals(timer2)).toBe(false);
    });

    it('should return false when timers have different seconds', () => {
      const timer1 = Timer.create(1, 30);
      const timer2 = Timer.create(1, 45);
      expect(timer1.equals(timer2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format timer as MM:SS', () => {
      const timer = Timer.create(1, 5);
      expect(timer.toString()).toBe('01:05');
    });

    it('should pad single digit minutes and seconds', () => {
      const timer = Timer.create(0, 9);
      expect(timer.toString()).toBe('00:09');
    });

    it('should format timer with double digit values', () => {
      const timer = Timer.create(10, 59);
      expect(timer.toString()).toBe('10:59');
    });
  });
});
