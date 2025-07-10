import { EventLogData } from "@/hooks/use-events";

export type TrendDirection = "up" | "down" | "stable";

export interface TrendData {
  direction: TrendDirection;
  changeValue: number;
  changePercentage: number;
  previousValue: number;
  currentValue: number;
  hasData: boolean;
}

export type TimePeriod =
  | "today"
  | "current-week"
  | "last-week"
  | "current-month"
  | "last-month"
  | null;

/**
 * Parse timestamp in DD.MM.YY format to Date object
 */
export function parseTimestamp(timestamp: string): Date {
  const [day, month, year] = timestamp.split(".");
  const fullYear = parseInt(year, 10) + 2000; // Assuming 25 means 2025
  return new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
}

/**
 * Get period boundaries for a given time period
 */
export function getPeriodBoundaries(period: TimePeriod): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date;
  let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // End of today

  switch (period) {
    case "today":
      startDate = today;
      break;
    case "current-week":
      const dayOfWeek = now.getDay();
      startDate = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      break;
    case "last-week":
      const lastWeekEnd = new Date(
        today.getTime() - now.getDay() * 24 * 60 * 60 * 1000 - 1
      );
      startDate = new Date(lastWeekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
      endDate = lastWeekEnd;
      break;
    case "current-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last-month":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = lastMonthStart;
      endDate = lastMonthEnd;
      break;
    default:
      startDate = today;
  }

  return { startDate, endDate };
}

/**
 * Filter events by time period
 */
