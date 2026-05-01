-- habits 테이블에 color 컬럼 추가
ALTER TABLE habits ADD COLUMN IF NOT EXISTS color text DEFAULT '#10b981'; -- 기본값은 초록색 (green-500)
