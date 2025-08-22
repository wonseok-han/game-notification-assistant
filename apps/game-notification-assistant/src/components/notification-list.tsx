'use client';

import { ActionButton, useSnackbar } from '@repo/ui';
import {
  deleteNotification,
  getNotifications,
  updateNotification,
  type GameNotification,
} from '@services/notification';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';

type ActiveOptionType = {
  value: boolean;
  label: string;
  color: string;
  bgColor: string;
};

// ===== 활성 상태 옵션 =====
const ACTIVE_OPTIONS: ActiveOptionType[] = [
  {
    value: true,
    label: '활성',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  {
    value: false,
    label: '비활성',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
];

// ===== 알림 목록 컴포넌트 =====
export function NotificationList() {
  // ===== 상태 관리 =====
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [isEditActive, setIsEditActive] = useState<boolean>(true);

  // 카드 펼침/접기, 밀도 제어
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 여러 시간 편집을 위한 상태
  const [editingTimes, setEditingTimes] = useState<
    Array<{
      id: string;
      scheduledTime: string;
      isEnabled: boolean;
      rawText?: string;
      label?: string;
    }>
  >([]);

  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const { showSnackbar } = useSnackbar();

  // ===== 알림 목록 가져오기 =====
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);

        const result = await getNotifications();

        setNotifications(result || []);
      } catch (error) {
        console.error('알림 목록 조회 오류:', error);

        showSnackbar({
          message: '알림 목록을 가져오는 중 오류가 발생했습니다.',
          type: 'error',
          position: 'bottom-right',
          autoHideDuration: 6000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // ===== 알림 삭제 핸들러 =====
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteNotification(id);

      if (response?.message) {
        showSnackbar({
          message: response.message,
          type: 'success',
          position: 'bottom-right',
          autoHideDuration: 6000,
        });
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('알림 삭제 오류:', error);
      showSnackbar({
        message: '알림 삭제에 실패했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    }
  };

  // ===== 편집 로직 =====
  const toInputDateTime = (iso: string): string => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const startEdit = (n: GameNotification) => {
    setEditingId(n.id);
    setEditTitle(n.title);
    setIsEditActive(n.is_active);

    // notification_times가 있는 경우 편집 상태로 설정
    if (n.notification_times && n.notification_times.length > 0) {
      const times = n.notification_times.map((time) => ({
        id: time.id,
        scheduledTime: toInputDateTime(time.scheduled_time),
        isEnabled: time.is_enabled || true,
        rawText: time.raw_text ?? '',
        label: time.label ?? '',
      }));
      setEditingTimes(times);
    } else {
      // 기존 단일 시간을 배열로 변환
      setEditingTimes([
        {
          id: '1',
          scheduledTime: toInputDateTime(
            n.notification_times?.[0]?.scheduled_time ||
              new Date().toISOString()
          ),
          isEnabled: true,
        },
      ]);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setIsEditActive(true);
    setEditingTimes([]);
  };

  const saveEdit = async (id: string) => {
    try {
      setIsSaveLoading(true);

      // notification-form.tsx와 동일한 방식으로 시간을 UTC로 변환
      const utcNotificationTimes = editingTimes.map((time) => ({
        id: time.id,
        scheduledTime: new Date(time.scheduledTime).toISOString(),
        isEnabled: time.isEnabled,
        rawText: time.rawText,
        label: time.label,
      }));

      await updateNotification(id, {
        title: editTitle.trim(),
        is_active: isEditActive,
        notificationTimes: utcNotificationTimes,
      });

      showSnackbar({
        message: '알림이 수정되었습니다.',
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });

      // 수정 완료 후 최신 데이터로 목록 새로고침
      const freshNotifications = await getNotifications();
      setNotifications(freshNotifications || []);
      setEditingId(null);
      setEditTitle('');
      setIsEditActive(true);
    } catch (error) {
      console.error('알림 수정 오류:', error);
      showSnackbar({
        message: '알림 수정에 실패했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    } finally {
      setIsSaveLoading(false);
    }
  };
  // ===== 상태 관리 =====
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ===== 필터링된 알림 목록 =====
  const filteredNotifications = notifications.filter((notification) => {
    const isStatusMatch =
      selectedStatus === 'all' ||
      notification.is_active.toString() === selectedStatus;
    const isSearchMatch =
      searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.game_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      notification.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return isStatusMatch && isSearchMatch;
  });

  // ===== 시간 포맷팅 =====
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  // ===== 예정 시간 포맷팅 =====
  const formatScheduledTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return '시간 만료';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}분 후`;
    if (hours < 24) return `${hours}시간 후`;
    if (days < 7) return `${days}일 후`;

    return date.toLocaleDateString('ko-KR');
  };

  // 다음 예정 시간 계산 (활성만, 과거 제외, 없으면 가장 이른 시간/단일 시간)
  const getNextTime = (n: GameNotification): Date => {
    const now = new Date();
    const list = (n.notification_times || [])
      .filter((t) => t.is_enabled)
      .map((t) => new Date(t.scheduled_time))
      .sort((a, b) => a.getTime() - b.getTime());
    const upcoming = list.find((d) => d.getTime() >= now.getTime());
    return upcoming || list[0] || new Date();
  };

  // ===== 활성 상태 배지 컴포넌트 =====
  const ActiveBadge = ({ isActive }: { isActive: boolean }) => {
    const option = ACTIVE_OPTIONS.find((opt) => opt.value === isActive);
    if (!option) return null;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${option.bgColor} ${option.color}`}
      >
        {option.label}
      </span>
    );
  };

  // ===== 알림 시간 상태 배지 컴포넌트 =====
  const NotificationTimeStatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'pending':
          return {
            label: '대기중',
            color: 'text-blue-700',
            bgColor: 'bg-blue-100',
          };
        case 'sent':
          return {
            label: '전송됨',
            color: 'text-green-700',
            bgColor: 'bg-green-100',
          };
        case 'failed':
          return {
            label: '실패',
            color: 'text-red-700',
            bgColor: 'bg-red-100',
          };
        default:
          return {
            label: status,
            color: 'text-gray-700',
            bgColor: 'bg-gray-100',
          };
      }
    };

    const config = getStatusConfig(status);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          알림이 없습니다
        </h3>
        <p className="text-gray-500">새로운 게임 알림을 생성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== 필터 섹션 ===== */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="알림 검색..."
              type="text"
              value={searchQuery}
            />
          </div>

          {/* 활성 상태 필터 */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) =>
                setSelectedStatus(e.target.value as 'all' | 'true' | 'false')
              }
              value={selectedStatus}
            >
              <option value="all">모든 상태</option>
              {ACTIVE_OPTIONS.map((option) => (
                <option
                  key={option.value.toString()}
                  value={option.value.toString()}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== 알림 목록 (테이블) ===== */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-separate border-spacing-y-2">
            <thead className="text-gray-700 text-sm bg-gray-50 sticky top-0 z-10 border-y border-gray-200">
              <tr>
                <th className="text-left px-3 py-2" scope="col">
                  이미지
                </th>
                <th className="text-left px-3 py-2" scope="col">
                  제목
                </th>
                <th
                  className="text-left px-3 py-2 hidden md:table-cell"
                  scope="col"
                >
                  게임
                </th>
                <th
                  className="text-left px-3 py-2 hidden md:table-cell"
                  scope="col"
                >
                  상태
                </th>
                <th className="text-left px-3 py-2" scope="col">
                  다음 알림
                </th>
                <th
                  className="text-left px-3 py-2 hidden md:table-cell"
                  scope="col"
                >
                  개수
                </th>
                <th
                  className="text-left px-3 py-2 hidden md:table-cell"
                  scope="col"
                >
                  생성
                </th>
                <th className="text-left px-3 py-2" scope="col">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="text-base">
              {filteredNotifications.map((n) => (
                <Fragment key={n.id}>
                  <tr
                    key={n.id}
                    aria-expanded={expandedId === n.id}
                    className="bg-white hover:bg-gray-50 cursor-pointer border border-gray-100 rounded-md"
                    onClick={() =>
                      setExpandedId(expandedId === n.id ? null : n.id)
                    }
                  >
                    <td className="px-3 py-2 align-middle">
                      <div className="relative w-16 h-10 overflow-hidden rounded border border-gray-200">
                        <Image
                          fill
                          alt={`${n.game_name} 이미지`}
                          className="object-cover"
                          src={n.image_url}
                        />
                      </div>
                    </td>
                    <td
                      className="px-3 py-2 align-middle max-w-[20rem] truncate"
                      title={n.title}
                    >
                      {n.title}
                    </td>
                    <td className="px-3 py-2 align-middle text-gray-700 hidden md:table-cell">
                      {n.game_name}
                    </td>
                    <td className="px-3 py-2 align-middle hidden md:table-cell">
                      <ActiveBadge isActive={n.is_active} />
                    </td>
                    <td className="px-3 py-2 align-middle text-gray-800">
                      {formatScheduledTime(getNextTime(n))}
                    </td>
                    <td className="px-3 py-2 align-middle text-gray-700 hidden md:table-cell">
                      {n.notification_times ? n.notification_times.length : 1}
                    </td>
                    <td className="px-3 py-2 align-middle text-gray-600 hidden md:table-cell">
                      {formatTime(new Date(n.created_at))}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <ActionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(n.id);
                            startEdit(n);
                          }}
                          size="sm"
                          type="button"
                        >
                          수정
                        </ActionButton>
                        <ActionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n.id);
                          }}
                          size="sm"
                          type="button"
                          variant="danger"
                        >
                          삭제
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                  {expandedId === n.id && (
                    <tr>
                      <td
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                        colSpan={8}
                      >
                        {/* 상세 시간 테이블 또는 편집 UI */}
                        {editingId === n.id ? (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">
                              알림 시간들
                            </label>
                            {/* 기존 편집 블록 재사용 */}
                            {editingTimes.length > 0 && (
                              <div className="space-y-2">
                                {editingTimes.map((time, index) => (
                                  <div key={time.id} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <input
                                        checked={time.isEnabled}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        onChange={(e) => {
                                          const newTimes = [...editingTimes];
                                          if (newTimes[index]) {
                                            newTimes[index].isEnabled =
                                              e.target.checked;
                                            setEditingTimes(newTimes);
                                          }
                                        }}
                                        type="checkbox"
                                      />
                                      <input
                                        className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onChange={(e) => {
                                          const newTimes = [...editingTimes];
                                          if (newTimes[index]) {
                                            newTimes[index].scheduledTime =
                                              e.target.value;
                                            setEditingTimes(newTimes);
                                          }
                                        }}
                                        type="datetime-local"
                                        value={time.scheduledTime}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <input
                                        className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onChange={(e) => {
                                          const newTimes = [...editingTimes];
                                          if (newTimes[index]) {
                                            newTimes[index].rawText =
                                              e.target.value;
                                            setEditingTimes(newTimes);
                                          }
                                        }}
                                        placeholder="원본 텍스트"
                                        type="text"
                                        value={time.rawText ?? ''}
                                      />
                                      <input
                                        className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onChange={(e) => {
                                          const newTimes = [...editingTimes];
                                          if (newTimes[index]) {
                                            newTimes[index].label =
                                              e.target.value;
                                            setEditingTimes(newTimes);
                                          }
                                        }}
                                        placeholder="설명/컨텍스트"
                                        type="text"
                                        value={time.label ?? ''}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex gap-2">
                              <ActionButton
                                disabled={isSaveLoading}
                                onClick={() => saveEdit(n.id)}
                                size="sm"
                                type="button"
                              >
                                {isSaveLoading ? '저장 중...' : '저장'}
                              </ActionButton>
                              <ActionButton
                                onClick={cancelEdit}
                                size="sm"
                                type="button"
                                variant="secondary"
                              >
                                취소
                              </ActionButton>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full table-auto border-separate border-spacing-y-2">
                              <thead className="text-gray-700 text-sm bg-gray-100">
                                <tr>
                                  <th
                                    className="text-left px-3 py-2"
                                    scope="col"
                                  >
                                    사용여부
                                  </th>
                                  <th
                                    className="text-left px-3 py-2"
                                    scope="col"
                                  >
                                    상태
                                  </th>
                                  <th
                                    className="text-left px-3 py-2"
                                    scope="col"
                                  >
                                    남은 시간
                                  </th>
                                  <th
                                    className="text-left px-3 py-2"
                                    scope="col"
                                  >
                                    일자
                                  </th>
                                  <th
                                    className="text-left px-3 py-2"
                                    scope="col"
                                  >
                                    원본 텍스트
                                  </th>
                                  <th
                                    className="text-left px-3 py-2"
                                    scope="col"
                                  >
                                    설명
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="text-base">
                                {n.notification_times?.map((time, idx) => (
                                  <tr
                                    key={time.id}
                                    className={
                                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }
                                  >
                                    <td className="px-3 py-2 align-middle">
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full mr-2 ${time.is_enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                      />
                                      {time.is_enabled ? '활성' : '비활성'}
                                    </td>
                                    <td className="px-3 py-2 align-middle">
                                      <NotificationTimeStatusBadge
                                        status={time.status}
                                      />
                                    </td>
                                    <td
                                      className={`px-3 py-2 align-middle ${time.is_enabled ? 'text-gray-900 font-semibold' : 'text-gray-400 line-through'}`}
                                    >
                                      {formatScheduledTime(
                                        new Date(time.scheduled_time)
                                      )}
                                    </td>
                                    <td className="px-3 py-2 align-middle text-gray-700">
                                      {new Date(
                                        time.scheduled_time
                                      ).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td
                                      className="px-3 py-2 align-middle text-gray-800 truncate max-w-[18rem]"
                                      title={time.raw_text || ''}
                                    >
                                      {time.raw_text || '-'}
                                    </td>
                                    <td
                                      className="px-3 py-2 align-middle text-gray-800 truncate max-w-[18rem]"
                                      title={time.label || ''}
                                    >
                                      {time.label || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 카드 목록 제거됨 */}

      {/* ===== 결과 요약 ===== */}
      <div className="text-center text-sm text-gray-500">
        총 {filteredNotifications.length}개의 알림을 찾았습니다
        {filteredNotifications.length !== notifications.length && (
          <span> (전체 {notifications.length}개 중)</span>
        )}
      </div>
    </div>
  );
}