export function filterEventsByTimePeriod(
  events: EventLogData[],
  period: TimePeriod
): EventLogData[] {
  const { startDate, endDate } = getPeriodBoundaries(period);

  return events.filter((event) => {
    const eventDate = parseTimestamp(event.timestamp);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

/**
 * Calculate trend for a specific event/metric across circles
 */
export function calculateTrend(
  events: EventLogData[],
  eventType: string,
  circle?: string,
  periodStart?: Date,
  periodEnd?: Date
): TrendData {
  // Filter events by type and circle if specified
  let filteredEvents = events.filter((event) => event.event === eventType);
  if (circle) {
    filteredEvents = filteredEvents.filter((event) => event.circle === circle);
  }

  if (filteredEvents.length === 0) {
    return {
      direction: "stable",
      changeValue: 0,
      changePercentage: 0,
      previousValue: 0,
      currentValue: 0,
      hasData: true,
    };
  }

  // Sort by timestamp to get chronological order
  const sortedEvents = filteredEvents.sort((a, b) => {
    const dateA = parseTimestamp(a.timestamp);
    const dateB = parseTimestamp(b.timestamp);
    return dateA.getTime() - dateB.getTime();
  });

  // If we have period boundaries, calculate trend for the period
  if (periodStart && periodEnd) {
    // Find events within the period
    const eventsInPeriod = sortedEvents.filter((event) => {
      const eventDate = parseTimestamp(event.timestamp);
      return eventDate >= periodStart && eventDate <= periodEnd;
    });

    // If no events in the period, no trend to calculate
    if (eventsInPeriod.length === 0) {
      return {
        direction: "stable",
        changeValue: 0,
        changePercentage: 0,
        previousValue: 0,
        currentValue: 0,
        hasData: true,
      };
    }

    // Get the latest event in the period
    const latestEventInPeriod = eventsInPeriod[eventsInPeriod.length - 1];
    const currentValue = latestEventInPeriod.data;

    // Find the last event before the period starts
    const eventsBeforePeriod = sortedEvents.filter((event) => {
      const eventDate = parseTimestamp(event.timestamp);
      return eventDate < periodStart;
    });

    // If no events before the period, assume previous value was 0
    const previousValue =
      eventsBeforePeriod.length > 0
        ? eventsBeforePeriod[eventsBeforePeriod.length - 1].data
        : 0;

    const changeValue = currentValue - previousValue;
    const changePercentage =
      previousValue === 0 ? 0 : (changeValue / previousValue) * 100;

    let direction: TrendDirection = "stable";
    if (changeValue > 0) {
      direction = "up";
    } else if (changeValue < 0) {
      direction = "down";
    }

    return {
      direction,
      changeValue,
      changePercentage,
      previousValue,
      currentValue,
      hasData: true,
    };
  }

  // Legacy logic for backward compatibility (when no period boundaries provided)
  const latestEvent = sortedEvents[sortedEvents.length - 1];
  const currentValue = latestEvent.data;

  // If we only have one event, assume previous value was 0
  if (sortedEvents.length === 1) {
    return {
      direction: currentValue > 0 ? "up" : "stable",
      changeValue: currentValue,
      changePercentage: 0,
      previousValue: 0,
      currentValue,
      hasData: true,
    };
  }

  const previousEvent = sortedEvents[sortedEvents.length - 2];
  const previousValue = previousEvent.data;

  const changeValue = currentValue - previousValue;
  const changePercentage =
    previousValue === 0 ? 0 : (changeValue / previousValue) * 100;

  let direction: TrendDirection = "stable";
  if (changeValue > 0) {
    direction = "up";
  } else if (changeValue < 0) {
    direction = "down";
  }

  return {
    direction,
    changeValue,
    changePercentage,
    previousValue,
    currentValue,
    hasData: true,
  };
}

/**
 * Calculate aggregate trend across all circles for a specific event
 */
export function calculateAggregateTrend(
  events: EventLogData[],
  eventType: string,
  circles: string[],
  periodStart?: Date,
  periodEnd?: Date
): TrendData {
  const circleTrends = circles.map((circle) =>
    calculateTrend(events, eventType, circle, periodStart, periodEnd)
  );

  const validTrends = circleTrends.filter((trend) => trend.hasData);

  if (validTrends.length === 0) {
    return {
      direction: "stable",
      changeValue: 0,
      changePercentage: 0,
      previousValue: 0,
      currentValue: 0,
      hasData: false,
    };
  }

  const totalCurrentValue = validTrends.reduce(
    (sum, trend) => sum + trend.currentValue,
    0
  );
  const totalPreviousValue = validTrends.reduce(
    (sum, trend) => sum + trend.previousValue,
    0
  );
  const totalChangeValue = totalCurrentValue - totalPreviousValue;
  const totalChangePercentage =
    totalPreviousValue === 0
      ? 0
      : (totalChangeValue / totalPreviousValue) * 100;

  let direction: TrendDirection = "stable";
  if (totalChangeValue > 0) {
    direction = "up";
  } else if (totalChangeValue < 0) {
    direction = "down";
  }

  return {
    direction,
    changeValue: totalChangeValue,
    changePercentage: totalChangePercentage,
    previousValue: totalPreviousValue,
    currentValue: totalCurrentValue,
    hasData: true,
  };
}

/**
 * Get trend icon based on direction
 */
export function getTrendIcon(direction: TrendDirection): string {
  switch (direction) {
    case "up":
      return "tabler:trending-up";
    case "down":
      return "tabler:trending-down";
    case "stable":
      return "tabler:minus";
    default:
      return "tabler:minus";
  }
}

/**
 * Get trend color based on direction
 */
export function getTrendColor(direction: TrendDirection): string {
  switch (direction) {
    case "up":
      return "text-green-600";
    case "down":
      return "text-red-600";
    case "stable":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
}

// Get the previous period boundaries for comparison
export function getPreviousPeriodBoundaries(
  timePeriod: TimePeriod
): { startDate: Date; endDate: Date } | null {
  if (!timePeriod) return null;

  const now = new Date();

  if (timePeriod === "current-week") {
    // Previous week: 7 days before the start of current week
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const endOfPreviousWeek = new Date(startOfCurrentWeek);
    endOfPreviousWeek.setMilliseconds(-1); // End of previous week

    return {
      startDate: startOfPreviousWeek,
      endDate: endOfPreviousWeek,
    };
  }

  if (timePeriod === "current-month") {
    // Previous month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(startOfCurrentMonth);
    endOfPreviousMonth.setMilliseconds(-1);

    return {
      startDate: startOfPreviousMonth,
      endDate: endOfPreviousMonth,
    };
  }

  return null;
}

// Calculate daily rate for a period
function calculateDailyRate(
  eventsData: EventLogData[],
  eventType: string,
  circle: string,
  startDate: Date,
  endDate: Date
): number {
  const trend = calculateTrend(
    eventsData,
    eventType,
    circle,
    startDate,
    endDate
  );

  // Filter events for this period and circle/eventType
  const relevantEvents = eventsData.filter((event) => {
    const eventDate = parseTimestamp(event.timestamp);
    const matchesCircle = !circle || event.circle === circle;
    const matchesType = event.event === eventType;
    const inPeriod = eventDate >= startDate && eventDate <= endDate;

    return matchesCircle && matchesType && inPeriod;
  });

  // Find the date of the last event, or use start date if no events
  let effectiveEndDate = startDate;
  if (relevantEvents.length > 0) {
    const lastEventDate = relevantEvents.reduce((latest, event) => {
      const eventDate = parseTimestamp(event.timestamp);
      return eventDate > latest ? eventDate : latest;
    }, parseTimestamp(relevantEvents[0].timestamp));
    effectiveEndDate = lastEventDate;
  }

  const periodDays = Math.max(
    1,
    Math.ceil(
      (effectiveEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return trend.changeValue / periodDays;
}

// Calculate comparative trend between current and previous period
export function calculateComparativeTrend(
  eventsData: EventLogData[],
  eventType: string,
  circle: string,
  currentPeriod: TimePeriod
): {
  direction: "up" | "down" | "stable";
  hasData: boolean;
  changePercentage: number;
  changeValue: number;
  currentDailyRate: number;
  previousDailyRate: number;
  currentTotal: number;
  previousTotal: number;
} {
  if (
    !currentPeriod ||
    !["current-week", "current-month"].includes(currentPeriod)
  ) {
    return {
      direction: "stable",
      hasData: false,
      changePercentage: 0,
      changeValue: 0,
      currentDailyRate: 0,
      previousDailyRate: 0,
      currentTotal: 0,
      previousTotal: 0,
    };
  }

  const currentBoundaries = getPeriodBoundaries(currentPeriod);
  const previousBoundaries = getPreviousPeriodBoundaries(currentPeriod);

  if (!currentBoundaries || !previousBoundaries) {
    return {
      direction: "stable",
      hasData: false,
      changePercentage: 0,
      changeValue: 0,
      currentDailyRate: 0,
      previousDailyRate: 0,
      currentTotal: 0,
      previousTotal: 0,
    };
  }

  const currentTrend = calculateTrend(
    eventsData,
    eventType,
    circle,
    currentBoundaries.startDate,
    currentBoundaries.endDate
  );

  const previousTrend = calculateTrend(
    eventsData,
    eventType,
    circle,
    previousBoundaries.startDate,
    previousBoundaries.endDate
  );

  const currentDailyRate = calculateDailyRate(
    eventsData,
    eventType,
    circle,
    currentBoundaries.startDate,
    currentBoundaries.endDate
  );

  const previousDailyRate = calculateDailyRate(
    eventsData,
    eventType,
    circle,
    previousBoundaries.startDate,
    previousBoundaries.endDate
  );

  const changeValue = currentDailyRate - previousDailyRate;
  const changePercentage =
    previousDailyRate > 0 ? (changeValue / previousDailyRate) * 100 : 0;

  return {
    direction: changeValue > 0 ? "up" : changeValue < 0 ? "down" : "stable",
    hasData: true,
    changePercentage,
    changeValue,
    currentDailyRate,
    previousDailyRate,
    currentTotal: currentTrend.changeValue,
    previousTotal: previousTrend.changeValue,
  };
}

// Calculate aggregate comparative trend across multiple circles
export function calculateAggregateComparativeTrend(
  eventsData: EventLogData[],
  eventType: string,
  circles: string[],
  currentPeriod: TimePeriod
): {
  direction: "up" | "down" | "stable";
  hasData: boolean;
  changePercentage: number;
  changeValue: number;
  currentDailyRate: number;
  previousDailyRate: number;
  currentTotal: number;
  previousTotal: number;
} {
  const trends = circles.map((circle) =>
    calculateComparativeTrend(eventsData, eventType, circle, currentPeriod)
  );

  const validTrends = trends.filter((trend) => trend.hasData);

  if (validTrends.length === 0) {
    return {
      direction: "stable",
      hasData: false,
      changePercentage: 0,
      changeValue: 0,
      currentDailyRate: 0,
      previousDailyRate: 0,
      currentTotal: 0,
      previousTotal: 0,
    };
  }

  const totalCurrentDailyRate = validTrends.reduce(
    (sum, trend) => sum + trend.currentDailyRate,
    0
  );
  const totalPreviousDailyRate = validTrends.reduce(
    (sum, trend) => sum + trend.previousDailyRate,
    0
  );
  const totalCurrentTotal = validTrends.reduce(
    (sum, trend) => sum + trend.currentTotal,
    0
  );
  const totalPreviousTotal = validTrends.reduce(
    (sum, trend) => sum + trend.previousTotal,
    0
  );

  const changeValue = totalCurrentDailyRate - totalPreviousDailyRate;
  const changePercentage =
    totalPreviousDailyRate > 0
      ? (changeValue / totalPreviousDailyRate) * 100
      : 0;

  return {
    direction: changeValue > 0 ? "up" : changeValue < 0 ? "down" : "stable",
    hasData: true,
    changePercentage,
    changeValue,
    currentDailyRate: totalCurrentDailyRate,
    previousDailyRate: totalPreviousDailyRate,
    currentTotal: totalCurrentTotal,
    previousTotal: totalPreviousTotal,
  };
}
