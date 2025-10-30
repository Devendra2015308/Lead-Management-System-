const axios = require("axios");

class WebsiteLeadService {
  constructor() {
    this.apiKey = process.env.WEBSITE_API_KEY;
    this.baseURL = process.env.WEBSITE_API_BASE_URL;
  }

  async fetchLeads() {
    try {
      console.log("🔧 Website Lead Service: Using mock data");
      return this.getMockLeads();

      // Uncomment when you have actual website API
      /*
      const response = await axios.get(`${this.baseURL}/leads`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          since: this.getLastSyncTimestamp()
        }
      });

      return this.formatLeads(response.data);
      */
    } catch (error) {
      console.error("❌ Error fetching website leads:", error.message);
      return this.getMockLeads();
    }
  }

  getMockLeads() {
    return [
      {
        source: "website",
        source_id: `website_${Date.now()}_1`,
        name: "Website Visitor",
        email: "webvisitor@example.com",
        phone: "+1234567892",
        service_interest: "Web Development",
        message: "Interested in building a new website",
        page_url: "/contact",
        created_time: new Date(),
      },
    ];
  }

  formatLeads(websiteLeads) {
    return websiteLeads.map((lead) => ({
      source: "website",
      source_id: lead.id,
      created_time: new Date(lead.submitted_at),
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      service_interest: lead.service_type || lead.message,
      message: lead.message,
      page_url: lead.page_url,
    }));
  }

  getLastSyncTimestamp() {
    return Math.floor(Date.now() / 1000) - 3600; // Last 1 hour
  }
}

module.exports = new WebsiteLeadService();
