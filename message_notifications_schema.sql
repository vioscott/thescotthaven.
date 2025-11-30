-- ============================================
-- MESSAGE NOTIFICATIONS AND PERFORMANCE SCHEMA
-- Run this in Supabase SQL Editor after enhance_chat_schema.sql
-- ============================================

-- 1. Add system_message column to messages table
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS system_message BOOLEAN DEFAULT false;

-- 2. Create notifications table for tracking unread message counts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create function to update notification count
CREATE OR REPLACE FUNCTION update_notification_count()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
BEGIN
  -- Only process non-system messages
  IF NEW.system_message = false THEN
    -- Get the recipient (the user who is NOT the sender in the conversation)
    SELECT CASE 
      WHEN c.participant1_id = NEW.sender_id THEN c.participant2_id
      ELSE c.participant1_id
    END INTO recipient_id
    FROM conversations c
    WHERE c.id = NEW.conversation_id;

    -- Insert or update notification count for recipient
    INSERT INTO notifications (user_id, unread_count, updated_at)
    VALUES (recipient_id, 1, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      unread_count = notifications.unread_count + 1,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically update notification counts
DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_count();

-- 7. Create function to decrease notification count when messages are marked as read
CREATE OR REPLACE FUNCTION decrease_notification_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrease if message was previously unread and is now read
  IF OLD.read = false AND NEW.read = true AND NEW.system_message = false THEN
    -- Get the user who is reading (not the sender)
    UPDATE notifications
    SET unread_count = GREATEST(unread_count - 1, 0),
        updated_at = now()
    WHERE user_id IN (
      SELECT CASE 
        WHEN c.participant1_id = NEW.sender_id THEN c.participant2_id
        ELSE c.participant1_id
      END
      FROM conversations c
      WHERE c.id = NEW.conversation_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to decrease notification count on read
DROP TRIGGER IF EXISTS message_read_notification_trigger ON public.messages;
CREATE TRIGGER message_read_notification_trigger
  AFTER UPDATE ON public.messages
  FOR EACH ROW
  WHEN (OLD.read IS DISTINCT FROM NEW.read)
  EXECUTE FUNCTION decrease_notification_count();

-- 9. Performance indexes
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx 
  ON public.messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS messages_sender_read_idx 
  ON public.messages(sender_id, read) WHERE read = false;

CREATE INDEX IF NOT EXISTS messages_system_message_idx 
  ON public.messages(conversation_id, system_message);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx 
  ON public.notifications(user_id);

-- 10. Create helper function to get unread count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COALESCE(unread_count, 0) INTO count
  FROM notifications
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION decrease_notification_count() TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Message notifications schema created successfully!';
  RAISE NOTICE 'You can now use the notifications table and functions.';
END $$;
