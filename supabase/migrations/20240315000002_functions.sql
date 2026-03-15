-- =====================================================
-- Life Tracker - SQL Functions
-- Migration: 20240315000002
-- Description: Custom functions for business logic
-- =====================================================

-- =====================================================
-- FUNCTION: calculate_streak
-- Description: Calculate current streak for a habit
-- Returns: Number of consecutive days the habit was completed
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_current_date DATE := CURRENT_DATE;
    v_frequency TEXT;
    v_has_completion BOOLEAN;
BEGIN
    -- Get habit frequency
    SELECT frequency INTO v_frequency
    FROM habits
    WHERE id = p_habit_id;
    
    -- If habit doesn't exist, return 0
    IF v_frequency IS NULL THEN
        RETURN 0;
    END IF;
    
    -- For daily habits
    IF v_frequency = 'daily' THEN
        -- Check backwards from today
        LOOP
            -- Check if habit was completed on current_date
            SELECT EXISTS (
                SELECT 1 
                FROM habit_completions 
                WHERE habit_id = p_habit_id 
                AND completion_date = v_current_date
            ) INTO v_has_completion;
            
            -- If not completed, break the streak
            IF NOT v_has_completion THEN
                -- If we're checking today and it's not completed yet, don't break
                IF v_current_date = CURRENT_DATE THEN
                    EXIT;
                END IF;
                EXIT;
            END IF;
            
            -- Increment streak
            v_streak := v_streak + 1;
            
            -- Move to previous day
            v_current_date := v_current_date - INTERVAL '1 day';
            
            -- Safety limit to prevent infinite loop
            IF v_streak > 1000 THEN
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    -- For weekly habits
    IF v_frequency = 'weekly' THEN
        -- Get start of current week (Monday)
        v_current_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
        
        LOOP
            -- Check if habit was completed this week
            SELECT EXISTS (
                SELECT 1 
                FROM habit_completions 
                WHERE habit_id = p_habit_id 
                AND completion_date >= v_current_date
                AND completion_date < v_current_date + INTERVAL '7 days'
            ) INTO v_has_completion;
            
            -- If not completed, break the streak
            IF NOT v_has_completion THEN
                -- If we're checking current week, don't break yet
                IF v_current_date = DATE_TRUNC('week', CURRENT_DATE)::DATE THEN
                    EXIT;
                END IF;
                EXIT;
            END IF;
            
            -- Increment streak
            v_streak := v_streak + 1;
            
            -- Move to previous week
            v_current_date := v_current_date - INTERVAL '7 days';
            
            -- Safety limit
            IF v_streak > 200 THEN
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    -- For monthly habits
    IF v_frequency = 'monthly' THEN
        -- Get start of current month
        v_current_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
        
        LOOP
            -- Check if habit was completed this month
            SELECT EXISTS (
                SELECT 1 
                FROM habit_completions 
                WHERE habit_id = p_habit_id 
                AND completion_date >= v_current_date
                AND completion_date < (v_current_date + INTERVAL '1 month')::DATE
            ) INTO v_has_completion;
            
            -- If not completed, break the streak
            IF NOT v_has_completion THEN
                -- If we're checking current month, don't break yet
                IF v_current_date = DATE_TRUNC('month', CURRENT_DATE)::DATE THEN
                    EXIT;
                END IF;
                EXIT;
            END IF;
            
            -- Increment streak
            v_streak := v_streak + 1;
            
            -- Move to previous month
            v_current_date := (v_current_date - INTERVAL '1 month')::DATE;
            
            -- Safety limit
            IF v_streak > 100 THEN
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNCTION: monthly_expense_summary
-- Description: Get expense summary for a user for a specific month
-- Returns: Table with category breakdown and totals
-- =====================================================
CREATE OR REPLACE FUNCTION monthly_expense_summary(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_color TEXT,
    total_amount DECIMAL(12, 2),
    transaction_count BIGINT,
    average_amount DECIMAL(12, 2),
    budget_amount DECIMAL(12, 2),
    budget_remaining DECIMAL(12, 2),
    budget_percentage DECIMAL(5, 2)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Calculate date range for the month
    v_start_date := make_date(p_year, p_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 month')::DATE;
    
    RETURN QUERY
    WITH expense_totals AS (
        SELECT 
            e.category_id,
            SUM(e.amount) AS total,
            COUNT(*) AS count,
            AVG(e.amount) AS average
        FROM expenses e
        WHERE e.user_id = p_user_id
        AND e.expense_date >= v_start_date
        AND e.expense_date < v_end_date
        GROUP BY e.category_id
    ),
    active_budgets AS (
        SELECT 
            b.category_id,
            b.amount AS budget_amount
        FROM budgets b
        WHERE b.user_id = p_user_id
        AND b.active = true
        AND b.period = 'monthly'
        AND b.start_date <= v_start_date
        AND (b.end_date IS NULL OR b.end_date >= v_start_date)
    )
    SELECT 
        ec.id AS category_id,
        ec.name AS category_name,
        ec.color AS category_color,
        COALESCE(et.total, 0)::DECIMAL(12, 2) AS total_amount,
        COALESCE(et.count, 0)::BIGINT AS transaction_count,
        COALESCE(et.average, 0)::DECIMAL(12, 2) AS average_amount,
        COALESCE(ab.budget_amount, 0)::DECIMAL(12, 2) AS budget_amount,
        COALESCE(ab.budget_amount - et.total, ab.budget_amount)::DECIMAL(12, 2) AS budget_remaining,
        CASE 
            WHEN ab.budget_amount > 0 THEN 
                ((et.total / ab.budget_amount) * 100)::DECIMAL(5, 2)
            ELSE 
                0::DECIMAL(5, 2)
        END AS budget_percentage
    FROM expense_categories ec
    LEFT JOIN expense_totals et ON ec.id = et.category_id
    LEFT JOIN active_budgets ab ON ec.id = ab.category_id
    WHERE ec.user_id = p_user_id
    ORDER BY total_amount DESC NULLS LAST, ec.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNCTION: get_habit_completion_rate
-- Description: Calculate completion rate for a habit over a period
-- Returns: Percentage of expected completions that were achieved
-- =====================================================
CREATE OR REPLACE FUNCTION get_habit_completion_rate(
    p_habit_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
    v_frequency TEXT;
    v_expected_completions INTEGER := 0;
    v_actual_completions INTEGER := 0;
    v_completion_rate DECIMAL(5, 2);
BEGIN
    -- Get habit frequency
    SELECT frequency INTO v_frequency
    FROM habits
    WHERE id = p_habit_id;
    
    -- Calculate expected completions based on frequency
    IF v_frequency = 'daily' THEN
        v_expected_completions := (p_end_date - p_start_date + 1);
    ELSIF v_frequency = 'weekly' THEN
        v_expected_completions := CEIL((p_end_date - p_start_date + 1) / 7.0);
    ELSIF v_frequency = 'monthly' THEN
        v_expected_completions := EXTRACT(YEAR FROM AGE(p_end_date, p_start_date)) * 12 
            + EXTRACT(MONTH FROM AGE(p_end_date, p_start_date)) + 1;
    END IF;
    
    -- Get actual completions
    SELECT COUNT(*) INTO v_actual_completions
    FROM habit_completions
    WHERE habit_id = p_habit_id
    AND completion_date >= p_start_date
    AND completion_date <= p_end_date;
    
    -- Calculate rate
    IF v_expected_completions > 0 THEN
        v_completion_rate := (v_actual_completions::DECIMAL / v_expected_completions * 100)::DECIMAL(5, 2);
    ELSE
        v_completion_rate := 0;
    END IF;
    
    RETURN LEAST(v_completion_rate, 100.00);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNCTION: get_total_expenses_by_period
-- Description: Get total expenses for a user in a period
-- =====================================================
CREATE OR REPLACE FUNCTION get_total_expenses_by_period(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    v_total DECIMAL(12, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total
    FROM expenses
    WHERE user_id = p_user_id
    AND expense_date >= p_start_date
    AND expense_date <= p_end_date;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql STABLE;
