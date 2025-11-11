import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

class SupabaseService {
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Memory Management
  async saveMemory(userId, context) {
    try {
      const { data, error } = await this.supabase
        .from('user_memory')
        .upsert({
          user_id: userId,
          context: context,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Supabase memory save error:', error);
      return { error: error.message };
    }
  }

  async getMemory(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_memory')
        .select('context')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.context || {};
    } catch (error) {
      console.error('Supabase memory get error:', error);
      return {};
    }
  }

  // SOS Alert System
  async sendSOSAlert(alertData) {
    try {
      const alert = {
        ...alertData,
        id: Date.now().toString(),
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('sos_alerts')
        .insert(alert);
      
      if (error) throw error;

      // Trigger real-time notification
      await this.supabase
        .from('notifications')
        .insert({
          type: 'SOS_ALERT',
          message: `Emergency alert from ${alertData.userId}`,
          data: alert,
          created_at: new Date().toISOString()
        });

      return { success: true, alertId: alert.id };
    } catch (error) {
      console.error('Supabase SOS error:', error);
      return { error: error.message };
    }
  }

  // Chat History
  async saveChatMessage(userId, message, response) {
    try {
      const { data, error } = await this.supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          message,
          response,
          timestamp: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Chat history save error:', error);
      return { error: error.message };
    }
  }

  async getChatHistory(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Chat history get error:', error);
      return [];
    }
  }
}

export default SupabaseService;