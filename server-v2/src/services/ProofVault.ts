import { pool } from "../db/pool";

export class ProofVault {
  static async storeProof(userId: string, planCode: string, currency: string, amount: number) {
    return pool.query(
      'INSERT INTO proofs (user_id, plan_code, currency, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, planCode, currency, amount]
    );
  }

  static async getProofs(userId: string) {
    return pool.query('SELECT * FROM proofs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  }
}
