import { createClient } from '@/lib/supabase/server';

/**
 * 모든 사용자 프로필 정보를 불러와 관리자 대시보드에 표시할 데이터를 반환합니다.
 * @returns Promise<{ users: Array<{id: string, email: string, is_admin: boolean, lastActive: Date}>} | null>
 */
export async function getAllUserProfiles() {
  // 🚨 중요: 이 함수는 서버 컴포넌트 또는 API 라우터에서만 호출되어야 합니다.
  const db = createClient();
  const { data: users, error } = await db.from('profiles').select('*');

  if (error) {
    console.error("Error fetching all user profiles:", error);
    throw new Error("사용자 정보를 불러오는 데 실패했습니다.");
  }

  // 필요한 데이터만 가공하여 반환합니다.
  const processedUsers = users.map(user => ({
    id: user.id,
    email: user.email || 'N/A',
    is_admin: !!user.is_admin, // is_admin이 Boolean 타입임을 확실히 함
    createdAt: new Date(user.created_at),
  }));

  return { users: processedUsers };
}

/**
 * 특정 사용자의 성취도 및 활동 정보를 조회합니다.
 * @param userId - 조회할 사용자 ID (UUID)
 * @returns Promise<object>
 */
export async function getUserActivity(userId: string) {
    // TODO: 실제 로직 구현 필요. 'habits' 테이블과 'logs' 테이블을 조인하여 성취도 계산.
    console.log(`[DEBUG] Fetching activity for user ID: ${userId}`);
    return { 
        isCompleted: true, 
        score: Math.floor(Math.random() * 100),
        lastChecked: new Date(),
    };
}