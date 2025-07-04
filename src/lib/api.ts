import { ApiResponse } from '@/types';

const BASE_API_URL = 'https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatNetPhase3ProjectReport';

export async function fetchData(circle: string, activity: 'dtp' | 'survey'): Promise<ApiResponse> {
  try {
    const endpoint = activity === 'dtp' ? `${circle}Dtp` : `${circle}Survey`;
    const response = await fetch(`${BASE_API_URL}/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return {
      [endpoint]: data[endpoint] || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}