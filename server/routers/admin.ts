import { router, adminProcedure } from "../_core/trpc";
import * as db from "../db";

export const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    try {
      // Use existing count functions from db.ts
      const tourCount = await db.getTourCount();
      const locationCount = await db.getLocationCount();
      const activityCount = await db.getActivityCount();
      const csvImportCount = await db.getImportCount();
      
      return {
        tourCount,
        locationCount,
        activityCount,
        csvImportCount,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        tourCount: 0,
        locationCount: 0,
        activityCount: 0,
        csvImportCount: 0,
      };
    }
  }),
});
