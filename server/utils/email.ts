import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

/**
 * Send OTP email for authentication
 */
export async function sendOtpEmail(to: string, otp: string, firstName?: string): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to,
      from: fromEmail,
      subject: 'Your Alga Verification Code',
      text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alga Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #faf5f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(45, 20, 5, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2d1405 0%, #5a4a42 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">Alga</h1>
                      <p style="margin: 10px 0 0; color: #f5ece3; font-size: 14px;">Stay. Discover. Belong.</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #2d1405; font-size: 24px; font-weight: 600;">
                        ${firstName ? `Hi ${firstName},` : 'Hello,'}
                      </h2>
                      
                      <p style="margin: 0 0 30px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        Your verification code for Alga is:
                      </p>
                      
                      <!-- OTP Display -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <div style="display: inline-block; background: linear-gradient(135deg, #f5ece3 0%, #faf8f6 100%); border: 3px solid #2d1405; border-radius: 12px; padding: 24px 48px;">
                              <span style="font-size: 48px; font-weight: 700; color: #2d1405; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                ${otp}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #5a4a42; font-size: 14px; line-height: 1.6;">
                        This code will expire in <strong style="color: #2d1405;">10 minutes</strong>. 
                        Enter it in your Alga app to complete your login.
                      </p>
                      
                      <div style="margin-top: 30px; padding: 20px; background-color: #faf8f6; border-left: 4px solid #2d1405; border-radius: 4px;">
                        <p style="margin: 0; color: #5a4a42; font-size: 14px; line-height: 1.6;">
                          <strong style="color: #2d1405;">Security Note:</strong> If you didn't request this code, please ignore this email. 
                          Never share your verification code with anyone.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5ece3; padding: 30px; text-align: center; border-top: 1px solid #e5ddd5;">
                      <p style="margin: 0 0 10px; color: #5a4a42; font-size: 14px;">
                        Thank you for choosing Alga
                      </p>
                      <p style="margin: 0; color: #5a4a42; font-size: 12px;">
                        Ethiopia's leading property rental platform
                      </p>
                      <p style="margin: 20px 0 0; color: #8b7a72; font-size: 11px;">
                        This is an automated message. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await client.send(msg);
    console.log(`[EMAIL] OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to,
      from: fromEmail,
      subject: 'Welcome to Alga - Your Ethiopian Stay Awaits!',
      text: `Welcome to Alga, ${firstName}!\n\nThank you for joining Ethiopia's leading property rental platform. You can now explore and book unique stays across Ethiopia.\n\nStart exploring: ${process.env.REPLIT_DEV_DOMAIN || 'https://alga.com'}\n\nThe Alga Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Alga</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #faf5f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(45, 20, 5, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2d1405 0%, #5a4a42 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">Alga</h1>
                      <p style="margin: 10px 0 0; color: #f5ece3; font-size: 14px;">Stay. Discover. Belong.</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #2d1405; font-size: 28px; font-weight: 600;">
                        Welcome, ${firstName}! 🎉
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        Thank you for joining <strong>Alga</strong>, Ethiopia's leading property rental platform. 
                        We're excited to help you discover unique stays across our beautiful country!
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        From traditional homes to modern hotels, from Addis Ababa to Lalibela, 
                        your perfect Ethiopian experience awaits.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://alga.com'}/properties" 
                               style="display: inline-block; background-color: #2d1405; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.3s;">
                              Start Exploring
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="margin-top: 30px; padding: 20px; background-color: #faf8f6; border-left: 4px solid #2d1405; border-radius: 4px;">
                        <p style="margin: 0 0 10px; color: #2d1405; font-size: 16px; font-weight: 600;">
                          What's Next?
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #5a4a42; font-size: 14px; line-height: 1.8;">
                          <li>Browse unique properties across Ethiopia</li>
                          <li>Book your stay with secure payments</li>
                          <li>Connect with verified local hosts</li>
                          <li>Experience authentic Ethiopian hospitality</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5ece3; padding: 30px; text-align: center; border-top: 1px solid #e5ddd5;">
                      <p style="margin: 0 0 10px; color: #5a4a42; font-size: 14px;">
                        Thank you for choosing Alga
                      </p>
                      <p style="margin: 0; color: #5a4a42; font-size: 12px;">
                        Ethiopia's leading property rental platform
                      </p>
                      <p style="margin: 20px 0 0; color: #8b7a72; font-size: 11px;">
                        Need help? Contact us at support@alga.com
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await client.send(msg);
    console.log(`[EMAIL] Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send welcome email:', error);
    // Don't throw - welcome email is nice-to-have, not critical
  }
}

/**
 * Send service provider application received confirmation email
 */
export async function sendProviderApplicationReceivedEmail(
  to: string,
  firstName: string,
  businessName: string,
  serviceType: string
): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to,
      from: fromEmail,
      subject: 'Application Received - Alga Services',
      text: `Hi ${firstName},\n\nThank you for applying to join Alga Services with "${businessName}".\n\nWe've received your application for ${serviceType} services. Our team will review your application and get back to you within 24 hours.\n\nWhat happens next?\n- Our verification team will review your application\n- We'll verify your credentials and service quality\n- You'll receive an email with the decision\n- Once approved, you can start accepting bookings\n\nThank you for choosing to partner with Alga!\n\nThe Alga Services Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #faf5f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(45, 20, 5, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2d1405 0%, #5a4a42 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">Alga Services</h1>
                      <p style="margin: 10px 0 0; color: #f5ece3; font-size: 14px;">Provider Network</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #2d1405; font-size: 24px; font-weight: 600;">
                        Hi ${firstName}, 🎉
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        Thank you for applying to join <strong>Alga Services</strong> with <strong>"${businessName}"</strong>!
                      </p>
                      
                      <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #f5ece3 0%, #faf8f6 100%); border-left: 4px solid #2d1405; border-radius: 8px;">
                        <p style="margin: 0 0 10px; color: #2d1405; font-size: 16px; font-weight: 600;">
                          Application Details
                        </p>
                        <p style="margin: 0; color: #5a4a42; font-size: 14px;">
                          <strong>Service Type:</strong> ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace(/_/g, ' ')}<br>
                          <strong>Status:</strong> Under Review
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        Our verification team will review your application and get back to you <strong style="color: #2d1405;">within 24 hours</strong>.
                      </p>
                      
                      <div style="margin-top: 30px; padding: 20px; background-color: #faf8f6; border-left: 4px solid #2d1405; border-radius: 4px;">
                        <p style="margin: 0 0 10px; color: #2d1405; font-size: 16px; font-weight: 600;">
                          What Happens Next?
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #5a4a42; font-size: 14px; line-height: 1.8;">
                          <li>Our team will review your application</li>
                          <li>We'll verify your credentials and service quality</li>
                          <li>You'll receive an email with our decision</li>
                          <li>Once approved, you can start accepting bookings</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5ece3; padding: 30px; text-align: center; border-top: 1px solid #e5ddd5;">
                      <p style="margin: 0 0 10px; color: #5a4a42; font-size: 14px;">
                        Thank you for choosing to partner with Alga
                      </p>
                      <p style="margin: 0; color: #5a4a42; font-size: 12px;">
                        Ethiopia's trusted services marketplace
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await client.send(msg);
    console.log(`[EMAIL] Provider application received email sent to ${to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send provider application received email:', error);
    // Don't throw - email is nice-to-have
  }
}

/**
 * Send service provider application approved email
 */
export async function sendProviderApplicationApprovedEmail(
  to: string,
  firstName: string,
  businessName: string,
  serviceType: string
): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to,
      from: fromEmail,
      subject: '✅ Application Approved - Welcome to Alga Services!',
      text: `Congratulations ${firstName}!\n\nYour application for "${businessName}" has been APPROVED! 🎉\n\nYou're now a verified provider in the Alga Services network. You can start accepting bookings immediately.\n\nNext Steps:\n1. Complete your service profile\n2. Set your availability\n3. Start accepting bookings\n4. Earn 85% on every booking\n\nGet Started: ${process.env.REPLIT_DEV_DOMAIN || 'https://alga.com'}/my-alga\n\nWelcome to the Alga Services family!\n\nThe Alga Services Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #faf5f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(45, 20, 5, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2d1405 0%, #5a4a42 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">Alga Services</h1>
                      <p style="margin: 10px 0 0; color: #f5ece3; font-size: 14px;">Application Approved!</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #2d1405; font-size: 28px; font-weight: 600;">
                        Congratulations, ${firstName}! 🎉
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        Your application for <strong>"${businessName}"</strong> has been <strong style="color: #2d1405;">APPROVED</strong>!
                      </p>
                      
                      <div style="margin: 20px 0; padding: 24px; background: linear-gradient(135deg, #f5ece3 0%, #faf8f6 100%); border-left: 4px solid #2d1405; border-radius: 8px; text-align: center;">
                        <p style="margin: 0 0 10px; color: #2d1405; font-size: 20px; font-weight: 700;">
                          You're Now a Verified Provider!
                        </p>
                        <p style="margin: 0; color: #5a4a42; font-size: 14px;">
                          Service Type: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace(/_/g, ' ')}
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        You can now start accepting bookings and earning <strong style="color: #2d1405;">85% on every booking</strong>!
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://alga.com'}/my-alga" 
                               style="display: inline-block; background-color: #2d1405; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Get Started
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="margin-top: 30px; padding: 20px; background-color: #faf8f6; border-left: 4px solid #2d1405; border-radius: 4px;">
                        <p style="margin: 0 0 10px; color: #2d1405; font-size: 16px; font-weight: 600;">
                          Next Steps
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #5a4a42; font-size: 14px; line-height: 1.8;">
                          <li>Complete your service profile</li>
                          <li>Set your availability and service areas</li>
                          <li>Start accepting bookings immediately</li>
                          <li>Earn 85% on every booking (paid within 24 hours)</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5ece3; padding: 30px; text-align: center; border-top: 1px solid #e5ddd5;">
                      <p style="margin: 0 0 10px; color: #5a4a42; font-size: 14px;">
                        Welcome to the Alga Services family!
                      </p>
                      <p style="margin: 0; color: #5a4a42; font-size: 12px;">
                        Ethiopia's trusted services marketplace
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await client.send(msg);
    console.log(`[EMAIL] Provider application approved email sent to ${to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send provider application approved email:', error);
    // Don't throw - email is nice-to-have
  }
}

/**
 * Send service provider application rejected email
 */
export async function sendProviderApplicationRejectedEmail(
  to: string,
  firstName: string,
  businessName: string,
  reason: string
): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to,
      from: fromEmail,
      subject: 'Application Update - Alga Services',
      text: `Hi ${firstName},\n\nThank you for your interest in joining Alga Services with "${businessName}".\n\nAfter careful review, we're unable to approve your application at this time.\n\nReason: ${reason}\n\nYou're welcome to reapply in the future. If you have questions, please contact our support team.\n\nThank you for your interest in partnering with Alga.\n\nThe Alga Services Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #faf5f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(45, 20, 5, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2d1405 0%, #5a4a42 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">Alga Services</h1>
                      <p style="margin: 10px 0 0; color: #f5ece3; font-size: 14px;">Application Update</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #2d1405; font-size: 24px; font-weight: 600;">
                        Hi ${firstName},
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        Thank you for your interest in joining <strong>Alga Services</strong> with <strong>"${businessName}"</strong>.
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        After careful review, we're unable to approve your application at this time.
                      </p>
                      
                      <div style="margin: 20px 0; padding: 20px; background-color: #faf8f6; border-left: 4px solid #5a4a42; border-radius: 8px;">
                        <p style="margin: 0 0 10px; color: #2d1405; font-size: 16px; font-weight: 600;">
                          Reason
                        </p>
                        <p style="margin: 0; color: #5a4a42; font-size: 14px; line-height: 1.6;">
                          ${reason}
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #5a4a42; font-size: 16px; line-height: 1.6;">
                        You're welcome to <strong>reapply in the future</strong> after addressing the feedback above. 
                        If you have any questions, please don't hesitate to contact our support team.
                      </p>
                      
                      <div style="margin-top: 30px; padding: 20px; background-color: #faf8f6; border-left: 4px solid #2d1405; border-radius: 4px;">
                        <p style="margin: 0; color: #5a4a42; font-size: 14px; line-height: 1.6;">
                          <strong style="color: #2d1405;">Need Help?</strong> Contact our support team at support@alga.com for assistance.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5ece3; padding: 30px; text-align: center; border-top: 1px solid #e5ddd5;">
                      <p style="margin: 0 0 10px; color: #5a4a42; font-size: 14px;">
                        Thank you for your interest in partnering with Alga
                      </p>
                      <p style="margin: 0; color: #5a4a42; font-size: 12px;">
                        Ethiopia's trusted services marketplace
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await client.send(msg);
    console.log(`[EMAIL] Provider application rejected email sent to ${to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send provider application rejected email:', error);
    // Don't throw - email is nice-to-have
  }
}
