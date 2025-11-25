-- Drop table if exists to ensure clean state
DROP TABLE IF EXISTS public.system_settings;

-- Create system_settings table
CREATE TABLE public.system_settings (
    setting_key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to system_settings"
    ON public.system_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow admin update access to system_settings"
    ON public.system_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin insert access to system_settings"
    ON public.system_settings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO public.system_settings (setting_key, value, description, category) VALUES
    ('app_name', '"TryoutKan"', 'Application Name', 'general'),
    ('contact_email', '"support@tryoutkan.com"', 'Contact Email', 'general'),
    ('support_phone', '"+62 812-3456-7890"', 'Support Phone', 'general'),
    ('maintenance_mode', 'false', 'Maintenance Mode', 'general'),
    
    ('welcome_email_template', '"Welcome to TryoutKan! We''re excited to have you..."', 'Welcome Email Template', 'email'),
    ('otp_email_template', '"Your OTP code is: {code}"', 'OTP Verification Template', 'email'),
    
    ('xendit_secret_key', '""', 'Xendit Secret Key', 'payment'),
    ('xendit_webhook_url', '"https://tryoutkan.com/api/webhook"', 'Xendit Webhook URL', 'payment'),
    ('payment_test_mode', 'true', 'Payment Test Mode', 'payment'),
    
    ('max_upload_size', '5', 'Max Upload Size (MB)', 'system'),
    ('session_timeout', '60', 'Session Timeout (minutes)', 'system'),
    ('api_rate_limit', '100', 'API Rate Limit (requests/minute)', 'system'),
    
    ('theme_mode', '"light"', 'Default Theme Mode', 'appearance'),
    ('primary_color', '"#000000"', 'Primary Color', 'appearance'),
    
    ('default_exam_duration', '90', 'Default Exam Duration (minutes)', 'tryout'),
    ('passing_grade', '65', 'Default Passing Grade', 'tryout'),
    ('show_results_immediately', 'true', 'Show Results Immediately', 'tryout')
ON CONFLICT (setting_key) DO NOTHING;
