// Airtable Service for Product Catalog Management
const Airtable = require('airtable');

class AirtableService {
  constructor() {
    this.base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);

    this.tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';
  }

  /**
   * Fetch all products from Airtable
   * @returns {Promise<Array>} Array of product objects
   */
  async getAllProducts() {
    try {
      const records = await this.base(this.tableName).select({
        view: 'Grid view' // Adjust view name as needed
      }).all();

      return records.map(record => ({
        recordId: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error('Error fetching products from Airtable:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific product by record ID
   * @param {string} recordId
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async getProductByRecordId(recordId) {
    try {
      const record = await this.base(this.tableName).find(recordId);
      return record ? { recordId: record.id, ...record.fields } : null;
    } catch (error) {
      console.error(`Error fetching product ${recordId} from Airtable:`, error);
      return null;
    }
  }

  /**
   * Update product delivery status
   * @param {string} recordId
   * @param {Object} updates
   * @returns {Promise<Object>} Updated record
   */
  async updateProductStatus(recordId, updates) {
    try {
      const updatedRecord = await this.base(this.tableName).update(recordId, updates);
      return { recordId: updatedRecord.id, ...updatedRecord.fields };
    } catch (error) {
      console.error(`Error updating product ${recordId}:`, error);
      throw error;
    }
  }
}

module.exports = new AirtableService();
