export const circleMap: Record<string, string> = {
  upe: "UP East",
  upw: "UP West",
  westBengal: "West Bengal",
  bihar: "Bihar",
  mp: "Madhya Pradesh",
  rajasthan: "Rajasthan",
  gujarat: "Gujarat",
  maharashtra: "Maharashtra",
  jharkhand: "Jharkhand",
  odisha: "Odisha",
  punjab: "Punjab",
};

export function getCircleName(circle: string): string {
  return circleMap[circle] || circle.toUpperCase();
}
