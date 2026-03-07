-- Seed Data
-- Fantasy Baseball App (Diamond)
-- Inserts a minimal set of real MLB players for development and testing.
-- Run AFTER migrations have been applied.
-- The backend service role is assumed; these inserts bypass RLS.

-- ---------------------------------------------------------------------------
-- Sample MLB Players (2026 season data)
-- ---------------------------------------------------------------------------
INSERT INTO public.players (
    mlb_id,
    full_name,
    team,
    position,
    eligible_positions,
    status,
    headshot_url,
    bats,
    throws,
    updated_at
)
VALUES
    (
        592450,
        'Aaron Judge',
        'New York Yankees',
        'RF',
        ARRAY['RF', 'OF'],
        'active',
        'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/592450/headshot/67/current',
        'R',
        'R',
        now()
    ),
    (
        660271,
        'Shohei Ohtani',
        'Los Angeles Dodgers',
        'DH',
        ARRAY['SP', 'DH', 'UTIL'],
        'active',
        'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/660271/headshot/67/current',
        'L',
        'R',
        now()
    ),
    (
        518692,
        'Freddie Freeman',
        'Los Angeles Dodgers',
        '1B',
        ARRAY['1B'],
        'active',
        'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/518692/headshot/67/current',
        'L',
        'R',
        now()
    ),
    (
        605141,
        'Mookie Betts',
        'Los Angeles Dodgers',
        'SS',
        ARRAY['SS', '2B', 'OF'],
        'active',
        'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/605141/headshot/67/current',
        'R',
        'R',
        now()
    ),
    (
        682998,
        'Corbin Carroll',
        'Arizona Diamondbacks',
        'CF',
        ARRAY['CF', 'LF', 'OF'],
        'active',
        'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/682998/headshot/67/current',
        'L',
        'L',
        now()
    )
ON CONFLICT (mlb_id) DO UPDATE SET
    full_name          = EXCLUDED.full_name,
    team               = EXCLUDED.team,
    position           = EXCLUDED.position,
    eligible_positions = EXCLUDED.eligible_positions,
    status             = EXCLUDED.status,
    headshot_url       = EXCLUDED.headshot_url,
    bats               = EXCLUDED.bats,
    throws             = EXCLUDED.throws,
    updated_at         = now();
