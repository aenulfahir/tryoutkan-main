-- =====================================================
-- FIX: Update notifications table structure
-- =====================================================

-- Drop existing table if it exists with wrong structure
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Create notifications table with correct structure
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL DEFAULT 'purchase',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can read notifications
CREATE POLICY "Admins can view notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only system can insert notifications (for triggers)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (false);

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications" ON notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to create purchase notification
CREATE OR REPLACE FUNCTION create_purchase_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  package_title TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get user name and package title
  SELECT p.name INTO user_name
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  SELECT tp.title INTO package_title
  FROM tryout_packages tp
  WHERE tp.id = NEW.tryout_package_id;
  
  -- Create notification
  notification_title := 'Pembelian Paket Tryout Baru';
  notification_message := user_name || ' telah membeli paket "' || package_title || '"';
  
  INSERT INTO notifications (type, title, message, data)
  VALUES (
    'purchase',
    notification_title,
    notification_message,
    jsonb_build_object(
      'user_id', NEW.user_id,
      'user_name', user_name,
      'package_id', NEW.tryout_package_id,
      'package_title', package_title,
      'purchase_price', NEW.purchase_price,
      'purchased_at', NEW.purchased_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_purchase_create_notification ON user_tryout_purchases;

-- Trigger to create notification when purchase is made
CREATE TRIGGER on_purchase_create_notification
AFTER INSERT ON user_tryout_purchases
FOR EACH ROW
WHEN (NEW.is_active = TRUE)
EXECUTE FUNCTION create_purchase_notification();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM notifications
  WHERE is_read = FALSE;
  
  RETURN COALESCE(count_result, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, updated_at = NOW()
  WHERE is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;