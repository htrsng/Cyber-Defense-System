// Khởi tạo database và collections với validation schema
db = db.getSiblingDB('cyberdefense');

// Collection: users
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email:     { bsonType: 'string' },
        password:  { bsonType: 'string' },
        role:      { enum: ['admin', 'viewer'] },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Collection: activity_logs
db.createCollection('activity_logs');

// Collection: security_events
db.createCollection('security_events');

// Indexes cho performance
db.activity_logs.createIndex({ createdAt: -1 });
db.activity_logs.createIndex({ ipAddress: 1, createdAt: -1 });
db.activity_logs.createIndex({ userId: 1, createdAt: -1 });
db.activity_logs.createIndex({ eventType: 1 });

db.security_events.createIndex({ createdAt: -1 });
db.security_events.createIndex({ ipAddress: 1 });
db.security_events.createIndex({ severity: 1 });
db.security_events.createIndex({ resolved: 1 });

db.users.createIndex({ email: 1 }, { unique: true });

print('✅ MongoDB initialized: collections + indexes created');
