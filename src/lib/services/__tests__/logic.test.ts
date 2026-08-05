import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mock de lógica que seria testada
const validateNickname = (nick: string) => {
  return /^[a-zA-Z0-9_]{3,16}$/.test(nick);
};

const calculateTotal = (price: number, discount: number = 0) => {
  if (price < 0 || discount < 0) throw new Error("Valores negativos");
  const total = price - discount;
  return total < 0 ? 0 : Number(total.toFixed(2));
};

describe('Habblet Mine - Unit Tests', () => {
  describe('Nickname Validation', () => {
    it('should validate correct nicknames', () => {
      expect(validateNickname('Steve')).toBe(true);
      expect(validateNickname('Player_01')).toBe(true);
      expect(validateNickname('12345')).toBe(true);
    });

    it('should reject invalid nicknames', () => {
      expect(validateNickname('St')).toBe(false); // Too short
      expect(validateNickname('VeryLongNicknameIndeed')).toBe(false); // Too long
      expect(validateNickname('Nick!Name')).toBe(false); // Special char
      expect(validateNickname('Nick Name')).toBe(false); // Space
    });
  });

  describe('Price & Discount Calculation', () => {
    it('should calculate simple total', () => {
      expect(calculateTotal(100)).toBe(100);
      expect(calculateTotal(50.55)).toBe(50.55);
    });

    it('should apply discount correctly', () => {
      expect(calculateTotal(100, 15)).toBe(85);
      expect(calculateTotal(49.90, 10)).toBe(39.90);
    });

    it('should not allow negative total', () => {
      expect(calculateTotal(10, 20)).toBe(0);
    });

    it('should throw on negative inputs', () => {
      expect(() => calculateTotal(-10)).toThrow();
      expect(() => calculateTotal(10, -5)).toThrow();
    });
  });
});
