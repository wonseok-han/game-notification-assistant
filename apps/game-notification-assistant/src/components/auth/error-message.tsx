'use client';

import { useAuthStore } from '@store/auth-store';

// ===== 에러 메시지 컴포넌트 =====
export function ErrorMessage() {
  const { error } = useAuthStore();

  if (!error) {
    return null;
  }

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}
