import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a server-side Supabase client
// For a hackathon, we use the public anon key. If RLS blocks this, you would use the SERVICE_ROLE key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Twilio sends data as URL Encoded form data
    const text = await request.text();
    const params = new URLSearchParams(text);
    
    const body = params.get('Body')?.trim().toUpperCase() || '';
    const from = params.get('From') || '';

    console.log(`Received WhatsApp from ${from}: ${body}`);

    let replyText = "Invalid format. Please reply with 'BOOK <CROP> <QTY>' (e.g., BOOK WHEAT 50).";

    // Simple NLP Parsing
    const parts = body.split(" ");
    if (parts[0] === "BOOK" && parts.length >= 3) {
      const crop = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
      const qty = parseFloat(parts[2]);

      const validCrops = ["Paddy", "Wheat", "Maize", "Chana", "Mustard", "Cotton", "Potato", "Onion"];
      
      if (!validCrops.includes(crop)) {
        replyText = `We do not procure ${crop}. Valid crops: ${validCrops.join(", ")}.`;
      } else if (isNaN(qty) || qty <= 0) {
        replyText = "Please provide a valid quantity in quintals. Example: BOOK WHEAT 50";
      } else {
        
        // 1. Find a farmer (For hackathon demo, we just pick the first one, or use a dummy)
        const { data: farmers } = await supabase.from('farmers').select('id').limit(1);
        const farmerId = farmers && farmers.length > 0 ? farmers[0].id : `f${Date.now()}`;

        // 2. Create Booking
        const bookingId = `b${Date.now()}`;
        await supabase.from('bookings').insert([{
          id: bookingId,
          farmerId: farmerId,
          centreId: 'c1', // Hardcode to Centre A for demo
          crop: crop,
          date: '2026-09-10',
          timeSlot: '10:00 AM – 11:00 AM',
          estimatedQuantity: qty
        }]);

        // 3. Generate Token
        const tokenId = `t${Date.now()}`;
        const tokenNumber = `${crop.substring(0,3).toUpperCase()}-C01-${Math.floor(Math.random() * 1000)}`;
        await supabase.from('tokens').insert([{
          id: tokenId,
          bookingId: bookingId,
          number: tokenNumber,
          status: 'BOOKED',
          quality: null,
          weighment: null,
          payment: null,
          logistics: null
        }]);

        replyText = `SUCCESS! Slot booked for ${crop} (${qty}q) at Mandi Centre A on Sep 10, 10:00 AM. Your Token ID is: ${tokenNumber}. Show this message at the gate.`;
      }
    }

    // Twilio expects an XML (TwiML) response to send the message back to WhatsApp
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyText}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>System error processing booking. Please try again later.</Message>
</Response>`;
    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
