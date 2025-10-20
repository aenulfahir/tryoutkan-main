import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Verify JWT token with Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Invalid token or user not found')
    }

    // Parse request body
    const { amount } = await req.json()

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    console.log(`Processing top-up for user ${user.id}, amount: ${amount}`)

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured')
    }

    // Forward request to n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount,
        user_id: user.id,
        email: user.email,
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('n8n webhook error:', errorText)
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`)
    }

    // Parse n8n response
    const n8nData = await n8nResponse.json()

    console.log('n8n response:', n8nData)

    // Return response to frontend
    return new Response(
      JSON.stringify(n8nData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

