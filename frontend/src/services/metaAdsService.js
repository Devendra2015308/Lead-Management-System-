const axios = require("axios");

class MetaAdsService {
  constructor() {
    this.baseURL = "https://graph.facebook.com/v17.0";
    this.accessToken = process.env.META_ACCESS_TOKEN;
  }

  async getLeads(adAccountId) {
    try {
      // For now, return mock data since we don't have actual API credentials
      console.log("🔧 Meta Ads Service: Using mock data");
      return this.getMockLeads();

      // Uncomment when you have actual API credentials
      /*
      const response = await axios.get(`${this.baseURL}/${adAccountId}/leads`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,created_time,field_data,ad_name,campaign_name'
        }
      });
      
      return this.formatLeads(response.data.data);
      */
    } catch (error) {
      console.error(
        "❌ Error fetching Meta leads:",
        error.response?.data || error.message
      );
      // Return mock data as fallback
      return this.getMockLeads();
    }
  }

  getMockLeads() {
    return [
      {
        source: "meta_ads",
        source_id: `meta_${Date.now()}_1`,
        name: "Facebook User",
        email: "fbuser@example.com",
        phone: "+1234567890",
        service_interest: "Social Media Marketing",
        campaign_name: "Spring Campaign",
        created_time: new Date(),
      },
    ];
  }

  formatLeads(metaLeads) {
    return metaLeads.map((lead) => ({
      source: "meta_ads",
      source_id: lead.id,
      created_time: new Date(lead.created_time),
      ad_name: lead.ad_name,
      campaign_name: lead.campaign_name,
      ...this.extractFieldData(lead.field_data),
    }));
  }

  extractFieldData(fieldData) {
    const fields = {};
    fieldData.forEach((field) => {
      fields[field.name] = field.values[0];
    });
    return {
      name: fields.full_name || fields.first_name + " " + fields.last_name,
      email: fields.email,
      phone: fields.phone_number,
      service_interest: fields.service_interest || "Unknown",
    };
  }
}

module.exports = new MetaAdsService();
