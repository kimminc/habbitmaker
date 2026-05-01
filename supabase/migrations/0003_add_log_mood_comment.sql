-- habit_logs에 오늘의 만족도(mood)와 코멘트(comment) 컬럼 추가
ALTER TABLE habit_logs
  ADD COLUMN IF NOT EXISTS mood    text    DEFAULT NULL
                                   CHECK (mood IN ('만족', '보통', '불만족')),
  ADD COLUMN IF NOT EXISTS comment text    DEFAULT NULL
                                   CHECK (char_length(comment) <= 200);
