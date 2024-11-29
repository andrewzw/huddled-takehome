import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  const query = `
    SELECT 
      a.id AS artist_id, 
      a.name AS artist_name, 
      SUM(v.end_time - v.start_time) AS total_visit_duration,
      COUNT(DISTINCT v.session_id) AS unique_session_count
    FROM 
      artists a
    JOIN 
      visits v ON a.id = v.artist_id 
    GROUP BY 
      a.id
    ORDER BY 
      total_visit_duration DESC
  
  `;

  // add unique_session_count to track unique sessions
  // Changed from v.id to v.artist_id to match schema (seed.ts)
  // Order by descending total_visit_duration

  const data = await db.prepare(query).all();

  return {
    data,
  };
};
