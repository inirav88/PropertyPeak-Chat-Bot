
import { BotFeature, FeatureStatus } from './types';

export const INITIAL_FEATURES: BotFeature[] = [
  { id: 'lq_auto_detect', category: 'Lead Qualification', name: 'Buyer/Seller Auto-detection', description: 'Automatically classify leads based on initial chat.', status: FeatureStatus.ENABLED, icon: 'fa-id-card' },
  { id: 'lq_timeline', category: 'Lead Qualification', name: 'Timeline Identification', description: 'Identify if user is exploring or immediate buyer.', status: FeatureStatus.ENABLED, icon: 'fa-clock' },
  { id: 'cs_nlu', category: 'Conversational Smartness', name: 'Multi-lingual NLU', description: 'Understand English, Hindi, and Gujarati.', status: FeatureStatus.ENABLED, icon: 'fa-language' },
  { id: 'cs_emotion', category: 'Conversational Smartness', name: 'Emotion Detection', description: 'Identify urgency or price concern in messages.', status: FeatureStatus.ENABLED, icon: 'fa-smile' },
  { id: 'pm_engine', category: 'Property Matching', name: 'Dynamic Recommendation Engine', description: 'Suggest properties based on user preferences.', status: FeatureStatus.ENABLED, icon: 'fa-house-circle-check' },
  { id: 'ln_followup', category: 'Lead Nurturing', name: 'Automated Follow-ups', description: 'Sequenced messages for inactive leads.', status: FeatureStatus.DISABLED, icon: 'fa-paper-plane' },
  { id: 'ai_replies', category: 'AI Intelligence', name: 'Agent Reply Suggestions', description: 'Generate suggested replies for human agents.', status: FeatureStatus.ENABLED, icon: 'fa-robot' },
  { id: 'tc_rera', category: 'Trust & Compliance', name: 'RERA Compliance Check', description: 'Ensure messaging rules follow RERA guidelines.', status: FeatureStatus.ENABLED, icon: 'fa-scale-balanced' }
];

export const DUMMY_LEADS = [
  { id: '1', name: 'Amit Shah', phone: '+91 98XXX XXX01', type: 'Buyer', budget: '₹1.5 Cr', location: 'Ahmedabad', status: 'New', lastActive: '2 mins ago', score: 85, leadSource: 'WhatsApp Direct' },
  { id: '2', name: 'Priya Patel', phone: '+91 98XXX XXX02', type: 'Tenant', budget: '₹45k', location: 'Surat', status: 'Contacted', lastActive: '1 hour ago', score: 40, leadSource: 'Facebook Ad' },
  { id: '3', name: 'Rajesh Kumar', phone: '+91 98XXX XXX03', type: 'Seller', budget: '₹3.2 Cr', location: 'Mumbai', status: 'Visit Done', lastActive: '1 day ago', score: 92, leadSource: 'Property Portal' },
];
