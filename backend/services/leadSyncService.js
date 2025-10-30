const cron = require('node-cron');
const Lead = require('../models/Lead');

class LeadSyncService {
  constructor() {
    this.isSyncing = false;
  }

  startSynchronization() {
    // Sync every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      console.log('🔄 Scheduled lead sync started');
      this.syncAllLeads();
    });

    console.log('✅ Lead synchronization service started');
  }

  async syncAllLeads() {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }
    
    this.isSyncing = true;
    console.log('🔄 Starting lead synchronization...');
    
    try {
      // For now, we'll simulate API calls since we don't have actual API credentials
      const mockLeads = await this.getMockLeads();
      await this.saveLeads(mockLeads);
      
      console.log('✅ Lead synchronization completed');
    } catch (error) {
      console.error('❌ Lead synchronization failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async getMockLeads() {
    // Simulate leads from different sources
    const sources = ['website', 'meta_ads', 'google_ads'];
    const mockLeads = [];

    for (let i = 0; i < 3; i++) {
      const source = sources[Math.floor(Math.random() * sources.length)];
      mockLeads.push({
        source: source,
        source_id: `mock_${source}_${Date.now()}_${i}`,
        name: `Test User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        phone: `+1234567890${i}`,
        service_interest: ['Web Development', 'SEO', 'Social Media'][i % 3],
        message: `Interested in ${['Web Development', 'SEO', 'Social Media'][i % 3]} services`,
        status: 'new',
        created_time: new Date()
      });
    }

    return mockLeads;
  }

  async saveLeads(leads) {
    const { emitNewLead } = require('../server').app.settings;

    for (const leadData of leads) {
      try {
        // Check if lead already exists
        const existingLead = await Lead.findOne({ 
          source: leadData.source, 
          source_id: leadData.source_id 
        });

        if (!existingLead) {
          const newLead = new Lead(leadData);
          const savedLead = await newLead.save();
          
          // Emit real-time notification
          if (emitNewLead) {
            emitNewLead(savedLead);
          }
          
          console.log(`✅ New lead saved: ${savedLead._id} from ${savedLead.source}`);
        } else {
          console.log(`⏭️  Lead already exists: ${existingLead._id}`);
        }
      } catch (error) {
        console.error('❌ Error saving lead:', error);
      }
    }
  }
}

module.exports = new LeadSyncService();