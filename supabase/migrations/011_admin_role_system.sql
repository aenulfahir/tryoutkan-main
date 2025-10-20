-- =====================================================
-- MIGRATION 011: ADMIN ROLE SYSTEM
-- =====================================================
-- Description: Add role-based access control untuk admin dashboard
-- Author: Augment Agent
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. ADD ROLE COLUMN TO PROFILES TABLE
-- =====================================================

-- Create role enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index for role column (for faster queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 2. ADMIN HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin access (throws error if not admin)
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. RLS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_read_all_profiles ON public.profiles;
DROP POLICY IF EXISTS admin_update_users ON public.profiles;
DROP POLICY IF EXISTS admin_delete_users ON public.profiles;

-- Policy: Admins can read all profiles
CREATE POLICY admin_read_all_profiles ON public.profiles
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- Policy: Admins can update any user profile
CREATE POLICY admin_update_users ON public.profiles
  FOR UPDATE
  USING (
    public.is_admin(auth.uid())
  );

-- Policy: Admins can delete users (soft delete recommended)
CREATE POLICY admin_delete_users ON public.profiles
  FOR DELETE
  USING (
    public.is_admin(auth.uid())
  );

-- =====================================================
-- 4. ADMIN-SPECIFIC TABLES
-- =====================================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'tryout', 'question', 'user', 'payment', etc.
  entity_id UUID, -- ID of the affected entity
  old_value JSONB, -- Previous state (for updates/deletes)
  new_value JSONB, -- New state (for creates/updates)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT, -- Optional link to related entity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- 5. RLS POLICIES FOR ADMIN TABLES
-- =====================================================

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all activity logs
CREATE POLICY admin_read_activity_logs ON public.activity_logs
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- Policy: System can insert activity logs
CREATE POLICY system_insert_activity_logs ON public.activity_logs
  FOR INSERT
  WITH CHECK (TRUE);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY users_read_own_notifications ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Admins can read all notifications
CREATE POLICY admin_read_all_notifications ON public.notifications
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- Policy: System can insert notifications
CREATE POLICY system_insert_notifications ON public.notifications
  FOR INSERT
  WITH CHECK (TRUE);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY users_update_own_notifications ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- =====================================================
-- 6. HELPER FUNCTION TO LOG ACTIVITY
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_activity(
  p_action VARCHAR(100),
  p_entity_type VARCHAR(50),
  p_entity_id UUID DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_value,
    p_new_value,
    NOW()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. HELPER FUNCTION TO CREATE NOTIFICATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info',
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    link,
    created_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_link,
    NOW()
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE DEFAULT ADMIN USER (OPTIONAL)
-- =====================================================
-- Note: This should be done manually via Supabase Dashboard
-- or through a separate script after user creation

-- Example: Update existing user to admin
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@tryoutkan.com';

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(VARCHAR, VARCHAR, UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, VARCHAR, TEXT, VARCHAR, TEXT) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 011 completed successfully!';
  RAISE NOTICE '📊 Added role column to profiles table';
  RAISE NOTICE '🔐 Created admin helper functions';
  RAISE NOTICE '🛡️ Created RLS policies for admin access';
  RAISE NOTICE '📝 Created activity_logs table';
  RAISE NOTICE '🔔 Created notifications table';
END $$;

