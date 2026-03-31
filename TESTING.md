# TaskFlow Unit Tests

Comprehensive unit test suite for TaskFlow CRUD operations.

## Test Overview

**Total Tests: 18** ✅ All Passing

### Test Structure

Tests are organized by entity with CRUD operations (Create, Read, Update, Delete):

- **Task Lists**: 6 tests
- **Tasks**: 6 tests  
- **Categories**: 6 tests

## Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage
```

## Test Details

### Task Lists (6 tests)

#### Create List
- ✅ Should create a new task list with all properties
- ✅ Should throw error if creation fails (database error handling)

#### Update List
- ✅ Should update task list name
- ✅ Should preserve other fields when updating partial data (e.g., updating only color preserves name)

#### Delete List
- ✅ Should delete a task list by ID
- ✅ Should throw error if deletion fails (e.g., permission denied)

### Tasks (6 tests)

#### Create Task
- ✅ Should create a new task with all properties
- ✅ Should assign correct position based on existing tasks (auto-incrementing position)

#### Update Task
- ✅ Should update task status (e.g., todo → done)
- ✅ Should update due date and preserve other fields

#### Delete Task
- ✅ Should delete a task by ID
- ✅ Should throw error if task deletion fails

### Categories (6 tests)

#### Create Category
- ✅ Should create a new category with name and color
- ✅ Should throw error if category creation fails

#### Update Category
- ✅ Should update category name
- ✅ Should update category color

#### Delete Category
- ✅ Should delete a category by ID
- ✅ Should throw error if category deletion fails

## Test Coverage

### What's Tested
- ✅ Successful CRUD operations
- ✅ Error handling and exception throwing
- ✅ Data preservation during partial updates
- ✅ Auto-generated fields (position, timestamps)
- ✅ Database query construction
- ✅ Error propagation from Supabase

### What's Mocked
- Supabase client (`@/lib/supabase`)
- Database responses
- Error scenarios
- Query chains (insert, update, delete, select, eq, order, etc.)

## File Structure

```
src/
├── lib/
│   ├── db.ts                 # Database functions (tested)
│   └── __tests__/
│       └── db.test.ts        # All CRUD tests
├── hooks/
│   ├── useTasks.ts           # Task hook (uses tested db functions)
│   ├── useLists.ts           # List hook (uses tested db functions)
│   └── useCategories.ts      # Category hook (uses tested db functions)
```

## Adding New Tests

To add tests for other operations:

1. Create a new describe block for the operation
2. Add individual test cases with `it()` 
3. Mock Supabase responses
4. Call the function under test
5. Assert expected outcomes

Example:

```typescript
it('should do something', async () => {
  // Setup mocks
  vi.mocked(supabase.from).mockReturnValue({...})
  
  // Call function
  const result = await db.someFunction(params)
  
  // Assert
  expect(result).toEqual(expectedValue)
})
```

## Test Tools

- **Vitest**: Fast unit test framework
- **Happy DOM**: Lightweight DOM environment
- **Vitest Built-ins**: `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `vi`

## Notes

- All tests use mocked Supabase to avoid database dependencies
- Tests are isolated and don't affect each other
- Each test clears mocks before and after execution
- Tests validate both success and error paths
