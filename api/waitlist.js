const fs = require("fs").promises;
const path = require("path");
const { Resend } = require("resend");

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple file-based storage for waitlist
const filePath = path.join(process.cwd(), "public", "waitlist.json");

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Read existing waitlist
    let waitlist = [];
    try {
      const data = await fs.readFile(filePath, "utf8");
      waitlist = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start with empty array
    }

    // Check if email already exists
    const existingEntry = waitlist.find((entry) => entry.email === email);
    if (existingEntry) {
      return res.status(200).json({
        success: true,
        position: waitlist.findIndex((entry) => entry.email === email) + 1,
        message: "Already on waitlist",
      });
    }

    // Add new entry
    const newEntry = {
      email,
      timestamp: new Date().toISOString(),
      position: waitlist.length + 1,
    };

    waitlist.push(newEntry);

    // Save to file
    await fs.writeFile(filePath, JSON.stringify(waitlist, null, 2));

    // Send confirmation email using Resend
    try {
      await resend.emails.send({
        from: "Vauntico <hello@vauntico.com>",
        to: [email],
        subject: `You're #${newEntry.position} on the Vauntico Waitlist! 🚀`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin-bottom: 10px;">You're In! 🎉</h1>
              <p style="font-size: 18px; color: #4b5563;">
                Welcome to Vauntico - You're <strong>#${newEntry.position}</strong> on the waitlist
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">What's Next?</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                We're building something special for creators who want to turn their passion into sustainable income. 
                As an early member, you'll get:
              </p>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>✨ First access to our AI-powered trust scoring system</li>
                <li>🎯 Personalized content monetization strategies</li>
                <li>🚀 Early beta access and exclusive features</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                We'll keep you updated on our progress and let you know as soon as your spot is ready.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or visit us at <a href="https://vauntico.com" style="color: #6366f1;">vauntico.com</a>
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2024 Vauntico. Building the future of creator economy.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Continue even if email fails - user is still added to waitlist
    }

    // Return success response
    res.status(200).json({
      success: true,
      position: newEntry.position,
      message: `Welcome! You're #${newEntry.position} on the waitlist. Check your email for confirmation.`,
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
