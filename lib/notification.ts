
/**
 * Mock Notification Service
 * 
 * In a real production app, you would integrate with a provider like:
 * - Fonnte (WhatsApp)
 * - Twilio (WhatsApp/SMS)
 * - Nodemailer (Email)
 * 
 * Currently configured to log to console.
 */
import { generateWhatsAppMessage } from "./ai";
import { sendWhatsAppMessage } from "./whatsapp";

/**
 * Notification Service
 * Integrates Baileys for WhatsApp and OpenAI for message generation.
 */

export const NotificationService = {
  /**
   * Send a notification when transaction status changes
   */
  async sendTransactionStatusUpdate(
    memberTlp: string | null | undefined,
    memberName: string,
    invoiceCode: string,
    status: string
  ): Promise<boolean> {
    
    if (!memberTlp) {
      console.log(`[Notification] Skipped: No phone number for member ${memberName} (INV: ${invoiceCode})`);
      return false;
    }

    try {
        // 1. Generate Message via AI
        const message = await generateWhatsAppMessage(memberName, invoiceCode, status);
        
        // 2. Send via WhatsApp
        const success = await sendWhatsAppMessage(memberTlp, message);

        if (success) {
            console.log(`[Notification] Success sent to ${memberTlp}`);
        } else {
            console.error(`[Notification] Failed to send to ${memberTlp}`);
        }
        
        return success;
    } catch (error) {
        console.error("[Notification] Error:", error);
        return false;
    }
  }
};
