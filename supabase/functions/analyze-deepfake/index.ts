import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frames } = await req.json();
    
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(
        JSON.stringify({ error: "No frames provided" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${frames.length} frames for deepfake detection`);

    // Prepare messages with frames for analysis
    const content = [
      {
        type: "text",
        text: `You are an expert deepfake detection AI. Analyze these ${frames.length} video frames carefully for signs of manipulation or deepfake artifacts. Look for:

1. Facial inconsistencies (unnatural expressions, morphing, inconsistent lighting on face)
2. Temporal anomalies (sudden changes between frames, flickering artifacts)
3. Audio-visual sync issues (if detectable from frame sequences)
4. Compression artifacts that suggest manipulation
5. Unnatural skin texture, eye movements, or blinking patterns
6. Edge artifacts around faces or objects
7. Inconsistent lighting or shadows across frames
8. Warping or distortion around face boundaries

Provide a JSON response with:
{
  "isAuthentic": boolean (true if video appears genuine, false if deepfake detected),
  "confidence": number (0-100, how confident you are in your assessment),
  "issues": string[] (list of specific issues found, empty array if authentic),
  "details": string (brief explanation of your analysis)
}

Be thorough and accurate in your analysis.`
      },
      ...frames.map((frameData: string) => ({
        type: "image_url",
        image_url: {
          url: frameData
        }
      }))
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: content
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);

    // Parse the JSON response from AI
    let result;
    try {
      // Extract JSON from the response (it might have markdown formatting)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: try to determine from text
      const isAuthentic = aiResponse.toLowerCase().includes("authentic") || 
                         aiResponse.toLowerCase().includes("genuine") ||
                         !aiResponse.toLowerCase().includes("deepfake");
      
      result = {
        isAuthentic: isAuthentic,
        confidence: 70,
        issues: isAuthentic ? [] : ["Analysis completed but structured data unavailable"],
        details: aiResponse
      };
    }

    console.log("Final result:", result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in analyze-deepfake function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
