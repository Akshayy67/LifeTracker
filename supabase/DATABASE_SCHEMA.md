# Life Tracker - Database Schema Documentation

## Overview

This document describes the complete database schema for the Life Tracker application, including all tables, relationships, indexes, constraints, and business logic.

---

## Tables

### 1. profiles

User profile information synchronized with Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from auth.users |
| email | TEXT | NOT NULL | User's email address |
| full_name | TEXT | NULL | User's full name |
| avatar_url | TEXT | NULL | URL to user's avatar image |
| timezone | TEXT | DEFAULT 'UTC' | User's timezone |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_profiles_email` on (email)
- `idx_profiles_created_at` on (created_at DESC)

**Triggers:**
- Auto-created by `handle_new_user()` trigger when user signs up
- `update_profiles_updated_at` - Updates updated_at on changes

---

### 2. habits

User's habit tracking configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique habit ID |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) | Owner of the habit |
| name | TEXT | NOT NULL, CHECK (LENGTH(TRIM(name)) > 0) | Habit name |
| description | TEXT | NULL | Optional description |
| color | TEXT | DEFAULT '#3b82f6' | Display color (hex) |
| icon | TEXT | DEFAULT 'circle' | Icon identifier |
| frequency | TEXT | NOT NULL, CHECK (frequency IN ('daily', 'weekly', 'monthly')) | How often to track |
| target_count | INTEGER | NOT NULL, DEFAULT 1, CHECK (target_count > 0) | Target completions per period |
| active | BOOLEAN | NOT NULL, DEFAULT true | Whether habit is active |
| archived_at | TIMESTAMPTZ | NULL | When habit was archived |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_habits_user_id` on (user_id)
- `idx_habits_active` on (user_id, active) WHERE active = true
- `idx_habits_created_at` on (created_at DESC)
- `idx_habits_frequency` on (frequency)

**Triggers:**
- `archive_habit()` - Sets archived_at when active changes to false
- `update_habits_updated_at` - Updates updated_at on changes

---

### 3. habit_completions

Records of habit completions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique completion ID |
| habit_id | UUID | NOT NULL, REFERENCES habits(id) ON DELETE CASCADE | Associated habit |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | User who completed |
| completed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Exact completion time |
| completion_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Completion date |
| notes | TEXT | NULL | Optional notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Unique Constraints:**
- `unique_habit_completion_per_day` on (habit_id, completion_date)

**Indexes:**
- `idx_habit_completions_habit_id` on (habit_id)
- `idx_habit_completions_user_id` on (user_id)
- `idx_habit_completions_date` on (completion_date DESC)
- `idx_habit_completions_completed_at` on (completed_at DESC)
- `idx_habit_completions_habit_date` on (habit_id, completion_date DESC)

**Triggers:**
- `validate_habit_completion()` - Ensures completion belongs to habit owner

---

### 4. journal_entries

User's journal entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique entry ID |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Entry owner |
| title | TEXT | NULL | Optional entry title |
| content | TEXT | NOT NULL, CHECK (LENGTH(TRIM(content)) > 0) | Entry content |
| mood | TEXT | NULL, CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')) | User's mood |
| tags | TEXT[] | DEFAULT '{}' | Array of tags |
| is_favorite | BOOLEAN | NOT NULL, DEFAULT false | Favorite flag |
| entry_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Date of entry |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_journal_entries_user_id` on (user_id)
- `idx_journal_entries_entry_date` on (entry_date DESC)
- `idx_journal_entries_created_at` on (created_at DESC)
- `idx_journal_entries_mood` on (mood)
- `idx_journal_entries_favorite` on (user_id, is_favorite) WHERE is_favorite = true
- `idx_journal_entries_tags` on (tags) USING GIN

**Triggers:**
- `update_journal_entries_updated_at` - Updates updated_at on changes
- `delete_journal_entry_images()` - Cleans up storage when entry deleted

---

### 5. journal_images

Images attached to journal entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique image ID |
| journal_entry_id | UUID | NOT NULL, REFERENCES journal_entries(id) ON DELETE CASCADE | Associated entry |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Image owner |
| storage_path | TEXT | NOT NULL, UNIQUE | Path in storage bucket |
| file_name | TEXT | NOT NULL | Original file name |
| file_size | INTEGER | NOT NULL, CHECK (file_size > 0) | File size in bytes |
| mime_type | TEXT | NOT NULL | MIME type |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Unique Constraints:**
- `unique_storage_path` on (storage_path)

