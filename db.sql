-- =========================================================
-- EXTENSIONS
-- =========================================================

create extension if not exists "pgcrypto";


-- =========================================================
-- ENUMS
-- =========================================================

create type game_request_status as enum (
    'pendiente',
    'aceptado',
    'rechazado',
    'expirado'
);

create type game_status as enum (
    'en espera',
    'activo',
    'finalizado',
    'cancelado'
);

create type question_category as enum (
    'lectura',
    'matematicas',
    'ingles',
    'cultura general'
);

-- =========================================================
-- PROFILES
-- =========================================================

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    username text not null unique,
    avatar_url text,

    xp integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- GAME REQUESTS
-- =========================================================

create table game_requests (
    id uuid primary key default gen_random_uuid(),

    sender_id uuid not null references profiles(id) on delete cascade,
    receiver_id uuid not null references profiles(id) on delete cascade,

    status game_request_status not null default 'pendiente',

    created_at timestamptz not null default now(),
    expires_at timestamptz,

    constraint different_players
        check (sender_id <> receiver_id)
);
-- =========================================================
-- GAMES
-- =========================================================

create table games (
    id uuid primary key default gen_random_uuid(),

    player_one_id uuid not null references profiles(id) on delete restrict,
    player_two_id uuid not null references profiles(id) on delete restrict,

    status game_status not null default 'en espera',

    current_turn_id uuid references profiles(id) on delete restrict,

    winner_id uuid references profiles(id) on delete restrict,

    current_game_question_id uuid,

    started_at timestamptz,
    finished_at timestamptz,

    created_at timestamptz not null default now(),

    constraint different_game_players
        check (player_one_id <> player_two_id)
);


-- =========================================================
-- QUESTIONS
-- =========================================================

create table questions (
    id uuid primary key default gen_random_uuid(),

    question text not null,

    category question_category not null,

    created_at timestamptz not null default now()
);


-- =========================================================
-- ANSWERS
-- =========================================================

create table answers (
    id uuid primary key default gen_random_uuid(),

    question_id uuid not null references questions(id) on delete cascade,

    answer text not null,

    is_correct boolean not null default false,

    created_at timestamptz not null default now()
);


-- =========================================================
-- QUESTIONS ASSIGNED TO A GAME
-- =========================================================

create table game_questions (
    id uuid primary key default gen_random_uuid(),

    game_id uuid not null references games(id) on delete cascade,

    question_id uuid not null references questions(id) on delete restrict,

    position integer not null,

    selected_by uuid references profiles(id) on delete restrict,

    answered_by uuid references profiles(id) on delete restrict,

    selected_at timestamptz,

    answered_at timestamptz,

    created_at timestamptz not null default now(),

    constraint unique_question_position
        unique (game_id, position),

    constraint valid_position
        check (position between 1 and 6)
);


-- =========================================================
-- PLAYER ANSWERS
-- =========================================================

create table game_answers (
    id uuid primary key default gen_random_uuid(),

    game_id uuid not null references games(id),

    game_question_id uuid not null references game_questions(id) on delete cascade,

    player_id uuid not null references profiles(id) on delete restrict,

    answer_id uuid references answers(id) on delete restrict,

    is_correct boolean not null,

    response_time_ms integer,

    answered_at timestamptz not null default now(),

    created_at timestamptz not null default now(),

    constraint valid_response_time
        check (
            response_time_ms is null
            or response_time_ms >= 0
        )
);


-- =========================================================
-- FOREIGN KEY: CURRENT GAME QUESTION
-- =========================================================

alter table games
add constraint games_current_question_fk
foreign key (current_game_question_id)
references game_questions(id)
on delete set null;


-- =========================================================
-- INDEXES
-- =========================================================

create index idx_game_requests_receiver
on game_requests(receiver_id, status);

create index idx_game_requests_sender
on game_requests(sender_id, status);

create index idx_games_player_one
on games(player_one_id);

create index idx_games_player_two
on games(player_two_id);

create index idx_games_status
on games(status);

create index idx_game_questions_game
on game_questions(game_id);

create index idx_game_questions_question
on game_questions(question_id);

create index idx_answers_question
on answers(question_id);

