import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Define path to temporary sync file in the project root
const SYNC_FILE_PATH = path.join(process.cwd(), 'sync-state.json');

// Memory fallback just in case file system has issues
let memoryState: any = null;

export async function GET() {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const data = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    
    // If file doesn't exist but we have memory state
    if (memoryState) {
      return NextResponse.json(memoryState);
    }
    
    // Return empty if no state exists yet
    return NextResponse.json({ success: true, message: "No state initialized yet" });
  } catch (error) {
    console.error("Error reading sync state:", error);
    return NextResponse.json({ error: "Failed to read state" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate we actually received state
    if (!data || !data.tokens) {
      return NextResponse.json({ error: "Invalid state payload" }, { status: 400 });
    }

    // Save to memory
    memoryState = data;
    
    // Save to file system for cross-process persistence (Next.js hot reloads)
    fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    console.error("Error writing sync state:", error);
    return NextResponse.json({ error: "Failed to save state" }, { status: 500 });
  }
}
