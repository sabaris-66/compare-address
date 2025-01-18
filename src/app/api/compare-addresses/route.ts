// src/app/api/compare-addresses/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RateLimiter } from '../../../utils/rateLimiter';
import { normalizeAddress } from '../../../utils/addressNormalizer';
import { 
  compareStreetNames, 
  comparePostalCodes, 
  compareCities 
} from '../../../utils/addressComparison';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize rate limiter (100 requests per hour)
const rateLimiter = new RateLimiter(100, 3600);

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.tryRequest(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { address1, address2 } = await req.json();

    // Input validation
    if (!address1 || !address2) {
      return NextResponse.json(
        { error: 'Both addresses are required' },
        { status: 400 }
      );
    }

    // Normalize addresses
    const normalizedAddr1 = normalizeAddress(address1);
    const normalizedAddr2 = normalizeAddress(address2);

    // Create comparison metrics
    const comparisonMetrics = {
      streetMatch: compareStreetNames(normalizedAddr1, normalizedAddr2),
      postalMatch: comparePostalCodes(normalizedAddr1, normalizedAddr2),
      cityMatch: compareCities(normalizedAddr1, normalizedAddr2)
    };

    // Create the prompt for Gemini
    const prompt = `Compare these two addresses and determine if they refer to the same location. 
    
    Normalized Address 1: ${normalizedAddr1}
    Normalized Address 2: ${normalizedAddr2}
    
    Additional comparison metrics:
    ${JSON.stringify(comparisonMetrics, null, 2)}
    
    Provide your response in the following JSON format only:
    {
      "match": boolean,
      "confidence": number between 0 and 1,
      "reasoning": "brief explanation",
      "metrics": ${JSON.stringify(comparisonMetrics)}
    }`;

    // Get Gemini's response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Parse and validate response
    const parsedResponse = JSON.parse(response.text());
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Address comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare addresses' },
      { status: 500 }
    );
  }
}