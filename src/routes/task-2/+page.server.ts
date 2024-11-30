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

  const eventBarStatsQueryAvg = `
SELECT 
  event_type,
  a.name as artist_name,
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
FROM user_events ue
JOIN artists a ON ue.artist_id = a.id
WHERE event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
GROUP BY event_type, a.name
ORDER BY total_score DESC;
  `;

  const eventBarStatsQueryTotal = `
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
FROM user_events ue
WHERE event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
GROUP BY event_type
ORDER BY total_score DESC;
    `;

  const eventLineStatsQuery = `
  WITH weighted_events AS (
    SELECT 
      ue.event_type,
      ue.artist_id,
      a.name as artist_name,
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
    JOIN artists a ON ue.artist_id = a.id
    WHERE ue.event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
  )
  SELECT 
    event_type,
    artist_name,
    day_of_week,
    hour,
    month,
    SUM(engagement_score) as total_engagement
  FROM weighted_events
  GROUP BY event_type, artist_name, day_of_week, hour, month
  ORDER BY event_type, month, day_of_week, hour;
`;

  const engagementTimePeriodQuery = `
WITH time_periods AS (
  SELECT 
    event_type,
    CASE 
      WHEN CAST(strftime('%H', datetime(created_at/1000, 'unixepoch')) AS INTEGER) < 6 THEN '00:00-05:59'
      WHEN CAST(strftime('%H', datetime(created_at/1000, 'unixepoch')) AS INTEGER) < 12 THEN '06:00-11:59'
      WHEN CAST(strftime('%H', datetime(created_at/1000, 'unixepoch')) AS INTEGER) < 18 THEN '12:00-17:59'
      ELSE '18:00-23:59'
    END as time_period,
    CASE 
      WHEN event_type = 'like_track' THEN 2
      WHEN event_type = 'add_track_to_playlist' THEN 2
      WHEN event_type = 'play_track' THEN 1
      WHEN event_type = 'share_track' THEN 3
      ELSE 0 
    END as engagement_score
  FROM user_events
  WHERE event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
)
SELECT 
  time_period,
  SUM(CASE WHEN event_type = 'play_track' THEN engagement_score ELSE 0 END) as play_track_score,
  COUNT(CASE WHEN event_type = 'play_track' THEN 1 END) as play_track_count,
  SUM(CASE WHEN event_type = 'share_track' THEN engagement_score ELSE 0 END) as share_track_score,
  COUNT(CASE WHEN event_type = 'share_track' THEN 1 END) as share_track_count,
  SUM(CASE WHEN event_type = 'add_track_to_playlist' THEN engagement_score ELSE 0 END) as playlist_score,
  COUNT(CASE WHEN event_type = 'add_track_to_playlist' THEN 1 END) as playlist_count,
  SUM(CASE WHEN event_type = 'like_track' THEN engagement_score ELSE 0 END) as like_track_score,
  COUNT(CASE WHEN event_type = 'like_track' THEN 1 END) as like_track_count
FROM time_periods
GROUP BY time_period
ORDER BY time_period;
`;
  const artistRadarQuery = `
WITH event_metrics AS (
  SELECT 
    a.name as artist_name,
    COUNT(CASE WHEN ue.event_type = 'play_track' THEN 1 END) as play_count,
    COUNT(CASE WHEN ue.event_type = 'like_track' THEN 1 END) as like_count,
    COUNT(CASE WHEN ue.event_type = 'share_track' THEN 1 END) as share_count,
    COUNT(CASE WHEN ue.event_type = 'add_track_to_playlist' THEN 1 END) as playlist_count
  FROM user_events ue
  JOIN artists a ON ue.artist_id = a.id
  GROUP BY a.name
)
SELECT * FROM event_metrics;
`;

  const engagementStats = await db.prepare(engagementQuery).all();
  const eventBarStatsAvg = await db.prepare(eventBarStatsQueryAvg).all();
  const eventBarStatsTotal = await db.prepare(eventBarStatsQueryTotal).all();

  const eventLineStats = await db.prepare(eventLineStatsQuery).all();
  const engagementTimePeriodStats = await db
    .prepare(engagementTimePeriodQuery)
    .all();
  const artistRadarStats = await db.prepare(artistRadarQuery).all();

  return {
    engagementStats,
    engagementTimePeriodStats,
    eventBarStatsAvg,
    eventBarStatsTotal,
    eventLineStats,
    artistRadarStats,
  };
};
