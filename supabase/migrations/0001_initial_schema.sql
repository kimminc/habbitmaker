-- Design Ref: §3.3 — DB 스키마 + RLS 정책 (Plan SC: RLS로 타 사용자 데이터 미노출)
-- HabbitMaker Phase 1 초기 스키마

-- ===== profiles =====
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

-- 신규 회원가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== habits =====
CREATE TABLE IF NOT EXISTS habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  frequency       text NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  frequency_days  int[] NOT NULL DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  deleted_at      timestamptz DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_habits_user_active
  ON habits(user_id)
  WHERE deleted_at IS NULL;

-- ===== habit_logs =====
CREATE TABLE IF NOT EXISTS habit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date    date NOT NULL,
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT unique_habit_log_per_day UNIQUE(habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date
  ON habit_logs(user_id, log_date);

-- ===== RLS 활성화 =====
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 읽기/수정
DROP POLICY IF EXISTS "profiles_own" ON profiles;
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- habits: 본인 것만 CRUD
DROP POLICY IF EXISTS "habits_own" ON habits;
CREATE POLICY "habits_own" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- habit_logs: 본인 것만 CRUD
DROP POLICY IF EXISTS "habit_logs_own" ON habit_logs;
CREATE POLICY "habit_logs_own" ON habit_logs
  FOR ALL USING (auth.uid() = user_id);
