import { BlockData, SummaryStats, DistrictSummary, ProjectProgress } from '@/types';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle different date formats
  const formats = [
    /(\d{2})-(\w{3,})-(\d{4})/, // 11-April-2025, 11-May-2025
    /(\d{2})-(\w{3,})-(\d{2})/, // 11-April-25, 11-May-25
    /(\d{2})-(\w{3,})/,         // 11-May, 11-April
    /(\d{2})-(\d{2})-(\d{4})/,  // 11-04-2025
    /(\d{2})-(\d{2})-(\d{2})/,  // 11-04-25
    /(\d{2})-(\d{2})/,          // 11-04
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [_, day, monthStr] = match;
      let year = match[3];
      
      // Convert month string to number (0-11)
      const month = isNaN(Number(monthStr)) 
        ? new Date(Date.parse(`${monthStr} 1, 2000`)).getMonth()
        : Number(monthStr) - 1;
      
      // Handle year formats
      if (!year) {
        // For DD-MM format, use current year
        year = new Date().getFullYear().toString();
      } else if (year.length === 2) {
        // For 2-digit years, assume 20XX
        year = '20' + year;
      }
      
      return new Date(Number(year), month, Number(day));
    }
  }
  return null;
}

function getWeeklyDelta(data: BlockData[], statusCheck: (item: BlockData) => boolean): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);
  
  const weekAgo = new Date(yesterday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  return data.filter(item => {
    const date = parseDate(item.dtpSubmissionDate) || parseDate(item.dtpApprovalDate);
    return date && date >= weekAgo && date <= yesterday && statusCheck(item);
  }).length;
}

export function calculateSummaryStats(data: BlockData[]): SummaryStats {
  const stats: SummaryStats = {
    total: data.length,
    approved: 0,
    submitted: 0,
    onHold: 0,
    pending: 0,
    totalExistingKm: 0,
    totalPlannedKm: 0,
    weeklyApproved: 0,
    weeklySubmitted: 0,
    weeklyOnHold: 0
  };

  data.forEach(item => {
    const status = item.dtpStatus?.toLowerCase() || '';
    
    if (status.includes('approved')) {
      stats.approved++;
    } else if (status.includes('submitted')) {
      stats.submitted++;
    } else if (status.includes('hold')) {
      stats.onHold++;
    } else {
      stats.pending++;
    }
  });

  // Calculate weekly deltas
  stats.weeklyApproved = getWeeklyDelta(data, item => 
    item.dtpStatus?.toLowerCase().includes('approved')
  );
  
  stats.weeklySubmitted = getWeeklyDelta(data, item => 
    item.dtpStatus?.toLowerCase().includes('submitted') || item.dtpStatus?.toLowerCase().includes('approved')
  );
  
  stats.weeklyOnHold = getWeeklyDelta(data, item => 
    item.dtpStatus?.toLowerCase().includes('hold')
  );

  return stats;
}

export function getDistrictSummaries(data: BlockData[]): DistrictSummary[] {
  const districts = new Map<string, DistrictSummary>();

  data.forEach(item => {
    const districtName = (item.nameOfDistrict || '').toLowerCase().trim();
    
    if (!districtName) return;
    
    if (!districts.has(districtName)) {
      const displayName = districtName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      districts.set(districtName, {
        name: displayName,
        total: 0,
        approved: 0,
        submitted: 0,
        onHold: 0,
        pending: 0,
        existingKm: 0,
        plannedKm: 0
      });
    }

    const district = districts.get(districtName)!;
    district.total++;

    const status = item.dtpStatus?.toLowerCase() || '';
    
    if (status.includes('approved')) {
      district.approved++;
    } else if (status.includes('submitted')) {
      district.submitted++;
    } else if (status.includes('hold')) {
      district.onHold++;
    } else {
      district.pending++;
    }

    // Update kilometer calculations using existingOfc and proposedOfc
    district.existingKm += item.existingOfc || 0;
    district.plannedKm += item.proposedOfc || 0;
  });

  return Array.from(districts.values())
    .sort((a, b) => b.total - a.total);
}

export function getApprovalTimeData(data: BlockData[]) {
  const monthCounts = new Map<string, number>();
  
  data.forEach(item => {
    if (item.dtpApprovalDate) {
      const date = parseDate(item.dtpApprovalDate);
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      }
    }
  });
  
  const sortedMonths = Array.from(monthCounts.keys()).sort();
  
  return {
    labels: sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }),
    data: sortedMonths.map(month => monthCounts.get(month) || 0)
  };
}

export function getDtpStatusDistribution(data: BlockData[]) {
  const distribution = {
    approved: 0,
    'pending approval': 0,
    'on hold': 0,
    pending: 0
  };

  data.forEach(item => {
    const status = item.dtpStatus?.toLowerCase() || '';
    
    if (status.includes('approved')) {
      distribution.approved++;
    } else if (status.includes('submitted')) {
      distribution['pending approval']++;
    } else if (status.includes('hold')) {
      distribution['on hold']++;
    } else {
      distribution.pending++;
    }
  });

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution)
  };
}

export function calculateProjectProgress(data: BlockData[]): ProjectProgress {
  const stats = calculateSummaryStats(data);
  const completionPercentage = (stats.approved / stats.total) * 100;
  
  // Find the earliest approval date
  const approvalDates = data
    .map(item => parseDate(item.dtpApprovalDate))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  
  const projectStartDate = approvalDates[0] || new Date();
  const now = new Date();
  const daysSinceStart = Math.max(1, (now.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const approvalRate = stats.approved / daysSinceStart; // approvals per day
  
  const remainingBlocks = stats.total - stats.approved;
  const daysToComplete = remainingBlocks / approvalRate;
  
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysToComplete);
  
  return {
    completionPercentage,
    estimatedCompletionDate,
    approvedBlocks: stats.approved,
    totalBlocks: stats.total,
    approvalRate: approvalRate * 30 // Convert to monthly rate
  };
}