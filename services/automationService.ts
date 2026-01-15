
export const syncLeadToGoogleSheets = async (leadData: any, endpointUrl: string) => {
  if (!endpointUrl) return { success: false, error: 'No endpoint configured' };

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      mode: 'no-cors', // Common for Google Apps Script Web Apps
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...leadData
      }),
    });
    
    console.log('Lead Synced to Google Sheets Bridge');
    return { success: true };
  } catch (error) {
    console.error('Automation Error:', error);
    return { success: false, error };
  }
};
