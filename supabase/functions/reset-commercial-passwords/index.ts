import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, prenom, nom, role')
      .eq('role', 'commercial');

    if (profilesError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch commercials',
          details: profilesError
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const results = [];

    for (const profile of profiles) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        {
          password: profile.prenom,
          email_confirm: true
        }
      );

      if (authError) {
        results.push({
          email: profile.email,
          prenom: profile.prenom,
          success: false,
          error: authError.message
        });
      } else {
        results.push({
          email: profile.email,
          prenom: profile.prenom,
          success: true,
          message: `Password set to: ${profile.prenom}`
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset completed',
        results
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});