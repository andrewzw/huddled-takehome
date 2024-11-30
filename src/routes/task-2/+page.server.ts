import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  const engagementQuery = `
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

  // New query for event type statistics
  const eventBarStatsQuery = `
SELECT 
  event_type,
  COUNT(*) as total_occurrences,
  CASE 
    WHEN event_type = 'like_track' THEN 2
    WHEN event_type = 'add_track_to_playlist' THEN 2
    WHEN event_type = 'play_track' THEN 1
    WHEN event_type = 'share_track' THEN 3
    ELSE 0 
  END as points_per_event,
  COUNT(*) * CASE 
    WHEN event_type = 'like_track' THEN 2
    WHEN event_type = 'add_track_to_playlist' THEN 2
    WHEN event_type = 'play_track' THEN 1
    WHEN event_type = 'share_track' THEN 3
    ELSE 0
  END as total_score
FROM user_events
WHERE event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
GROUP BY event_type
ORDER BY total_score DESC;
  `;

  const eventLineStatsQuery1 = `
  WITH weighted_events AS (
  SELECT 
    ue.event_type,
    strftime('%H', datetime(ue.created_at/1000, 'unixepoch')) as hour,
    CASE 
      WHEN ue.event_type = 'like_track' THEN 2
      WHEN ue.event_type = 'add_track_to_playlist' THEN 2
      WHEN ue.event_type = 'play_track' THEN 1
      WHEN ue.event_type = 'share_track' THEN 3
      ELSE 0 
    END as engagement_score
  FROM user_events ue
  WHERE ue.event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
)
SELECT 
  event_type,
  hour,
  SUM(engagement_score) as total_engagement
FROM weighted_events
GROUP BY event_type, hour
ORDER BY event_type, hour;
`;

  const eventLineStatsQuery = `
WITH weighted_events AS (
  SELECT 
    ue.event_type,
    strftime('%w', datetime(ue.created_at/1000, 'unixepoch')) as day_of_week,
    strftime('%H', datetime(ue.created_at/1000, 'unixepoch')) as hour,
    strftime('%m', datetime(ue.created_at/1000, 'unixepoch')) as month,
    CASE 
      WHEN ue.event_type = 'like_track' THEN 2
      WHEN ue.event_type = 'add_track_to_playlist' THEN 2
      WHEN ue.event_type = 'play_track' THEN 1
      WHEN ue.event_type = 'share_track' THEN 3
      ELSE 0 
    END as engagement_score
  FROM user_events ue
  WHERE ue.event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
)
SELECT 
  event_type,
  day_of_week,
  hour,
  month,
  SUM(engagement_score) as total_engagement
FROM weighted_events
GROUP BY event_type, day_of_week, hour, month
ORDER BY event_type, month, day_of_week, hour;
`;
  const engagementStats = await db.prepare(engagementQuery).all();
  const eventBarStats = await db.prepare(eventBarStatsQuery).all();
  const eventLineStats = await db.prepare(eventLineStatsQuery).all();

  return {
    engagementStats,
    eventBarStats,
    eventLineStats,
  };
};
