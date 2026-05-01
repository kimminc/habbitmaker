-- 관리자 여부 컬럼 추가 (Y/N)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin text DEFAULT 'N';

-- 관리자(is_admin = 'Y')는 모든 프로필을 볼 수 있도록 정책 추가
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = 'Y'
  );

-- 관리자(is_admin = 'Y')는 모든 습관을 볼 수 있도록 정책 추가
DROP POLICY IF EXISTS "habits_admin_select" ON habits;
CREATE POLICY "habits_admin_select" ON habits
  FOR SELECT USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = 'Y'
  );

-- 관리자(is_admin = 'Y')는 모든 습관 기록을 볼 수 있도록 정책 추가
DROP POLICY IF EXISTS "habit_logs_admin_select" ON habit_logs;
CREATE POLICY "habit_logs_admin_select" ON habit_logs
  FOR SELECT USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = 'Y'
  );