create index idx_game_answers_game
on game_answers(game_id);

create index idx_game_answers_question
on game_answers(game_question_id);

create index idx_game_answers_player
on game_answers(player_id);

-- =========================================================
-- ONLY ONE CORRECT ANSWER PER QUESTION
-- =========================================================

create unique index one_correct_answer_per_question
on answers(question_id)
where is_correct = true;


-- =========================================================
-- POLITICAS DE SUPABASE
-- =========================================================

alter table public.profiles enable row level security;

revoke update on table public.profiles from authenticated;
grant update (username, avatar_url, updated_at) on table public.profiles to authenticated;
revoke insert on table public.profiles from authenticated;
grant insert (id, username, avatar_url) on table public.profiles to authenticated;

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public avatar image reads" on storage.objects;
create policy "Public avatar image reads"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "Users upload their own avatars" on storage.objects;
create policy "Users upload their own avatars"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update their own avatars" on storage.objects;
create policy "Users update their own avatars"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete their own avatars" on storage.objects;
create policy "Users delete their own avatars"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Players can view their games"
on games
for select
to authenticated
using (
    auth.uid() = player_one_id
    or auth.uid() = player_two_id
);

create policy "Players can view cards in their games"
on game_questions
for select
to authenticated
using (
    exists (
        select 1
        from games
        where games.id = game_questions.game_id
          and auth.uid() in (games.player_one_id, games.player_two_id)
    )
);

create policy "Users can create game requests"
on game_requests
for insert
to authenticated
with check (
    auth.uid() = sender_id
);

create policy "Users can view their game requests"
on game_requests
for select
to authenticated
using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
);

create policy "Users can update their game requests"
on game_requests
for update
to authenticated
using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
)
with check (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
);


-- Habilita los eventos de solicitudes sin modificar la estructura de la tabla.
do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'game_requests'
    ) then
        alter publication supabase_realtime add table public.game_requests;
    end if;
end;
$$;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'games'
    ) then
        alter publication supabase_realtime add table public.games;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'game_questions'
    ) then
        alter publication supabase_realtime add table public.game_questions;
    end if;
end;
$$;

-- =========================================================
-- ATOMIC GAME REQUEST RESPONSES
-- =========================================================

create or replace function public.accept_game_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    request_row public.game_requests%rowtype;
    created_game_id uuid;
begin
    select *
    into request_row
    from public.game_requests
    where id = p_request_id
    for update;

    if not found then
        raise exception 'La solicitud no existe.';
    end if;

    if request_row.receiver_id is distinct from auth.uid() then
        raise exception 'No tienes permiso para responder esta solicitud.';
    end if;

    if request_row.status <> 'pendiente' then
        raise exception 'La solicitud ya fue respondida.';
    end if;

    if request_row.expires_at is not null and request_row.expires_at <= now() then
        raise exception 'Este desafío ha expirado.';
    end if;

    update public.game_requests
    set status = 'aceptado'
    where id = p_request_id;

    insert into public.games (player_one_id, player_two_id, status)
    values (request_row.sender_id, request_row.receiver_id, 'en espera')
    returning id into created_game_id;

    return created_game_id;
end;
$$;

create or replace function public.reject_game_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    request_row public.game_requests%rowtype;
begin
    select *
    into request_row
    from public.game_requests
    where id = p_request_id
    for update;

    if not found then
        raise exception 'La solicitud no existe.';
    end if;

    if request_row.receiver_id is distinct from auth.uid() then
        raise exception 'No tienes permiso para responder esta solicitud.';
    end if;

    if request_row.status <> 'pendiente' then
        raise exception 'La solicitud ya fue respondida.';
    end if;

    if request_row.expires_at is not null and request_row.expires_at <= now() then
        raise exception 'Este desafío ha expirado.';
    end if;

    update public.game_requests
    set status = 'rechazado'
    where id = p_request_id;
end;
$$;

revoke all on function public.accept_game_request(uuid) from public, anon;
revoke all on function public.reject_game_request(uuid) from public, anon;
grant execute on function public.accept_game_request(uuid) to authenticated;
grant execute on function public.reject_game_request(uuid) to authenticated;