**Indexes:**
- `idx_journal_images_entry_id` on (journal_entry_id)
- `idx_journal_images_user_id` on (user_id)
- `idx_journal_images_created_at` on (created_at DESC)
- `idx_journal_images_display_order` on (journal_entry_id, display_order)

**Triggers:**
- `validate_journal_image()` - Ensures image belongs to entry owner
- `delete_journal_image_storage()` - Cleans up storage when image deleted

---

### 6. expense_categories

User's expense categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique category ID |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Category owner |
| name | TEXT | NOT NULL, CHECK (LENGTH(TRIM(name)) > 0) | Category name |
| color | TEXT | DEFAULT '#3b82f6' | Display color (hex) |
| icon | TEXT | DEFAULT 'dollar-sign' | Icon identifier |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | System-created category |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique Constraints:**
- `unique_category_name_per_user` on (user_id, name)

**Indexes:**
- `idx_expense_categories_user_id` on (user_id)
- `idx_expense_categories_default` on (user_id, is_default) WHERE is_default = true
- `idx_expense_categories_display_order` on (user_id, display_order)

**Default Categories (seeded on user creation):**
1. Food & Dining
2. Transportation
3. Shopping
4. Entertainment
5. Bills & Utilities
6. Healthcare
7. Other

**Triggers:**
- `update_expense_categories_updated_at` - Updates updated_at on changes

---

### 7. budgets

User's budget configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique budget ID |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Budget owner |
| category_id | UUID | NULL, REFERENCES expense_categories(id) ON DELETE CASCADE | Optional category |
| amount | DECIMAL(12, 2) | NOT NULL, CHECK (amount >= 0) | Budget amount |
| period | TEXT | NOT NULL, CHECK (period IN ('monthly', 'yearly')) | Budget period |
| start_date | DATE | NOT NULL | Budget start date |
| end_date | DATE | NULL, CHECK (end_date IS NULL OR end_date >= start_date) | Budget end date |
| active | BOOLEAN | NOT NULL, DEFAULT true | Whether budget is active |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_budgets_user_id` on (user_id)
- `idx_budgets_category_id` on (category_id)
- `idx_budgets_active` on (user_id, active) WHERE active = true
- `idx_budgets_date_range` on (start_date, end_date)

**Triggers:**
- `update_budgets_updated_at` - Updates updated_at on changes

---

### 8. expenses

User's expense records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique expense ID |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Expense owner |
| category_id | UUID | NOT NULL, REFERENCES expense_categories(id) ON DELETE RESTRICT | Expense category |
| amount | DECIMAL(12, 2) | NOT NULL, CHECK (amount > 0) | Expense amount |
| description | TEXT | NULL | Optional description |
| expense_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Date of expense |
| payment_method | TEXT | NULL, CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'other')) | Payment method |
| notes | TEXT | NULL | Additional notes |
| receipt_url | TEXT | NULL | URL to receipt image |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_expenses_user_id` on (user_id)
- `idx_expenses_category_id` on (category_id)
- `idx_expenses_date` on (expense_date DESC)
- `idx_expenses_created_at` on (created_at DESC)
- `idx_expenses_amount` on (amount DESC)
- `idx_expenses_user_date` on (user_id, expense_date DESC)
- `idx_expenses_user_category` on (user_id, category_id)

**Triggers:**
- `validate_expense()` - Ensures category belongs to user
- `update_expenses_updated_at` - Updates updated_at on changes

---

## Functions

### calculate_streak(p_habit_id UUID) → INTEGER

Calculates the current streak for a habit based on its frequency.

**Logic:**
- **Daily**: Counts consecutive days with completions
- **Weekly**: Counts consecutive weeks with completions
- **Monthly**: Counts consecutive months with completions

**Returns:** Number of consecutive periods with completions

---

### monthly_expense_summary(p_user_id UUID, p_year INTEGER, p_month INTEGER) → TABLE

Returns expense summary for a specific month with budget comparison.

**Returns:**
- category_id
- category_name
- category_color
- total_amount
- transaction_count
- average_amount
- budget_amount
- budget_remaining
- budget_percentage

