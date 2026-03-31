import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { supabase } from '@/lib/supabase'
import * as db from '@/lib/db'

// Mock Supabase responses
const mockListId = 'list-1'
const mockListData = {
  id: mockListId,
  name: 'Test List',
  description: 'Test Description',
  color: '#6366f1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockTaskId = 'task-1'
const mockTaskData = {
  id: mockTaskId,
  list_id: mockListId,
  title: 'Test Task',
  description: 'Test Description',
  priority: 'medium',
  status: 'todo',
  due_date: null,
  category_id: null,
  position: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockCategoryId = 'cat-1'
const mockCategoryData = {
  id: mockCategoryId,
  list_id: mockListId,
  name: 'Test Category',
  color: '#8b5cf6',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Database CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── Task List Tests ──────────────────────────────────────────────────────

  describe('Task Lists', () => {
    describe('createList', () => {
      it('should create a new task list', async () => {
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: mockListData, error: null })

        vi.mocked(supabase.from).mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: mockSelect,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.createList({
          name: 'Test List',
          description: 'Test Description',
          color: '#6366f1',
        })

        expect(result).toEqual(mockListData)
        expect(result.id).toBe(mockListId)
        expect(result.name).toBe('Test List')
      })

      it('should throw error if creation fails', async () => {
        const mockError = new Error('Database error')
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })

        vi.mocked(supabase.from).mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: mockSelect,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        await expect(
          db.createList({
            name: 'Test List',
            description: 'Test Description',
            color: '#6366f1',
          })
        ).rejects.toThrow('Database error')
      })
    })

    describe('updateList', () => {
      it('should update a task list', async () => {
        const updatedData = { ...mockListData, name: 'Updated List' }
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedData, error: null })
        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect,
        })

        vi.mocked(supabase.from).mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.updateList(mockListId, { name: 'Updated List' })

        expect(result.name).toBe('Updated List')
        expect(result.id).toBe(mockListId)
      })

      it('should preserve other fields when updating partial data', async () => {
        const updatedData = { ...mockListData, color: '#ff0000' }
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedData, error: null })
        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect,
        })

        vi.mocked(supabase.from).mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.updateList(mockListId, { color: '#ff0000' })

        expect(result.color).toBe('#ff0000')
        expect(result.name).toBe('Test List') // unchanged
      })
    })

    describe('deleteList', () => {
      it('should delete a task list', async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null })

        vi.mocked(supabase.from).mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        await db.deleteList(mockListId)

        expect(mockEq).toHaveBeenCalledWith('id', mockListId)
      })

      it('should throw error if deletion fails', async () => {
        const mockError = new Error('Cannot delete')
        const mockEq = vi.fn().mockResolvedValue({ error: mockError })

        vi.mocked(supabase.from).mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        await expect(db.deleteList(mockListId)).rejects.toThrow('Cannot delete')
      })
    })
  })

  // ─── Task Tests ───────────────────────────────────────────────────────────

  describe('Tasks', () => {
    describe('createTask', () => {
      it('should create a new task', async () => {
        const mockSelect = vi.fn().mockReturnThis()
        const mockEq = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { position: 5 }, error: null }),
            }),
          }),
        })

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockTaskData, error: null }),
        })

        vi.mocked(supabase.from).mockImplementation((table) => {
          if (table === 'tasks') {
            return {
              select: mockSelect,
              insert: mockInsert,
              eq: mockEq,
            } as any
          }
          return {} as any
        })

        const result = await db.createTask({
          list_id: mockListId,
          title: 'Test Task',
          description: 'Test Description',
          priority: 'medium',
          status: 'todo',
        })

        expect(result).toEqual(mockTaskData)
        expect(result.title).toBe('Test Task')
      })

      it('should assign correct position to new task', async () => {
        const mockSelect = vi.fn().mockReturnThis()
        const mockEq = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { position: 5 }, error: null }),
            }),
          }),
        })

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { ...mockTaskData, position: 6 }, 
            error: null 
          }),
        })

        vi.mocked(supabase.from).mockImplementation((table) => {
          if (table === 'tasks') {
            return {
              select: mockSelect,
              insert: mockInsert,
              eq: mockEq,
            } as any
          }
          return {} as any
        })

        const result = await db.createTask({
          list_id: mockListId,
          title: 'Task with Position',
          priority: 'low',
          status: 'todo',
        })

        expect(result.position).toBe(6)
      })
    })

    describe('updateTask', () => {
      it('should update task properties', async () => {
        const updatedData = { ...mockTaskData, status: 'done' as const }
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedData, error: null })
        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect,
        })

        vi.mocked(supabase.from).mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.updateTask({
          id: mockTaskId,
          status: 'done',
        })

        expect(result.status).toBe('done')
      })

      it('should update due date', async () => {
        const dueDate = new Date().toISOString()
        const updatedData = { ...mockTaskData, due_date: dueDate }
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedData, error: null })
        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect,
        })

        vi.mocked(supabase.from).mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.updateTask({
          id: mockTaskId,
          due_date: dueDate,
        })

        expect(result.due_date).toBe(dueDate)
      })
    })

    describe('deleteTask', () => {
      it('should delete a task', async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null })

        vi.mocked(supabase.from).mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        await db.deleteTask(mockTaskId)

        expect(mockEq).toHaveBeenCalledWith('id', mockTaskId)
      })

      it('should throw error if task deletion fails', async () => {
        const mockError = new Error('Cannot delete task')
        const mockEq = vi.fn().mockResolvedValue({ error: mockError })

        vi.mocked(supabase.from).mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        await expect(db.deleteTask(mockTaskId)).rejects.toThrow('Cannot delete task')
      })
    })
  })

  // ─── Category Tests ───────────────────────────────────────────────────────

  describe('Categories', () => {
    describe('createCategory', () => {
      it('should create a new category', async () => {
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: mockCategoryData, error: null })

        vi.mocked(supabase.from).mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: mockSelect,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.createCategory({
          list_id: mockListId,
          name: 'Test Category',
          color: '#8b5cf6',
        })

        expect(result).toEqual(mockCategoryData)
        expect(result.name).toBe('Test Category')
        expect(result.color).toBe('#8b5cf6')
      })

      it('should throw error if category creation fails', async () => {
        const mockError = new Error('Category creation failed')
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })

        vi.mocked(supabase.from).mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: mockSelect,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        await expect(
          db.createCategory({
            list_id: mockListId,
            name: 'Test Category',
            color: '#8b5cf6',
          })
        ).rejects.toThrow('Category creation failed')
      })
    })

    describe('updateCategory', () => {
      it('should update category name', async () => {
        const updatedData = { ...mockCategoryData, name: 'Updated Category' }
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedData, error: null })
        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect,
        })

        vi.mocked(supabase.from).mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.updateCategory(mockCategoryId, { name: 'Updated Category' })

        expect(result.name).toBe('Updated Category')
      })

      it('should update category color', async () => {
        const updatedData = { ...mockCategoryData, color: '#ff0000' }
        const mockSelect = vi.fn().mockReturnThis()
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedData, error: null })
        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect,
        })

        vi.mocked(supabase.from).mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        mockSelect.mockReturnValue({
          single: mockSingle,
        })

        const result = await db.updateCategory(mockCategoryId, { color: '#ff0000' })

        expect(result.color).toBe('#ff0000')
      })
    })

    describe('deleteCategory', () => {
      it('should delete a category', async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null })

        vi.mocked(supabase.from).mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        await db.deleteCategory(mockCategoryId)

        expect(mockEq).toHaveBeenCalledWith('id', mockCategoryId)
      })

      it('should throw error if category deletion fails', async () => {
        const mockError = new Error('Cannot delete category')
        const mockEq = vi.fn().mockResolvedValue({ error: mockError })

        vi.mocked(supabase.from).mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        } as any)

        await expect(db.deleteCategory(mockCategoryId)).rejects.toThrow('Cannot delete category')
      })
    })
  })
})
