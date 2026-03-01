interface EmailRecipient {
  email: string
  name: string
  studentName: string
}

export async function sendCommunicationEmails(
  title: string,
  content: string,
  recipients: EmailRecipient[],
): Promise<{ success: boolean; sent: number; errors: number }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL

  if (!webhookUrl) {
    console.error("N8N_WEBHOOK_URL no está configurada")
    return { success: false, sent: 0, errors: recipients.length }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `The English Club - ${title}`,
        content,
        recipients,
      }),
    })

    if (!response.ok) {
      console.error("Error en webhook n8n:", response.status, await response.text())
      return { success: false, sent: 0, errors: recipients.length }
    }

    return { success: true, sent: recipients.length, errors: 0 }
  } catch (error) {
    console.error("Error enviando a n8n:", error)
    return { success: false, sent: 0, errors: recipients.length }
  }
}
