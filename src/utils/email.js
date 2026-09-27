import { BrevoClient } from '@getbrevo/brevo';

let brevoInstance = null;
function getBrevo() {
  if (!brevoInstance && process.env.BREVO_KEY) {
    brevoInstance = new BrevoClient({ apiKey: process.env.BREVO_KEY });
  }
  return brevoInstance;
}

export async function sendEmail({ to, subject, html, text, sender }) {
  const brevo = getBrevo();
  if (!brevo) {
    console.warn('[Email] BREVO_KEY is not configured. Email skipped.');
    return { success: false, error: 'BREVO_KEY is not configured' };
  }

  try {
    const recipients = (Array.isArray(to) ? to : [to]).map((r) =>
      typeof r === 'string' ? { email: r.trim() } : { email: r.email.trim(), name: r.name?.trim() }
    );

    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: sender?.name || process.env.BREVO_FROM_NAME || 'Event Platform',
        email: sender?.email || process.env.BREVO_FROM_EMAIL || 'no-reply@eventmanagement.local'
      },
      to: recipients,
      subject,
      ...(html && { htmlContent: html }),
      ...(text && { textContent: text })
    });

    return { success: true, messageId: response?.messageId };
  } catch (error) {
    console.error('[Email Error]:', error?.message || error);
    return { success: false, error: error?.message || 'Failed to send email' };
  }
}

export default sendEmail;