'use client';

import { SignUpForm } from '@features/sign-up-user/ui';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            게임 알림 어시스턴트
          </h1>
          <p className="text-gray-600">
            새로운 계정을 만들어 게임 알림을 관리하세요
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm />

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer hover:underline"
                onClick={() => router.push('/user/sign-in')}
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
