class GoogleAdsService {
  constructor() {
    // Initialize with your Google Ads API credentials
    this.isConfigured = !!process.env.GOOGLE_ADS_CLIENT_ID;
  }

  async getLeads(customerId) {
    try {
      console.log('🔧 Google Ads Service: Using mock data');
      return this.getMockLeads();
      
      // Uncomment when you have actual API credentials
      /*
      if (!this.isConfigured) {
        throw new Error('Google Ads API not configured');
      }
      
      // Actual API implementation would go here
      const leads = await this.fetchRealLeads(customerId);
      return this.formatLeads(leads);
      */
    } catch (error) {
      console.error('❌ Error fetching Google Ads leads:', error.message);
      return this.getMockLeads();
    }
  }

  getMockLeads() {
    return [
      {
        source: 'google_ads',
        source_id: `google_${Date.now()}_1`,
        name: 'Google User',
        email: 'googleuser@example.com',
        phone: '+1234567891',
        service_interest: 'SEO Services',
        campaign_name: 'Search Campaign Q1',
        created_time: new Date()
      }
    ];
  }

  formatLeads(googleLeads) {
    return googleLeads.map(lead => ({
      source: 'google_ads',
      source_id: lead.lead.id,
      created_time: new Date(lead.lead.created_time),
      campaign_name: lead.campaign.name,
      ad_group: lead.ad_group.name,
      ...this.extractFormData(lead.lead.form_data)
    }));
  }

  extractFormData(formData) {
    const fields = {};
    formData.forEach(field => {
      fields[field.field_name] = field.field_value;
    });
    return {
      name: fields.full_name || 'Unknown',
      email: fields.email,
      phone: fields.phone,
      service_interest: fields.service_type || 'Unknown'
    };
  }
}

module.exports = new GoogleAdsService();