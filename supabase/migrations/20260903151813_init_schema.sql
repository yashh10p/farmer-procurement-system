-- Create Farmers Table
CREATE TABLE farmers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password TEXT,
    village TEXT NOT NULL,
    "landRegistered" BOOLEAN NOT NULL DEFAULT false,
    "eligibleQuantity" FLOAT NOT NULL DEFAULT 0
);

-- Create Centres Table
CREATE TABLE centres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    distance TEXT NOT NULL,
    "baseProcessingSpeed" FLOAT NOT NULL,
    counters JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Create Bookings Table
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    "farmerId" TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    "centreId" TEXT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    crop TEXT NOT NULL,
    date TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "estimatedQuantity" FLOAT NOT NULL
);

-- Create Tokens Table
CREATE TABLE tokens (
    id TEXT PRIMARY KEY,
    "bookingId" TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    "checkInTime" TEXT,
    quality JSONB,
    weighment JSONB,
    payment JSONB,
    logistics JSONB
);

-- Create Queue Table
CREATE TABLE queue (
    "tokenId" TEXT PRIMARY KEY REFERENCES tokens(id) ON DELETE CASCADE,
    "farmerName" TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity FLOAT NOT NULL,
    "joinedAt" TEXT NOT NULL,
    "estimatedWaitTime" FLOAT NOT NULL,
    position INTEGER NOT NULL,
    status TEXT NOT NULL,
    "assignedCounterId" TEXT
);

-- Create Audit Logs Table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    action TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT NOT NULL
);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE farmers;
ALTER PUBLICATION supabase_realtime ADD TABLE centres;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE queue;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
