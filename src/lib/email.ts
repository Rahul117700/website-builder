import { Resend } from 'resend';

// Initialize Resend (free tier: 3,000 emails/month)
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (you can change this to your verified domain)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend
 * Free tier: 3,000 emails/month
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // Skip sending if no API key (development mode)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Email would be sent (RESEND_API_KEY not set):', {
        to: options.to,
        subject: options.subject,
      });
      return { success: true, id: 'mock-email-id' };
    }

    const { data, error } = await resend.emails.send({
      from: options.from || FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderDetails: {
    orderId: string;
    productName: string;
    amount: number;
    currency: string;
    downloadUrl: string;
    funnelName?: string;
  }
) {
  const { orderId, productName, amount, currency, downloadUrl, funnelName } = orderDetails;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your purchase!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${productName}</td>
              </tr>
              ${funnelName ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Funnel:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${funnelName}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${currency} ${amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${downloadUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Download Your Product
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${productName}`,
    html,
  });
}

/**
 * Send sale notification email to seller
 */
export async function sendSaleNotificationEmail(
  sellerEmail: string,
  saleDetails: {
    orderId: string;
    productName: string;
    customerEmail: string;
    amount: number;
    currency: string;
    funnelName?: string;
  }
) {
  const { orderId, productName, customerEmail, amount, currency, funnelName } = saleDetails;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Sale!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💰 New Sale!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! You made a sale!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Sale Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${productName}</td>
              </tr>
              ${funnelName ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Funnel:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${funnelName}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Customer:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937; text-align: right;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #10b981; text-align: right; font-size: 18px;">${currency} ${amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: sellerEmail,
    subject: `💰 New Sale: ${productName} - ${currency} ${amount.toLocaleString()}`,
    html,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail: string, userName?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Sell Earn Direct! 🎉</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName || 'there'},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to Sell Earn Direct! We're excited to help you start selling your digital products online.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Get Started in 3 Steps:</h2>
            <ol style="color: #4b5563; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Set up your payment gateway (Razorpay) in Settings</li>
              <li style="margin-bottom: 10px;">Create your first sales funnel</li>
              <li style="margin-bottom: 10px;">Upload your product and start selling!</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Need help? Check out our <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog" style="color: #667eea;">blog</a> for guides and tips!
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Sell Earn Direct! 🎉',
    html,
  });
}

