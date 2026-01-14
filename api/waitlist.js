const fs = require('fs').promises;
const path = require('path');
const { Resend } = require('resend');
const { logger } = require('../server-v2/src/utils/logger');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple file-based storage for waitlist
const filePath = path.join(process.cwd(), 'public', 'waitlist.json');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Read existing waitlist
    let waitlist = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      waitlist = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start with empty array
    }

    // Check if email already exists
    const existingEntry = waitlist.find(entry => entry.email === email);
    if (existingEntry) {
      return res.status(200).json({ 
        success: true, 
        position: waitlist.findIndex(entry => entry.email === email) + 1,
        message: 'Already on waitlist'
      });
    }

    // Add new entry
    const newEntry = {
      email,
      timestamp: new Date().toISOString(),
      position: waitlist.length + 1
    };

    waitlist.push(newEntry);

    // Save to file
    await fs.writeFile(filePath, JSON.stringify(waitlist, null, 2));

    // Send confirmation email using Resend
    try {
      await resend.emails.send({
        from: 'Vauntico <hello@vauntico.com>',
        to: [email],
        subject: `You're #${newEntry.position} on the Vauntico Waitlist! 🚀`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin-bottom: 10px;">You're In! 🎉</h1>
              <p style="font-size: 18px; color: #4b5563;">
                Welcome to the Vauntico beta program. Your queue position is:
              </p>
            </div>
            <div style="text-align: center; margin: 0 auto; width: 200px; height: 200px; background: linear-gradient(to right, #6366f1, #4f46e5); border-radius: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">
              #${newEntry.position}
            </div>
            <p style="text-sm text-gray-500 mb-2">Queue Position</p>
            <p style="color: #666; text-sm">
              We'll send you an invitation as soon as a spot opens up. Keep an eye on your inbox!
            </p>
            <div style="margin: 30px 0; text-center; text-sm text-gray-500">
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
                Early access
              </div>
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
                Beta features
              </div>
              <div style="display: flex; align-items: center; justify-content: center;">
                <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
                Priority support
              </div>
            </div>
          </div>
        `
      });
      logger.info(`Confirmation email sent to ${email}`);
    } catch (emailError) {
      logger.error('Email send error:', emailError);
      // Continue even if email fails - user is still added to waitlist
    }

    // Return success response
    return res.status(200).json({
      success: true,
      position: newEntry.position,
      message: `Welcome! You're #${newEntry.position} on the waitlist. Check your email for confirmation.`
    });
  } catch (error) {
    logger.error('Waitlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