---

### get_habit_completion_rate(p_habit_id UUID, p_start_date DATE, p_end_date DATE) → DECIMAL(5,2)

Calculates completion rate as a percentage for a habit over a date range.

**Returns:** Percentage (0-100) of expected completions achieved

---

### get_total_expenses_by_period(p_user_id UUID, p_start_date DATE, p_end_date DATE) → DECIMAL(12,2)

Calculates total expenses for a user in a date range.

**Returns:** Sum of all expenses in the period

---

## Storage

### Bucket: journal-images

**Configuration:**
- **Public**: No (private bucket)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: image/jpeg, image/jpg, image/png, image/webp, image/gif

**Path Structure:**
```
{user_id}/{journal_entry_id}/{timestamp}_{filename}
```

**Example:**
```
550e8400-e29b-41d4-a716-446655440000/
  ├── 7c9e6679-7425-40de-944b-e07fc1f90ae7/
  │   ├── 1710504000_sunset.jpg
  │   └── 1710504120_beach.png
  └── 8d9f7890-8536-51ef-b827-f18gd2g01bf8/
      └── 1710590400_notes.jpg
```

---

## Row Level Security (RLS)

All tables have RLS enabled with the following policy pattern:

**SELECT**: Users can view only their own records
```sql
USING (auth.uid() = user_id)
```

**INSERT**: Users can create only their own records
```sql
WITH CHECK (auth.uid() = user_id)
```

**UPDATE**: Users can update only their own records
```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**DELETE**: Users can delete only their own records
```sql
USING (auth.uid() = user_id)
```

**Special Cases:**
- `expense_categories`: Cannot delete default categories (is_default = true)
- `profiles`: Linked to auth.users, one-to-one relationship

---

## Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ├─── profiles (1:1)
    │
    ├─── habits (1:N)
    │     └─── habit_completions (1:N)
    │
    ├─── journal_entries (1:N)
    │     └─── journal_images (1:N)
    │
    ├─── expense_categories (1:N)
    │     ├─── budgets (1:N)
    │     └─── expenses (1:N)
    │
    └─── budgets (1:N)
```

---

## Data Validation

### Triggers for Data Integrity

1. **validate_habit_completion**: Ensures completions belong to habit owner
2. **validate_journal_image**: Ensures images belong to entry owner
3. **validate_expense**: Ensures category belongs to user

### Constraints

- All user-facing text fields have non-empty checks
- Amounts must be positive
- Dates must be valid ranges
- Enums enforce valid values
- Unique constraints prevent duplicates

---

## Performance Considerations

### Indexes

- All foreign keys are indexed
- Date columns used for filtering are indexed
- Composite indexes for common query patterns
- GIN index on journal tags for array searches

### Partitioning Recommendations (Future)

For high-volume tables, consider partitioning by:
- `habit_completions`: By completion_date (monthly)
- `journal_entries`: By entry_date (yearly)
- `expenses`: By expense_date (monthly)

---

## Backup and Maintenance

### Recommended Maintenance

1. **Regular Backups**: Daily automated backups via Supabase
2. **Vacuum**: Weekly VACUUM ANALYZE on large tables
3. **Index Maintenance**: Monthly REINDEX on heavily updated tables
4. **Archive Old Data**: Yearly archival of data older than 2 years

### Monitoring Queries

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## Migration History

| Migration | Description | Date |
|-----------|-------------|------|
| 20240315000001 | Initial schema with all tables | 2024-03-15 |
| 20240315000002 | SQL functions | 2024-03-15 |
| 20240315000003 | Triggers | 2024-03-15 |
| 20240315000004 | RLS policies | 2024-03-15 |
| 20240315000005 | Storage configuration | 2024-03-15 |

---

## Security Best Practices

1. ✅ RLS enabled on all tables
2. ✅ Users can only access their own data
3. ✅ Validation triggers prevent cross-user data access
4. ✅ Storage policies enforce user isolation
5. ✅ Sensitive operations use SECURITY DEFINER
6. ✅ Input validation via CHECK constraints
7. ✅ Foreign key constraints maintain referential integrity

---

This schema is production-ready and follows PostgreSQL and Supabase best practices for security, performance, and maintainability.
