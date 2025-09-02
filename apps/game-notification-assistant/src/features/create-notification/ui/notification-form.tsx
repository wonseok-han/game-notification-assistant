'use client';

import type { NotificationTimeBaseType } from '@entities/notification/model/notificaion';

import { extractMultipleTimesFromImage } from '@entities/notification/lib/time-extractor';
import { NotificationService } from '@entities/notification/model/notification-service';
import { useSnackbar, ActionButton } from '@repo/ui';
import { formatForDatetimeLocal } from '@shared/lib/date';
import { LoadingSpinner } from '@shared/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useState, useRef } from 'react';

export function NotificationForm() {
  const queryClient = useQueryClient();
  const notificationService = new NotificationService(queryClient);

  // ===== 상태 관리 =====
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gameName, setGameName] = useState('');

  // 시간 설정 관련 상태
  const [useImageTimeExtraction, setUseImageTimeExtraction] = useState(true);
  const [notificationTimes, setNotificationTimes] = useState<
    NotificationTimeBaseType[]
  >([
    {
      id: '1',
      scheduledTime: new Date(getDefaultScheduledTime()),
      isEnabled: true,
      rawText: '',
      label: '',
    },
  ]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [isImageLoading, setIsImageLoading] = useState(false);

  // ===== refs =====
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showSnackbar } = useSnackbar();

  // ===== React Query Mutation =====
  const createMutation = useMutation({
    mutationFn: (formData: {
      title: string;
      description: string;
      gameName: string;
      imageUrl: string;
      notificationTimes: {
        scheduledTime: Date;
        isEnabled: boolean;
        rawText: string;
        label: string;
      }[];
    }) => notificationService.create(formData),
    onSuccess: () => {
      showSnackbar({
        message: '게임 알림이 성공적으로 생성되었습니다!',
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
      // 폼 초기화
      clearForm();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // 알림 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: notificationService.queryKey.notifications(),
      });
    },
    onError: (error) => {
      console.error('알림 생성 오류:', error);
      showSnackbar({
        message: '알림 생성에 실패했습니다. 다시 시도해주세요.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    },
  });

  /**
   * 이미지 선택 핸들러
   * @param event - 이벤트 객체
   * @returns {Promise<void>} 이미지 선택 핸들러 결과
   */
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 게임 이미지에서 시간 추출 시도 (이미지 기반 시간 추출이 활성화된 경우)
      if (useImageTimeExtraction) {
        try {
          setIsImageLoading(true);

          const extractedData = await extractMultipleTimesFromImage(file);
          if (extractedData) {
            const {
              displayTexts,
              notificationTimes: extractedNotificationTimes,
            } = extractedData;

            // 추출된 모든 시간을 알림 시간 목록에 추가
            const newTimes = extractedNotificationTimes.map(
              (notificationTime, index) => {
                // input 표시용: UTC 시간을 로컬 시간으로 변환하여 datetime-local 형식으로 표시
                const localTimeString = notificationTime
                  .toLocaleString('sv-SE')
                  .slice(0, 16);
                // 'sv-SE'는 'YYYY-MM-DDTHH:mm' 형식을 보장

                return {
                  id: Date.now().toString() + index,
                  scheduledTime: new Date(localTimeString), // 로컬 시간으로 표시
                  isEnabled: true,
                  rawText: displayTexts?.[index] ?? '', // 추출된 문구를 기본값으로 세팅
                  label: '',
                };
              }
            );

            // 기존 시간 목록을 추출된 시간으로 교체
            setNotificationTimes(newTimes);

            // 사용자에게 알림 (여러 시간이 있는 경우)
            const timeCount = newTimes.length;
            const message =
              timeCount > 1
                ? `게임에서 ${timeCount}개의 시간이 감지되었습니다! 자동으로 알림 시간이 설정되었습니다.`
                : `게임 시간이 감지되었습니다! ${displayTexts[0]} 알림으로 설정되었습니다.`;

            showSnackbar({
              message,
              type: 'success',
              position: 'bottom-right',
              autoHideDuration: 8000,
            });
          }
        } catch (error) {
          console.error('시간 추출 실패:', error);
          // 시간 추출 실패해도 이미지는 정상적으로 처리
        } finally {
          setIsImageLoading(false);
        }
      }
    }
  };

  /**
   * 알림 시간 추가
   */
  const addNotificationTime = () => {
    const newTime = {
      id: Date.now().toString(),
      scheduledTime: new Date(getDefaultScheduledTime()),
      isEnabled: true,
      rawText: '',
      label: '',
    };
    setNotificationTimes([...notificationTimes, newTime]);
  };

  /**
   * 알림 시간 제거
   * @param {string} id - 알림 시간 ID
   */
  const removeNotificationTime = (id?: string) => {
    if (notificationTimes.length > 1) {
      setNotificationTimes(notificationTimes.filter((time) => time.id !== id));
    }
  };

  /**
   * 알림 시간 업데이트
   * @param {string} id - 알림 시간 ID
   * @param {string} field - 업데이트할 필드
   * @param {string | boolean} value - 업데이트할 값
   */
  const updateNotificationTime = (
    id: string | undefined,
    field: 'scheduledTime' | 'isEnabled' | 'rawText' | 'label',
    value: string | boolean | Date
  ) => {
    setNotificationTimes(
      notificationTimes.map((time) =>
        time.id === id ? { ...time, [field]: value } : time
      )
    );
  };

  /**
   * 이미지 기반 시간 추출 토글
   */
  const toggleImageTimeExtraction = () => {
    setUseImageTimeExtraction(!useImageTimeExtraction);
  };

  /**
   * 폼 초기화
   */
  const clearForm = () => {
    setTitle('');
    setDescription('');
    setGameName('');
    setNotificationTimes([
      {
        id: '1',
        scheduledTime: new Date(getDefaultScheduledTime()),
        isEnabled: true,
      },
    ]);
    setSelectedImage(null);
    setImagePreview('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 이미지 제거 핸들러
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 폼 제출 핸들러
   * @param event - 이벤트 객체
   * @returns {Promise<void>} 폼 제출 핸들러 결과
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let errorMessage = '';

    if (!selectedImage) {
      errorMessage = '게임 이미지를 선택해주세요.';
    } else if (
      notificationTimes.filter((time) => time.isEnabled).length === 0
    ) {
      errorMessage = '최소 하나의 알림 시간을 설정해주세요.';
    }

    if (errorMessage) {
      showSnackbar({
        message: errorMessage,
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
      return;
    }

    // 이미지를 base64로 변환
    const imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);

      if (selectedImage) {
        reader.readAsDataURL(selectedImage);
      }
    });

    // 활성화된 알림 시간들 가져오기
    const enabledTimes = notificationTimes.filter((time) => time.isEnabled);

    // React Query Mutation 사용
    createMutation.mutate({
      title: title.trim() || `${gameName} 알림`,
      description: description.trim(),
      gameName: gameName.trim(),
      imageUrl,
      notificationTimes: enabledTimes.map((time) => ({
        scheduledTime: time.scheduledTime,
        isEnabled: time.isEnabled,
        rawText: time.rawText || '',
        label: time.label || '',
      })),
    });
  };

  /**
   * 현재 시간으로부터 1시간 후 기본값 설정
   * @returns {string} 기본 알림 시간
   */
  function getDefaultScheduledTime() {
    const d = new Date();
    d.setMinutes(0, 0, 0); // 분/초/밀리초 0
    d.setHours(d.getHours() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        게임 알림 생성
      </h2>

      <form noValidate className="space-y-6" onSubmit={handleSubmit}>
        {/* ===== 게임 정보 섹션 ===== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            게임 정보
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="gameName"
              >
                게임 이름 *
              </label>
              <input
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="gameName"
                onChange={(e) => setGameName(e.target.value)}
                placeholder="게임 이름을 입력하세요"
                type="text"
                value={gameName}
              />
            </div>
          </div>
        </div>

        {/* ===== 알림 정보 섹션 ===== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            알림 정보
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="title"
              >
                알림 제목
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="알림 제목을 입력하세요 (선택사항)"
                type="text"
                value={title}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="description"
            >
              설명 (선택사항)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="알림에 대한 추가 설명을 입력하세요"
              rows={3}
              value={description}
            />
          </div>
        </div>

        {/* ===== 시간 설정 섹션 ===== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            시간 설정
          </h3>

          {/* 이미지 기반 시간 추출 체크박스 */}
          <label
            className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer"
            htmlFor="useImageTimeExtraction"
          >
            <input
              checked={useImageTimeExtraction}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              id="useImageTimeExtraction"
              onChange={toggleImageTimeExtraction}
              type="checkbox"
            />
            <span className="text-sm font-medium text-blue-800">
              이미지에서 시간 자동 추출
            </span>
            <span className="text-xs text-blue-600">
              (체크 시 이미지 업로드 후 자동으로 시간 설정)
            </span>
          </label>

          {/* 알림 시간 목록 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                알림 시간 *
              </label>
              <button
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                onClick={addNotificationTime}
                type="button"
              >
                ➕ 시간 추가
              </button>
            </div>

            {notificationTimes.map((time) => (
              <div
                key={time.id}
                className="space-y-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <input
                    checked={time.isEnabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) =>
                      updateNotificationTime(
                        time.id,
                        'isEnabled',
                        e.target.checked
                      )
                    }
                    type="checkbox"
                  />
                  <input
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      updateNotificationTime(
                        time.id,
                        'scheduledTime',
                        new Date(e.target.value)
                      )
                    }
                    type="datetime-local"
                    value={formatForDatetimeLocal(time.scheduledTime)}
                  />
                  {notificationTimes.length > 1 && (
                    <button
                      className="px-2 py-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                      onClick={() => removeNotificationTime(time.id)}
                      type="button"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      updateNotificationTime(time.id, 'rawText', e.target.value)
                    }
                    placeholder="원본 텍스트 (예: 12분 2초 남음)"
                    type="text"
                    value={time.rawText ?? ''}
                  />
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      updateNotificationTime(time.id, 'label', e.target.value)
                    }
                    placeholder="설명/컨텍스트 (예: 거점 지배자 파르바)"
                    type="text"
                    value={time.label ?? ''}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 이미지 업로드 섹션 ===== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            게임 이미지
          </h3>

          {/* 시간 추출 결과 표시 */}
          {selectedImage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600">🔍</span>
                <span className="text-sm font-medium text-blue-800">
                  게임 시간 자동 감지
                </span>
              </div>
              <p className="text-sm text-blue-700">
                게임 스크린샷에서 시간 정보를 자동으로 추출하여 알림 시간을
                설정할 수 있습니다.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                시간을 수동으로 조정할 수도 있습니다.
              </p>
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="imageUpload"
            >
              게임 스크린샷 업로드 *
            </label>

            {!imagePreview ? (
              <button
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <input
                  accept="image/*"
                  className="hidden"
                  id="imageUpload"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  type="file"
                />
                <span className="text-blue-600 font-medium">
                  이미지 선택하기
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, JPEG 파일을 지원합니다
                </p>
              </button>
            ) : (
              <div className="relative w-full h-48">
                <Image
                  fill
                  alt="게임 이미지 미리보기"
                  className="w-full h-48 object-contain rounded-lg border border-gray-300 p-2"
                  loading="lazy"
                  src={imagePreview}
                />
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                  onClick={handleRemoveImage}
                  type="button"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== 액션 버튼 ===== */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <ActionButton
            onClick={() => {
              // 모든 입력값 초기화
              clearForm();
            }}
            size="lg"
            title="폼 초기화"
            type="button"
            variant="secondary"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </ActionButton>
          <ActionButton
            disabled={
              !selectedImage ||
              notificationTimes.filter((time) => time.isEnabled).length === 0 ||
              createMutation.isPending ||
              isImageLoading
            }
            size="lg"
            type="submit"
          >
            <div className="flex items-center gap-2">
              {isImageLoading || createMutation.isPending ? (
                <LoadingSpinner color="white" size="sm" />
              ) : null}
              {isImageLoading
                ? '이미지 처리 중...'
                : createMutation.isPending
                  ? '생성 중...'
                  : '알림 생성'}
            </div>
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
