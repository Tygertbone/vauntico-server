import axios from "axios";

export class SlackService {
  static async sendAlert(message: string) {
    if (!process.env.SLACK_WEBHOOK_URL) return;
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
  }
}
