-- Email campaigns and scheduling for trial nurture and conversion optimization
CREATE TABLE email_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100) NOT NULL, -- 'trial_nurture', 'upgrade_reminder', 'retention', etc.
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    trigger_event VARCHAR(100) NOT NULL, -- 'trial_start', 'trial_day_3', 'trial_day_7', etc.
    delay_days INTEGER DEFAULT 0,
    delay_hours INTEGER DEFAULT 0,
    target_user_type VARCHAR(100), -- 'free', 'trial', 'expired_trial', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track email sends and their status
CREATE TABLE email_sends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced'
    stripe_session_id VARCHAR(255), -- For tracking conversion from email clicks
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track feature usage to trigger upgrade emails
CREATE TABLE user_feature_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL, -- 'ai_generation', 'vault_create', 'collaborator_add', etc.
    usage_count INTEGER DEFAULT 0,
    threshold_triggered BOOLEAN DEFAULT false,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, feature_name)
);

-- Trial nurture campaigns
INSERT INTO email_campaigns (campaign_name, campaign_type, subject_template, body_template, trigger_event, delay_days, target_user_type) VALUES
('trial_welcome', 'trial_nurture', 'Welcome to Vauntico! Here''s how to get started 🚀', 'Welcome to Vauntico! You now have 14 days of full Creator Pass access.

Here''s what you can do right away:
• Generate your first landing page with: vault landing-page "My SaaS Idea"
• Create a workshop outline: vault workshop "AI Prompt Engineering"
• Run an audit on your current site: vault audit https://yoursite.com

Quick tip: Start with the CLI - it''s designed to work exactly like you think!

Need help? Reply to this email or check our docs.

Enjoy creating freely! ✨', 'trial_start', 0, 'trial'),

('trial_feature_highlight', 'trial_nurture', 'Day 3: Unlock Unlimited AI Generations 🤖', 'Hope you''re enjoying Vauntico! By now you might have noticed how fast the CLI generates content.

🎯 Pro Tip: The AI learns your writing style - try generating a few landing pages with different tones to train it.

Your trial progress: 3/14 days remaining
Free tier limit after trial: 50 AI generations/month

Ready for unlimited? Upgrade anytime: {{upgrade_url}}

Questions? Just reply! 😊', 'trial_start', 3, 'trial'),

('trial_advanced_features', 'trial_nurture', 'Day 7: Vault Collaboration & Analytics 📊', 'You''ve been creating amazing things on Vauntico! Did you know you can collaborate with team members in your vaults?

• Add collaborators with unlimited permissions
• Track content performance with advanced analytics
• Export everything - no vendor lock-in

Trial status: 7/14 days - you''re halfway there! 🔥

Free version limits (starting soon):
• 3 vaults max
• 1 GB storage
• No team collaboration

Keep going or upgrade now: {{upgrade_url}}', 'trial_start', 7, 'trial'),

('trial_upgrade_reminder', 'upgrade_reminder', 'Day 11: Don''t Lose Your Progress ⚠️', 'Your Vauntico trial is ending in 3 days!

Right now you have:
✓ Unlimited vaults
✓ Unlimited AI generations
✓ 100 GB storage
✓ Advanced analytics

After trial ends, you''ll be on the free plan with:
✗ Max 3 vaults
✗ 50 AI generations/month
✗ 1 GB storage
✗ No analytics

Don''t risk losing your creative momentum - upgrade now and keep creating without limits.

Last chance for 14-day trial pricing!

{{upgrade_url}}', 'trial_start', 11, 'trial'),

('trial_expiration_warning', 'upgrade_reminder', 'LAST DAY: Your Trial Expires Tomorrow ⏰', '🚨 ACTION REQUIRED: Your Vauntico trial expires TOMORROW

Save your work before it''s too late!

✅ Upgrade Now - Keep Everything
❌ Do Nothing - Lose Access to:
• All your vaults and content
• Advanced analytics
• Unlimited AI generations
• Team collaboration

One-click upgrade: {{upgrade_url}}

We''d hate to see you lose your progress. This is your final reminder!', 'trial_start', 13, 'trial'),

('post_trial_followup', 'retention', 'We miss you! Come back to unlimited creation 🌟', 'Hi {{first_name}},

It''s been a few days since your Vauntico trial ended. We noticed you were creating some amazing content!

On the free plan you''re limited to:
• 3 vaults
• 50 AI generations/month
• Basic analytics only

But as a Creator Pass member, you get:
• Unlimited everything
• Advanced collaboration
• 100 GB storage
• Priority support

Ready to start creating without limits again?

{{upgrade_url}}

P.S. We saved all your work - you can pick up right where you left off!', 'trial_expired', 3, 'expired_trial');

CREATE INDEX idx_email_sends_user_campaign ON email_sends(user_id, campaign_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_email_sends_sent_at ON email_sends(sent_at);
CREATE INDEX idx_email_campaigns_active ON email_campaigns(is_active, trigger_event);
CREATE INDEX idx_user_feature_usage_threshold ON user_feature_usage(user_id, feature_name, threshold_triggered);
