import { describe, expect, it, vi } from 'vitest'

import {
  buildTask,
  normalizeCategory,
  normalizeDeadline,
  normalizeRemark,
} from './taskModel'

describe('taskModel', () => {
  describe('normalizeCategory', () => {
    it('defaults to DEFAULT_CATEGORY for empty input', () => {
      expect(normalizeCategory()).toBe('默认')
      expect(normalizeCategory('')).toBe('默认')
      expect(normalizeCategory('   ')).toBe('默认')
    })

    it('trims and keeps non-empty input', () => {
      expect(normalizeCategory('  工作  ')).toBe('工作')
    })
  })

  describe('normalizeDeadline', () => {
    it('returns null for empty input', () => {
      expect(normalizeDeadline()).toBeNull()
      expect(normalizeDeadline('')).toBeNull()
      expect(normalizeDeadline('   ')).toBeNull()
    })

    it('keeps the datetime-local raw string', () => {
      expect(normalizeDeadline('2026-04-01T18:30')).toBe('2026-04-01T18:30')
    })
  })

  describe('buildTask', () => {
    it('builds a serializable task with defaults', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890)
      vi.stubGlobal('crypto', { randomUUID: () => 'uuid-123' })

      const task = buildTask({ name: '  hello  ' })

      expect(task).toEqual({
        id: 'uuid-123',
        name: 'hello',
        deadline: null,
        category: '默认',
        priority: 'medium',
        completed: false,
        createdAt: 1234567890,
        remark: '',
      })
    })
  })

  describe('normalizeRemark', () => {
    it('defaults to empty string for empty input', () => {
      expect(normalizeRemark()).toBe('')
      expect(normalizeRemark('')).toBe('')
      expect(normalizeRemark('   ')).toBe('')
    })

    it('trims outer whitespace but keeps inner newlines', () => {
      expect(normalizeRemark('  第一行\n第二行  ')).toBe('第一行\n第二行')
    })
  })
})
