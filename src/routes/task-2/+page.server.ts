import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  const query = `
WITH weighted_events AS (
  SELECT 
    ue.artist_id,
    u.timezone,
    ue.created_at,
    CASE 
      WHEN ue.event_type = 'like_track' THEN 2
      WHEN ue.event_type = 'add_track_to_playlist' THEN 2
      WHEN ue.event_type = 'play_track' THEN 1
      WHEN ue.event_type = 'share_track' THEN 3
      ELSE 0 
    END as engagement_score
  FROM user_events ue
  JOIN users u ON ue.user_id = u.id
  WHERE ue.event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
)
SELECT 
  we.artist_id,
  a.name as artist_name,
  strftime('%H', datetime(we.created_at/1000, 'unixepoch')) as hour,
  SUM(we.engagement_score) as total_engagement
FROM weighted_events we
JOIN artists a ON we.artist_id = a.id
GROUP BY we.artist_id, hour
ORDER BY we.artist_id, hour;
  
  `;

  const data = await db.prepare(query).all();

  return {
    data,
  };
};

// WITH weighted_events AS (
//   SELECT
//     ue.artist_id,
//     u.timezone,
//     ue.created_at,
//     CASE
//       WHEN ue.event_type = 'like_track' THEN 2
//       WHEN ue.event_type = 'add_track_to_playlist' THEN 2
//       WHEN ue.event_type = 'play_track' THEN 1
//       WHEN ue.event_type = 'share_track' THEN 3
//       ELSE 0
//     END as engagement_score
//   FROM user_events ue
//   JOIN users u ON ue.user_id = u.id
//   WHERE ue.event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
// )
// SELECT
//   we.artist_id,
//   a.name as artist_name,
//   strftime('%H', datetime(we.created_at/1000, 'unixepoch')) as hour,
//   SUM(we.engagement_score) as total_engagement
// FROM weighted_events we
// JOIN artists a ON we.artist_id = a.id
// GROUP BY we.artist_id, hour
// ORDER BY we.artist_id, hour;
