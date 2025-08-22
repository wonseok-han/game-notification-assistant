-- ===== Supabase 데이터베이스 스키마 =====
-- 이 파일을 Supabase SQL 편집기에서 실행하여 테이블을 생성하세요

-- ===== 사용법 =====
-- 1. Supabase SQL Editor에서 이 스크립트 실행
-- 2. RLS가 자동으로 설정되어 사용자별 데이터 분리
-- 3. auth.users 테이블과 자동으로 연결됨

-- 기존 정책들 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "OAuth connections can be created" ON public.oauth_connections;
DROP POLICY IF EXISTS "OAuth connections can be updated" ON public.oauth_connections;
DROP POLICY IF EXISTS "OAuth connections can be deleted" ON public.oauth_connections;
DROP POLICY IF EXISTS "OAuth connections can be viewed" ON public.oauth_connections;
DROP POLICY IF EXISTS "OAuth connections can be all" ON public.oauth_connections;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.game_notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON public.game_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.game_notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.game_notifications;

DROP POLICY IF EXISTS "Users can view own notification times" ON public.notification_times;
DROP POLICY IF EXISTS "Users can create own notification times" ON public.notification_times;
DROP POLICY IF EXISTS "Users can update own notification times" ON public.notification_times;
DROP POLICY IF EXISTS "Users can delete own notification times" ON public.notification_times;

-- users 인덱스 삭제
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;

-- oauth_connections 인덱스 삭제
DROP INDEX IF EXISTS idx_oauth_connections_user_id;
DROP INDEX IF EXISTS idx_oauth_connections_provider;

-- game_notifications 인덱스 삭제
DROP INDEX IF EXISTS idx_game_notifications_user_id;
DROP INDEX IF EXISTS idx_game_notifications_status;
DROP INDEX IF EXISTS idx_game_notifications_scheduled_time;

-- notification_times 인덱스 삭제
DROP INDEX IF EXISTS idx_notification_times_notification_id;
DROP INDEX IF EXISTS idx_notification_times_scheduled_time;
DROP INDEX IF EXISTS idx_notification_times_status;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS public.notification_times CASCADE;
DROP TABLE IF EXISTS public.game_notifications CASCADE;
DROP TABLE IF EXISTS public.oauth_connections CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- auth.users 테이블의 데이터 삭제
DELETE FROM auth.users;
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;

-- ===== 사용자 테이블 =====
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== OAuth 연결 테이블 =====
CREATE TABLE IF NOT EXISTS public.oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'kakao', 'google' 등
    provider_user_id VARCHAR(255) NOT NULL, -- OAuth 제공자의 사용자 ID
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_connected BOOLEAN DEFAULT true,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disconnected_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(user_id, provider)
);

-- ===== 게임 알림 테이블 =====
CREATE TABLE IF NOT EXISTS public.game_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    game_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 알림 시간 테이블 =====
CREATE TABLE IF NOT EXISTS public.notification_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES game_notifications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  raw_text TEXT,
  label TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 인덱스 생성 =====

-- 사용자 정보 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- OAuth 연결 인덱스
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON public.oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON public.oauth_connections(provider);

-- 게임 알림 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_game_notifications_user_id ON public.game_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_game_notifications_is_active ON public.game_notifications(is_active);

-- 알림 시간 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_times_notification_id ON public.notification_times(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_times_scheduled_time ON public.notification_times(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notification_times_status ON public.notification_times(status);

-- ===== RLS (Row Level Security) 정책 =====

-- ===== 사용자 테이블 RLS 활성화 =====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===== OAuth 연결 테이블 RLS 활성화 =====
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "OAuth connections can be created" ON public.oauth_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "OAuth connections can be updated" ON public.oauth_connections
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "OAuth connections can be deleted" ON public.oauth_connections
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "OAuth connections can be viewed" ON public.oauth_connections
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "OAuth connections can be all" ON public.oauth_connections
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== 게임 알림 테이블 RLS 활성화 =====
ALTER TABLE public.game_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.game_notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notifications" ON public.game_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.game_notifications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.game_notifications
    FOR DELETE USING (auth.uid() = user_id);

-- ===== 알림 시간 테이블 RLS 활성화 =====
ALTER TABLE public.notification_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification times" ON public.notification_times
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.game_notifications
            WHERE id = notification_times.notification_id
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create own notification times" ON public.notification_times
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.game_notifications
            WHERE id = notification_times.notification_id
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own notification times" ON public.notification_times
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.game_notifications
            WHERE id = notification_times.notification_id
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own notification times" ON public.notification_times
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.game_notifications
            WHERE id = notification_times.notification_id
            AND user_id = auth.uid()
        )
    );

-- ===== 함수 및 트리거 =====
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_notifications_updated_at BEFORE UPDATE ON public.game_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_times_updated_at BEFORE UPDATE ON public.notification_times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
