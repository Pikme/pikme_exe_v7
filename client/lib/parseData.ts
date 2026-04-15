// Helper function to safely parse JSON or return array
export const parseArrayField = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If JSON parse fails, return empty array
      return [];
    }
  }
  return [];
};
