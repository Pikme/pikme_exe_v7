import { eq } from "drizzle-orm";
import { activities, locations, states, countries } from "../drizzle/schema";
import { getDb } from "./db";

export async function getActivityByIdWithLocation(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    activity: activities,
    location: locations,
    state: states,
    country: countries,
  })
    .from(activities)
    .leftJoin(locations, eq(activities.locationId, locations.id))
    .leftJoin(states, eq(locations.stateId, states.id))
    .leftJoin(countries, eq(states.countryId, countries.id))
    .where(eq(activities.id, id))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    ...row.activity,
    location: row.location ? {
      ...row.location,
      state: row.state ? {
        ...row.state,
        country: row.country || undefined,
      } : undefined,
    } : undefined,
  };
}
