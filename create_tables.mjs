import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
});

const sql = [
  `CREATE TABLE IF NOT EXISTS emailEventTracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailHistoryId INT NOT NULL,
  emailDeliveryTrackingId INT,
  eventType ENUM('open', 'click', 'bounce', 'complaint', 'delivery', 'deferred', 'dropped', 'processed', 'sent') NOT NULL,
  recipientEmail VARCHAR(320) NOT NULL,
  userAgent TEXT,
  ipAddress VARCHAR(45),
  linkUrl TEXT,
  linkText VARCHAR(255),
  bounceType ENUM('permanent', 'temporary', 'undetermined'),
  bounceSubType VARCHAR(50),
  complaintType VARCHAR(50),
  complaintFeedbackType VARCHAR(50),
  rawEventData JSON,
  eventTimestamp TIMESTAMP NOT NULL,
  receivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX emailHistoryIdIdx (emailHistoryId),
  INDEX emailDeliveryTrackingIdIdx (emailDeliveryTrackingId),
  INDEX eventTypeIdx (eventType),
  INDEX recipientEmailIdx (recipientEmail),
  INDEX eventTimestampIdx (eventTimestamp),
  INDEX createdAtIdx (createdAt)
)`,
  `CREATE TABLE IF NOT EXISTS emailEngagementMetrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailHistoryId INT NOT NULL UNIQUE,
  emailDeliveryTrackingId INT,
  openCount INT DEFAULT 0 NOT NULL,
  clickCount INT DEFAULT 0 NOT NULL,
  uniqueOpenCount INT DEFAULT 0 NOT NULL,
  uniqueClickCount INT DEFAULT 0 NOT NULL,
  openRate DECIMAL(5, 2) DEFAULT 0,
  clickRate DECIMAL(5, 2) DEFAULT 0,
  clickThroughRate DECIMAL(5, 2) DEFAULT 0,
  bounceCount INT DEFAULT 0 NOT NULL,
  complaintCount INT DEFAULT 0 NOT NULL,
  firstOpenedAt TIMESTAMP,
  lastOpenedAt TIMESTAMP,
  firstClickedAt TIMESTAMP,
  lastClickedAt TIMESTAMP,
  engagementScore DECIMAL(5, 2) DEFAULT 0,
  linksClicked JSON,
  lastUpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX emailHistoryIdIdx (emailHistoryId),
  INDEX emailDeliveryTrackingIdIdx (emailDeliveryTrackingId),
  INDEX engagementScoreIdx (engagementScore),
  INDEX lastUpdatedAtIdx (lastUpdatedAt)
)`,
  `CREATE TABLE IF NOT EXISTS emailEngagementTrends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scheduleId VARCHAR(32),
  periodDate DATE NOT NULL,
  periodType ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily' NOT NULL,
  totalEmailsSent INT DEFAULT 0 NOT NULL,
  totalOpens INT DEFAULT 0 NOT NULL,
  totalClicks INT DEFAULT 0 NOT NULL,
  totalBounces INT DEFAULT 0 NOT NULL,
  totalComplaints INT DEFAULT 0 NOT NULL,
  averageOpenRate DECIMAL(5, 2) DEFAULT 0,
  averageClickRate DECIMAL(5, 2) DEFAULT 0,
  averageBounceRate DECIMAL(5, 2) DEFAULT 0,
  averageEngagementScore DECIMAL(5, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX scheduleIdIdx (scheduleId),
  INDEX periodDateIdx (periodDate),
  INDEX periodTypeIdx (periodType)
)`
];

try {
  for (const stmt of sql) {
    console.log('Executing:', stmt.substring(0, 50) + '...');
    await connection.execute(stmt);
  }
  console.log('✅ All tables created successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}