create or replace function public.initialize_game_questions(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    game_row public.games%rowtype;
    target_position integer;
    selected_question_id uuid;
    assigned_count integer;
    distinct_question_count integer;
    initial_turn_id uuid;
begin
    select *
    into game_row
    from public.games
    where id = p_game_id
    for update;

    if not found then
        raise exception 'No encontramos esta partida.';
    end if;

    if auth.uid() is null or auth.uid() not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'No tienes permiso para preparar esta partida.';
    end if;

    if game_row.status not in ('en espera', 'activo') then
        raise exception 'Esta partida ya no puede iniciarse.';
    end if;

    for target_position in
        select positions.position
        from generate_series(1, 6) as positions(position)
        where not exists (
            select 1
            from public.game_questions as assigned
            where assigned.game_id = p_game_id
              and assigned.position = positions.position
        )
        order by positions.position
    loop
        select question.id
        into selected_question_id
        from public.questions as question
        where not exists (
            select 1
            from public.game_questions as assigned
            where assigned.game_id = p_game_id
              and assigned.question_id = question.id
        )
          and (
              select count(*)
              from public.answers as answer
              where answer.question_id = question.id
          ) >= 4
        order by random()
        limit 1;

        if selected_question_id is null then
            raise exception 'No hay suficientes preguntas con al menos dos respuestas para preparar esta partida.';
        end if;

        insert into public.game_questions (game_id, question_id, position)
        values (p_game_id, selected_question_id, target_position);
    end loop;

    select count(*), count(distinct question_id)
    into assigned_count, distinct_question_count
    from public.game_questions
    where game_id = p_game_id;

    if assigned_count <> 6 or distinct_question_count <> 6 then
        raise exception 'La partida debe tener seis preguntas distintas para comenzar.';
    end if;

    if exists (
        select 1
        from public.game_questions as assigned
        where assigned.game_id = p_game_id
          and (
              select count(*)
              from public.answers as answer
              where answer.question_id = assigned.question_id
          ) < 4
    ) then
        raise exception 'Cada pregunta de la partida debe tener cuatro opciones de respuesta.';
    end if;

    if game_row.status = 'en espera' then
        initial_turn_id := case when random() < 0.5 then game_row.player_one_id else game_row.player_two_id end;

        update public.games
        set status = 'activo',
            started_at = now(),
            current_turn_id = initial_turn_id
        where id = p_game_id;
    elsif game_row.current_turn_id is null
        or game_row.current_turn_id not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'La partida activa no tiene un turno válido.';
    end if;

    if game_row.status = 'en espera' or game_row.current_game_question_id is null then
        update public.game_questions as available_card
        set selected_at = clock_timestamp()
        where available_card.id = (
            select candidate.id
            from public.game_questions as candidate
            where candidate.game_id = p_game_id
              and candidate.selected_by is null
              and candidate.answered_at is null
              and candidate.selected_at is null
            order by candidate.position
            limit 1
        );
    end if;
end;
$$;

revoke all on function public.initialize_game_questions(uuid) from public, anon;
grant execute on function public.initialize_game_questions(uuid) to authenticated;

create or replace function public.select_game_card(
    p_game_id uuid,
    p_game_question_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    game_row public.games%rowtype;
    card_row public.game_questions%rowtype;
    selection_marker_id uuid;
    selection_started_at timestamptz;
begin
    select *
    into game_row
    from public.games
    where id = p_game_id
    for update;

    if not found then
        raise exception 'No encontramos esta partida.';
    end if;

    if auth.uid() is null or auth.uid() not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'No tienes permiso para modificar esta partida.';
    end if;

    if game_row.status <> 'activo' then
        raise exception 'La partida no está activa.';
    end if;

    if game_row.current_turn_id is distinct from auth.uid() then
        raise exception 'No es tu turno para seleccionar una carta.';
    end if;

    if game_row.current_game_question_id is not null then
        raise exception 'Ya hay una pregunta revelada en la mesa.';
    end if;

    select id, selected_at into selection_marker_id, selection_started_at
    from public.game_questions
    where game_id = p_game_id
      and selected_by is null
      and answered_at is null
      and selected_at is not null
    order by position
    limit 1
    for update;

    if selection_marker_id is null then
        raise exception 'No hay un tiempo de selección activo.';
    end if;
    if selection_started_at + interval '10 seconds' <= clock_timestamp() then
        raise exception 'Se agotó el tiempo para seleccionar una carta.';
    end if;

    select *
    into card_row
    from public.game_questions
    where id = p_game_question_id
      and game_id = p_game_id
    for update;

    if not found then
        raise exception 'La carta no pertenece a esta partida.';
    end if;

    if card_row.selected_by is not null or card_row.answered_at is not null then
        raise exception 'Esta carta ya fue seleccionada.';
    end if;

    update public.game_questions
    set selected_at = null
    where game_id = p_game_id
      and selected_by is null
      and answered_at is null
      and selected_at is not null;

    update public.game_questions
    set selected_by = auth.uid(),
        selected_at = clock_timestamp()
    where id = p_game_question_id;

    update public.games
    set current_game_question_id = p_game_question_id
    where id = p_game_id;
end;
$$;

create or replace function public.expire_game_selection(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    game_row public.games%rowtype;
    selection_marker_id uuid;
    selection_started_at timestamptz;
    next_turn_id uuid;
begin
    select * into game_row
    from public.games
    where id = p_game_id
    for update;

    if not found or auth.uid() is null
       or auth.uid() not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'No tienes permiso para cambiar el turno de esta partida.';
    end if;
    if game_row.status <> 'activo' or game_row.current_game_question_id is not null then
        raise exception 'La partida no está esperando una selección.';
    end if;

    select id, selected_at into selection_marker_id, selection_started_at
    from public.game_questions
    where game_id = p_game_id
      and selected_by is null
      and answered_at is null
      and selected_at is not null
    order by position
    limit 1
    for update;

    if selection_marker_id is null then
        raise exception 'No hay un turno de selección activo.';
    end if;
    if selection_started_at + interval '10 seconds' > clock_timestamp() then
        raise exception 'El tiempo para seleccionar todavía no terminó.';
    end if;

    next_turn_id := case
        when game_row.current_turn_id = game_row.player_one_id then game_row.player_two_id
        else game_row.player_one_id
    end;

    update public.game_questions
    set selected_at = null
    where id = selection_marker_id;

    update public.games
    set current_turn_id = next_turn_id
    where id = p_game_id;

    update public.game_questions
    set selected_at = clock_timestamp()
    where id = (
        select candidate.id
        from public.game_questions as candidate
        where candidate.game_id = p_game_id
          and candidate.selected_by is null
          and candidate.answered_at is null
          and candidate.selected_at is null
        order by candidate.position
        limit 1
    );
end;
$$;

revoke all on function public.expire_game_selection(uuid) from public, anon;
grant execute on function public.expire_game_selection(uuid) to authenticated;

create or replace function public.get_selected_game_question(p_game_id uuid)
returns table (
    game_question_id uuid,
    question text,
    category question_category
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    game_row public.games%rowtype;
begin
    select *
    into game_row
    from public.games
    where id = p_game_id;

    if not found then
        raise exception 'No encontramos esta partida.';
    end if;

    if auth.uid() is null or auth.uid() not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'No tienes permiso para ver esta partida.';
    end if;

    if game_row.current_game_question_id is null then
        return;
    end if;

    return query
    select assigned.id, source.question, source.category
    from public.game_questions as assigned
    join public.questions as source on source.id = assigned.question_id
    where assigned.id = game_row.current_game_question_id
      and assigned.game_id = p_game_id
      and assigned.selected_at is not null;
end;
$$;

revoke all on function public.select_game_card(uuid, uuid) from public, anon;
revoke all on function public.get_selected_game_question(uuid) from public, anon;
grant execute on function public.select_game_card(uuid, uuid) to authenticated;
grant execute on function public.get_selected_game_question(uuid) to authenticated;

create policy "Players can view answers in their games"
on game_answers
for select
to authenticated
using (
    exists (
        select 1
        from games
        where games.id = game_answers.game_id
          and auth.uid() in (games.player_one_id, games.player_two_id)
    )
);

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'game_answers'
    ) then
        alter publication supabase_realtime add table public.game_answers;
    end if;
end;
$$;

create or replace function public.get_active_game_answers(p_game_id uuid)
returns table (answer_id uuid, answer text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    game_row public.games%rowtype;
    option_count integer;
begin
    select * into game_row
    from public.games
    where id = p_game_id;

    if not found or auth.uid() is null
       or auth.uid() not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'No tienes permiso para ver esta pregunta.';
    end if;

    if game_row.status <> 'activo' or game_row.current_game_question_id is null then
        raise exception 'No hay una pregunta activa.';
    end if;

        select count(*) into option_count
        from public.game_questions as assigned
        join public.answers as options on options.question_id = assigned.question_id
        where assigned.id = game_row.current_game_question_id
            and assigned.game_id = p_game_id
            and assigned.selected_at is not null;

        if option_count < 4 then
                raise exception 'La pregunta activa no tiene cuatro opciones disponibles.';
        end if;

        return query
        select options.id, options.answer
        from public.game_questions as assigned
        join lateral (
                select source.id, source.answer
                from public.answers as source
                where source.question_id = assigned.question_id
                order by source.is_correct desc, random()
                limit 4
        ) as options on true
        where assigned.id = game_row.current_game_question_id
            and assigned.game_id = p_game_id
            and assigned.selected_at is not null;
end;
$$;

create or replace function public.finalize_game_internal(p_game_id uuid, p_winner_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    winner_xp constant integer := 25;
begin
    update public.games
    set status = 'finalizado',
        winner_id = p_winner_id,
        finished_at = clock_timestamp()
    where id = p_game_id
      and status = 'activo'
      and winner_id is null;

    if found then
        update public.profiles
        set xp = xp + winner_xp,
            updated_at = clock_timestamp()
        where id = p_winner_id;
    end if;
end;
$$;

create or replace function public.submit_game_answer(
    p_game_id uuid,
    p_game_question_id uuid,
    p_answer_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    game_row public.games%rowtype;
    card_row public.game_questions%rowtype;
    response_player_id uuid;
    answer_is_correct boolean;
    response_at timestamptz;
    elapsed_ms integer;
    time_limit_ms integer;
    is_tiebreak boolean;
    response_count integer;
    answer_one boolean;
    answer_two boolean;
    score_one integer;
    score_two integer;
    completed_count integer;
    winner_id uuid;
    next_question_id uuid;
begin
    select * into game_row
    from public.games
    where id = p_game_id
    for update;

    if not found or auth.uid() is null
       or auth.uid() not in (game_row.player_one_id, game_row.player_two_id) then
        raise exception 'No tienes permiso para responder esta partida.';
    end if;
    if game_row.status <> 'activo'
       or game_row.current_game_question_id is distinct from p_game_question_id then
        raise exception 'Esta pregunta ya no está activa.';
    end if;

    select * into card_row
    from public.game_questions
    where id = p_game_question_id and game_id = p_game_id
    for update;

    if not found or card_row.selected_at is null then
        raise exception 'La pregunta no pertenece a esta oportunidad.';
    end if;

    is_tiebreak := card_row.selected_by is null;
    time_limit_ms := case when is_tiebreak then 10000 else 30000 end;
    if not is_tiebreak then
        response_player_id := case
            when card_row.selected_by = game_row.player_one_id then game_row.player_two_id
            else game_row.player_one_id
        end;
    end if;
    response_at := clock_timestamp();
    elapsed_ms := greatest(0, floor(extract(epoch from (response_at - card_row.selected_at)) * 1000)::integer);

    if p_answer_id is not null and elapsed_ms < time_limit_ms then
        if not is_tiebreak then
            if auth.uid() is distinct from response_player_id then
                raise exception 'Solo el rival que tiene la oportunidad puede responder.';
            end if;
        else
            response_player_id := auth.uid();
        end if;

        select answer.is_correct into answer_is_correct
        from public.answers as answer
        where answer.id = p_answer_id
          and answer.question_id = card_row.question_id;

        if not found then
            raise exception 'La respuesta no pertenece a la pregunta activa.';
        end if;
    else
        if elapsed_ms < time_limit_ms then
            raise exception 'La oportunidad todavía está dentro del tiempo permitido.';
        end if;
        answer_is_correct := false;
    end if;

    if is_tiebreak and (p_answer_id is null or elapsed_ms >= time_limit_ms) then
        insert into public.game_answers
            (game_id, game_question_id, player_id, answer_id, is_correct, response_time_ms, answered_at)
        select p_game_id, p_game_question_id, participants.player_id, null, false,
               time_limit_ms, response_at
        from (values (game_row.player_one_id), (game_row.player_two_id)) as participants(player_id)
        where not exists (
            select 1 from public.game_answers as prior
            where prior.game_id = p_game_id
              and prior.game_question_id = p_game_question_id
              and prior.player_id = participants.player_id
              and prior.answered_at >= card_row.selected_at
        );
    else
        if exists (
            select 1 from public.game_answers as prior
            where prior.game_id = p_game_id
              and prior.game_question_id = p_game_question_id
              and prior.player_id = response_player_id
              and prior.answered_at >= card_row.selected_at
        ) then
            raise exception 'Ya respondiste esta oportunidad.';
        end if;
        insert into public.game_answers
            (game_id, game_question_id, player_id, answer_id, is_correct, response_time_ms, answered_at)
        values (
            p_game_id,
            p_game_question_id,
            response_player_id,
            case when elapsed_ms < time_limit_ms then p_answer_id else null end,
            case when elapsed_ms < time_limit_ms then coalesce(answer_is_correct, false) else false end,
            least(elapsed_ms, time_limit_ms),
            response_at
        );
    end if;

    if is_tiebreak then
        select count(*) into response_count
        from public.game_answers
        where game_id = p_game_id
          and game_question_id = p_game_question_id
          and answered_at >= card_row.selected_at;

        if response_count < 2 then
            return jsonb_build_object('timed_out', elapsed_ms >= time_limit_ms, 'resolved', false);
        end if;

                select is_correct into answer_one
        from public.game_answers
        where game_id = p_game_id and game_question_id = p_game_question_id
          and player_id = game_row.player_one_id and answered_at >= card_row.selected_at
        order by answered_at desc limit 1;
                select is_correct into answer_two
        from public.game_answers
        where game_id = p_game_id and game_question_id = p_game_question_id
          and player_id = game_row.player_two_id and answered_at >= card_row.selected_at
        order by answered_at desc limit 1;

        if coalesce(answer_one, false) and not coalesce(answer_two, false) then
            winner_id := game_row.player_one_id;
        elsif coalesce(answer_two, false) and not coalesce(answer_one, false) then
            winner_id := game_row.player_two_id;
        end if;

        if winner_id is not null then
            perform public.finalize_game_internal(p_game_id, winner_id);
            return jsonb_build_object('resolved', true, 'winner_id', winner_id, 'tiebreak', true);
        end if;

        select question.id into next_question_id
        from public.questions as question
        where question.id <> card_row.question_id
          and (select count(*) from public.answers as options where options.question_id = question.id) >= 4
          and not exists (
              select 1 from public.game_questions as assigned
              where assigned.game_id = p_game_id and assigned.question_id = question.id
          )
          and not exists (
              select 1 from public.game_answers as prior
              join public.answers as prior_answer on prior_answer.id = prior.answer_id
              where prior.game_id = p_game_id and prior_answer.question_id = question.id
          )
        order by random() limit 1;

        if next_question_id is null then
            raise exception 'No quedan preguntas globales sin usar para continuar el desempate.';
        end if;

        update public.game_questions
        set question_id = next_question_id,
            selected_by = null,
            selected_at = clock_timestamp(),
            answered_by = null,
            answered_at = null
        where id = p_game_question_id;
        return jsonb_build_object('resolved', true, 'tiebreak', true, 'next_question', true);
    end if;

    update public.game_questions
    set answered_by = response_player_id,
        answered_at = response_at
    where id = p_game_question_id;

    select count(*) into completed_count
    from public.game_questions
    where game_id = p_game_id and answered_at is not null;

    if completed_count = 6 then
        select count(*) filter (where first_answer.is_correct and first_answer.player_id = game_row.player_one_id),
               count(*) filter (where first_answer.is_correct and first_answer.player_id = game_row.player_two_id)
        into score_one, score_two
        from (
            select distinct on (game_question_id) player_id, is_correct
            from public.game_answers
            where game_id = p_game_id
            order by game_question_id, answered_at asc
        ) as first_answer;

        if score_one <> score_two then
            winner_id := case when score_one > score_two then game_row.player_one_id else game_row.player_two_id end;
            perform public.finalize_game_internal(p_game_id, winner_id);
            return jsonb_build_object('resolved', true, 'winner_id', winner_id, 'finished', true);
        end if;

        select question.id into next_question_id
        from public.questions as question
        where (select count(*) from public.answers as options where options.question_id = question.id) >= 4
          and not exists (
              select 1 from public.game_questions as assigned
              where assigned.game_id = p_game_id and assigned.question_id = question.id
          )
          and not exists (
              select 1 from public.game_answers as prior
              join public.answers as prior_answer on prior_answer.id = prior.answer_id
              where prior.game_id = p_game_id and prior_answer.question_id = question.id
          )
        order by random() limit 1;

        if next_question_id is null then
            raise exception 'La partida terminó empatada y no quedan preguntas para desempatar.';
        end if;

        update public.game_questions
        set question_id = next_question_id,
            selected_by = null,
            selected_at = clock_timestamp(),
            answered_by = null,
            answered_at = null
        where id = p_game_question_id;
        return jsonb_build_object('resolved', true, 'tiebreak', true, 'next_question', true);
    end if;

    update public.games
    set current_game_question_id = null,
        current_turn_id = response_player_id
    where id = p_game_id;

    update public.game_questions as next_marker
    set selected_at = clock_timestamp()
    where next_marker.id = (
        select candidate.id
        from public.game_questions as candidate
        where candidate.game_id = p_game_id
          and candidate.selected_by is null
          and candidate.answered_at is null
          and candidate.selected_at is null
        order by candidate.position
        limit 1
    );

    return jsonb_build_object(
        'resolved', true,
        'is_correct', coalesce(answer_is_correct, false),
        'timed_out', p_answer_id is null or elapsed_ms >= time_limit_ms,
        'response_time_ms', least(elapsed_ms, time_limit_ms)
    );
end;
$$;

create or replace function public.set_game_request_expiration()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
    new.expires_at := now() + interval '30 seconds';
    return new;
end;
$$;

drop trigger if exists set_game_request_expiration on public.game_requests;
create trigger set_game_request_expiration
before insert on public.game_requests
for each row
execute function public.set_game_request_expiration();

update public.game_requests
set expires_at = created_at + interval '30 seconds'
where status = 'pendiente';

create or replace function public.delete_expired_game_requests()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    delete from public.game_requests
    where status = 'pendiente'
      and expires_at <= now()
      and auth.uid() in (sender_id, receiver_id);
end;
$$;

revoke all on function public.delete_expired_game_requests() from public, anon;
grant execute on function public.delete_expired_game_requests() to authenticated;

revoke all on function public.reject_game_request(uuid) from public, anon;
grant execute on function public.reject_game_request(uuid) to authenticated;

create or replace function public.delete_expired_game_requests()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
        delete from public.game_requests
        where status = 'pendiente'
            and expires_at <= now()
            and auth.uid() in (sender_id, receiver_id);
end;
$$;

revoke all on function public.delete_expired_game_requests() from public, anon;
grant execute on function public.delete_expired_game_requests() to authenticated;

revoke all on function public.get_active_game_answers(uuid) from public, anon;
revoke all on function public.finalize_game_internal(uuid, uuid) from public, anon, authenticated;
revoke all on function public.submit_game_answer(uuid, uuid, uuid) from public, anon;
grant execute on function public.get_active_game_answers(uuid) to authenticated;
grant execute on function public.submit_game_answer(uuid, uuid, uuid) to authenticated;

alter table public.games enable row level security;
alter table public.game_questions enable row level security;
alter table public.game_answers enable row level security;
alter table public.answers enable row level security;
alter table public.questions enable row level security;