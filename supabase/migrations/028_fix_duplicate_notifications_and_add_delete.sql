-- =====================================================
-- FIX: Remove duplicate triggers and add delete functionality
-- =====================================================

-- Remove any existing triggers to prevent duplicates
DROP TRIGGER IF EXISTS on_purchase_create_notification ON user_tryout_purchases;

-- Remove all existing notification functions to ensure clean state
DROP FUNCTION IF EXISTS create_purchase_notification() CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count() CASCADE;
DROP FUNCTION IF EXISTS mark_notification_as_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_as_read() CASCADE;

-- Clean up any duplicate notifications that might exist
DELETE FROM notifications
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY type, title, message, COALESCE(data::text, ''), created_at
            ORDER BY created_at
        ) as row_num
        FROM notifications
    ) as distinct_notifications
    WHERE row_num = 1
);

-- Function to create purchase notification (updated)
CREATE OR REPLACE FUNCTION create_purchase_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  package_title TEXT;
  notification_title TEXT;
  notification_message TEXT;
  existing_notification_id UUID;
BEGIN
  -- Get user name and package title
  SELECT p.name INTO user_name
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  SELECT tp.title INTO package_title
  FROM tryout_packages tp
  WHERE tp.id = NEW.tryout_package_id;
  
  -- Check if notification already exists for this purchase (prevent duplicates)
  SELECT id INTO existing_notification_id
  FROM notifications
  WHERE type = 'purchase'
    AND data->>'user_id' = NEW.user_id::text
    AND data->>'package_id' = NEW.tryout_package_id::text
    AND data->>'purchased_at' = NEW.purchased_at::text
  LIMIT 1;
  
  -- Only create notification if it doesn't exist
  IF existing_notification_id IS NULL THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only once)
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

-- Function to delete a notification
CREATE OR REPLACE FUNCTION delete_notification(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM notifications
  WHERE id = notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete all read notifications
CREATE OR REPLACE FUNCTION delete_read_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete all notifications
CREATE OR REPLACE FUNCTION delete_all_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow deletion
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
CREATE POLICY "Admins can update notifications" ON notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add policy for deletion
CREATE POLICY "Admins can delete notifications" ON notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );