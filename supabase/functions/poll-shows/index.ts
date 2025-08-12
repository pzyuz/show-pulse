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
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !tmdbApiKey) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get list of shows from database
    const { data: shows, error: showsError } = await supabase
      .from('shows')
      .select('id, tmdb_id, title')

    if (showsError) {
      throw new Error(`Error fetching shows: ${showsError.message}`)
    }

    console.log(`Found ${shows?.length || 0} shows to poll`)

    // Process each show
    for (const show of shows || []) {
      try {
        await processShow(show, supabase, tmdbApiKey)
      } catch (error) {
        console.error(`Error processing show ${show.title}:`, error)
        // Continue with next show instead of failing completely
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${shows?.length || 0} shows`,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processShow(show: any, supabase: any, tmdbApiKey: string) {
  console.log(`Processing show: ${show.title} (TMDB ID: ${show.tmdb_id})`)

  // Fetch current show details from TMDB
  const tmdbResponse = await fetch(
    `https://api.themoviedb.org/3/tv/${show.tmdb_id}?api_key=${tmdbApiKey}&language=en-US&append_to_response=networks`
  )

  if (!tmdbResponse.ok) {
    throw new Error(`TMDB API error: ${tmdbResponse.status}`)
  }

  const tmdbData = await tmdbResponse.json()

  // Create hash from current show data
  const currentHash = createShowHash(tmdbData)

  // Get the most recent snapshot for this show
  const { data: latestSnapshot } = await supabase
    .from('show_snapshots')
    .select('payload_hash')
    .eq('show_id', show.id)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  if (latestSnapshot && latestSnapshot.payload_hash === currentHash) {
    console.log(`No changes detected for ${show.title}`)
    return
  }

  // Changes detected - create new snapshot
  const { error: snapshotError } = await supabase
    .from('show_snapshots')
    .insert({
      show_id: show.id,
      payload_json: tmdbData,
      payload_hash: currentHash
    })

  if (snapshotError) {
    throw new Error(`Error creating snapshot: ${snapshotError.message}`)
  }

  // Log what would trigger notifications
  const changes = detectChanges(latestSnapshot?.payload_hash, currentHash, tmdbData)
  
  if (changes.length > 0) {
    console.log(`🔔 WOULD NOTIFY for ${show.title}:`, changes.join(', '))
    
    // TODO: Implement actual notification logic here
    // - Check user preferences for notification types
    // - Send push notifications
    // - Send email notifications
    // - Queue notifications for batch processing
  }

  // Update the shows table with latest data
  const { error: updateError } = await supabase
    .from('shows')
    .update({
      status: tmdbData.status || 'unknown',
      next_air_date: tmdbData.next_episode_to_air?.air_date || null,
      last_air_date: tmdbData.last_episode_to_air?.air_date || null,
      network: tmdbData.networks?.[0]?.name || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', show.id)

  if (updateError) {
    throw new Error(`Error updating show: ${updateError.message}`)
  }

  console.log(`Successfully updated ${show.title}`)
}

function createShowHash(tmdbData: any): string {
  // Create a hash from key show properties that would trigger notifications
  const keyData = {
    status: tmdbData.status,
    next_air_date: tmdbData.next_episode_to_air?.air_date,
    last_air_date: tmdbData.last_episode_to_air?.air_date,
    // Add more fields as needed for change detection
  }
  
  // Simple hash implementation - in production, use a proper hashing library
  return btoa(JSON.stringify(keyData)).slice(0, 64)
}

function detectChanges(oldHash: string | null, newHash: string, tmdbData: any): string[] {
  if (!oldHash) {
    return ['Show added to tracking']
  }

  const changes: string[] = []

  // TODO: Implement more sophisticated change detection
  // - Compare specific fields between old and new data
  // - Detect status changes (renewed, cancelled, ended)
  // - Detect air date changes
  // - Detect network changes

  // For now, just log that something changed
  changes.push('Show data updated')

  return changes
}

// TODO: Implement additional features:
// - Batch processing for large numbers of shows
// - Rate limiting for TMDB API calls
// - Error handling and retry logic
// - Notification queue management
// - Metrics and monitoring
// - Configuration for polling frequency
