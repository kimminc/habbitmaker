import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import React from 'react';

// 이 컴포넌트는 is_admin 권한을 가진 사용자만 접근 가능해야 합니다.
const AdminPage = () => {
  // TODO: 여기에서 서버 측으로 현재 사용자의 역할(role) 정보를 가져와야 함.
  // 만약 role이 'ADMIN'이 아니라면 403 Forbidden 페이지를 반환하도록 로직을 구성합니다.
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">📊 관리자 대시보드</h1>
        <p className="mb-6 text-gray-600">시스템 관리 및 모든 사용자 통계가 여기서 제공됩니다.</p>
        {/* TODO: 사용자 목록, 필터링, 성취도 요약 위젯 등을 배치합니다. */}
      </div>
    </DashboardShell>
  );
};

export default AdminPage;