import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en' } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Sending request to OpenAI with message:', message);

    const systemPrompt = language === 'hi' 
      ? 'आप एक सहायक हैं जो भारत में महिलाओं और बच्चों के लिए प्रजनन स्वास्थ्य शिक्षा और मार्गदर्शन पर ध्यान केंद्रित करते हैं। सटीक, सांस्कृतिक रूप से संवेदनशील जानकारी प्रदान करें और पेशेवर चिकित्सा परामर्श की सिफारिश करने के समय को ध्यान में रखें। हमेशा स्पष्ट करें कि आप केवल सूचनात्मक मार्गदर्शन प्रदान करते हैं, चिकित्सा सलाह नहीं।'
      : 'You are a helpful assistant focused on reproductive health education and guidance for women and children in India. Provide accurate, culturally sensitive information while being mindful of when to recommend professional medical consultation. Always clarify that you provide informational guidance only and not medical advice.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});