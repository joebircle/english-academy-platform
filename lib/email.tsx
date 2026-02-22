import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Configure the "from" address:
// - With a verified domain: "The English Club <info@tudominio.com>"
// - Without a verified domain (testing): "The English Club <onboarding@resend.dev>"
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "The English Club <onboarding@resend.dev>"

interface EmailRecipient {
  email: string
  name: string
  studentName: string
}

function buildEmailHTML(
  title: string,
  content: string,
  recipientName: string,
  studentName: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e293b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">The English Club</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#64748b;font-size:14px;">
                Estimado/a <strong style="color:#1e293b;">${recipientName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#64748b;font-size:13px;">
                Tutor de: <strong>${studentName}</strong>
              </p>
              <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">${title}</h2>
              <div style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;white-space:pre-wrap;">${content}</div>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Este mensaje fue enviado desde la plataforma de gestion de The English Club.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                The English Club &copy; ${new Date().getFullYear()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendCommunicationEmails(
  title: string,
  content: string,
  recipients: EmailRecipient[],
): Promise<{ success: boolean; sent: number; errors: number }> {
  let sent = 0
  let errors = 0

  // Send emails in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)

    const results = await Promise.allSettled(
      batch.map((recipient) =>
        resend.emails.send({
          from: FROM_ADDRESS,
          to: recipient.email,
          subject: `The English Club - ${title}`,
          html: buildEmailHTML(title, content, recipient.name, recipient.studentName),
        }),
      ),
    )

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.data) {
        sent++
      } else {
        errors++
        if (result.status === "rejected") {
          console.error("Error enviando email:", result.reason)
        } else if (result.value.error) {
          console.error("Error enviando email:", result.value.error)
        }
      }
    }
  }

  return { success: errors === 0, sent, errors }
}
