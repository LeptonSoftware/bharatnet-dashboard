import { SurveyData, SummaryStats, SurveyDistrictSummary } from '@/types';

export function calculateSurveySummaryStats(data: SurveyData[], type: 'feasibility' | 'hoto'): SummaryStats {
  const stats: SummaryStats = {
    total: data.length,
    completed: 0,
    ongoing: 0,
    pending: 0,
    totalExistingKm: 0,
    totalPlannedKm: 0,
    completedKm: 0,
    pendingKm: 0
  };

  data.forEach(item => {
    const status = type === 'feasibility' 
      ? item.feasibilityStatus?.toLowerCase() 
      : item.hotoSurveyStatus?.toLowerCase();

    if (status?.includes('done')) {
      stats.completed++;
    } else if (status?.includes('wip') || status?.includes('progress')) {
      stats.ongoing++;
    } else {
      stats.pending++;
    }

    // Calculate kilometers
    if (type === 'feasibility') {
      stats.totalPlannedKm += item.newOfc || 0;
      stats.completedKm += item.feasibilityOfcDone || 0;
      stats.pendingKm += item.feasibilityOfcPending || 0;
    } else {
      stats.totalExistingKm += item.existingOfc || 0;
      stats.completedKm += item.hotoOfcDone || 0;
      stats.pendingKm += item.hotoOfcPending || 0;
    }
  });

  return stats;
}

export function getSurveyDistrictSummaries(data: SurveyData[], type: 'feasibility' | 'hoto'): SurveyDistrictSummary[] {
  const districts = new Map<string, SurveyDistrictSummary>();

  data.forEach(item => {
    const districtName = item.district.toLowerCase().trim();
    
    if (!districts.has(districtName)) {
      const displayName = districtName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      districts.set(districtName, {
        name: displayName,
        total: 0,
        completed: 0,
        ongoing: 0,
        pending: 0,
        totalKm: 0,
        completedKm: 0,
        pendingKm: 0
      });
    }

    const district = districts.get(districtName)!;
    district.total++;

    const status = type === 'feasibility' 
      ? item.feasibilityStatus?.toLowerCase() 
      : item.hotoSurveyStatus?.toLowerCase();

    if (status?.includes('done')) {
      district.completed++;
    } else if (status?.includes('wip') || status?.includes('progress')) {
      district.ongoing++;
    } else {
      district.pending++;
    }

    if (type === 'feasibility') {
      district.totalKm += item.newOfc || 0;
      district.completedKm += item.feasibilityOfcDone || 0;
      district.pendingKm += item.feasibilityOfcPending || 0;
    } else {
      district.totalKm += item.existingOfc || 0;
      district.completedKm += item.hotoOfcDone || 0;
      district.pendingKm += item.hotoOfcPending || 0;
    }
  });

  return Array.from(districts.values())
    .sort((a, b) => b.completed - a.completed);
}

export function getSurveyProgressData(data: SurveyData[], type: 'feasibility' | 'hoto') {
  const stats = calculateSurveySummaryStats(data, type);
  const completionPercentage = (stats.completed / stats.total) * 100;
  
  // Calculate completion rate (blocks per month)
  const dates = data
    .filter(item => {
      const endDate = type === 'feasibility' ? item.feasibilityEndDate : item.hotoEndDate;
      const status = type === 'feasibility' ? item.feasibilityStatus : item.hotoSurveyStatus;
      return endDate && status?.toLowerCase().includes('done');
    })
    .map(item => new Date(type === 'feasibility' ? item.feasibilityEndDate : item.hotoEndDate))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const startDate = dates[0] || new Date();
  const now = new Date();
  const monthsSinceStart = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const completionRate = stats.completed / monthsSinceStart;
  
  const remainingBlocks = stats.total - stats.completed;
  const monthsToComplete = remainingBlocks / (completionRate || 1);
  
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + monthsToComplete);
  
  return {
    completionPercentage,
    estimatedCompletionDate,
    completedBlocks: stats.completed,
    totalBlocks: stats.total,
    completionRate
  };
}

export function getSurveyStatusDistribution(data: SurveyData[], type: 'feasibility' | 'hoto') {
  const distribution = {
    completed: 0,
    ongoing: 0,
    pending: 0
  };

  data.forEach(item => {
    const status = type === 'feasibility' 
      ? item.feasibilityStatus?.toLowerCase() 
      : item.hotoSurveyStatus?.toLowerCase();

    if (status?.includes('done')) {
      distribution.completed++;
    } else if (status?.includes('wip') || status?.includes('progress')) {
      distribution.ongoing++;
    } else {
      distribution.pending++;
    }
  });

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution)
  };
}