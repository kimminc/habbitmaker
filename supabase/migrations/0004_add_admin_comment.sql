-- 습관 로그에 관리자 코멘트 컬럼 추가
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS admin_comment text;

-- 관리자(is_admin = true)는 모든 습관 로그의 관리자 코멘트를 수정할 수 있도록 정책 추가
DROP POLICY IF EXISTS "habit_logs_admin_update" ON habit_logs;
CREATE POLICY "habit_logs_admin_update" ON habit_logs
  FOR UPDATE USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
