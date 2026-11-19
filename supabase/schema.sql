-- Kavira database for Supabase.
-- Run this once: Supabase dashboard > SQL Editor > New query > paste everything > Run.
-- It is safe to read top to bottom: tables first, then the security rules, then the starter poems.

-- =====================================================================
-- 1. TABLES
-- =====================================================================

-- One row per poet. The name and languages are public to signed-in poets.
-- The date of birth is NOT stored here: it is checked once at sign-up and then discarded.
create table if not exists public.profiles (
    id uuid primary key,
    name text not null check (char_length(name) between 2 and 60),
    languages text[] not null check (languages <@ array['English', 'Hindi'] and array_length(languages, 1) >= 1),
    circle uuid[] not null default '{}',
    is_starter boolean not null default false,
    created_at timestamptz not null default now()
);

-- A poem needs a title and at least 80 words. The database refuses anything shorter.
create table if not exists public.poems (
    id bigint generated always as identity primary key,
    author_id uuid not null default auth.uid() references public.profiles (id),
    title text not null check (char_length(btrim(title)) between 1 and 100),
    language text not null check (language in ('English', 'Hindi')),
    body text not null check (array_length(regexp_split_to_array(btrim(body), '\s+'), 1) >= 80),
    created_at timestamptz not null default now()
);

-- A review needs at least 30 words, and a reader can review a poem only once.
create table if not exists public.reviews (
    id bigint generated always as identity primary key,
    poem_id bigint not null references public.poems (id) on delete cascade,
    author_id uuid not null default auth.uid() references public.profiles (id),
    body text not null check (array_length(regexp_split_to_array(btrim(body), '\s+'), 1) >= 30),
    created_at timestamptz not null default now(),
    unique (poem_id, author_id)
);

-- Poems a poet has saved.
create table if not exists public.saved (
    user_id uuid not null default auth.uid() references public.profiles (id),
    poem_id bigint not null references public.poems (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, poem_id)
);

-- =====================================================================
-- 2. SECURITY RULES (Row Level Security)
-- The website's key is public, so these rules are what actually protect the data.
-- Only signed-in poets can do anything. Nobody can edit or delete a poem or review.
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.poems enable row level security;
alter table public.reviews enable row level security;
alter table public.saved enable row level security;

drop policy if exists "poets can read profiles" on public.profiles;
create policy "poets can read profiles" on public.profiles
    for select to authenticated using (true);

drop policy if exists "poets can read poems" on public.poems;
create policy "poets can read poems" on public.poems
    for select to authenticated using (true);

drop policy if exists "poets can publish their own poems" on public.poems;
create policy "poets can publish their own poems" on public.poems
    for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "poets can read reviews" on public.reviews;
create policy "poets can read reviews" on public.reviews
    for select to authenticated using (true);

-- A review must be your own, and never on your own poem.
drop policy if exists "poets can review other poems" on public.reviews;
create policy "poets can review other poems" on public.reviews
    for insert to authenticated with check (
        author_id = auth.uid()
        and exists (select 1 from public.poems p where p.id = poem_id and p.author_id <> auth.uid())
    );

drop policy if exists "poets see their saved poems" on public.saved;
create policy "poets see their saved poems" on public.saved
    for select to authenticated using (user_id = auth.uid());

drop policy if exists "poets can save poems" on public.saved;
create policy "poets can save poems" on public.saved
    for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "poets can unsave poems" on public.saved;
create policy "poets can unsave poems" on public.saved
    for delete to authenticated using (user_id = auth.uid());

-- Let signed-in poets reach the tables through the website's API.
-- (The security rules above still decide which rows they can see or add.)
grant usage on schema public to authenticated;
grant select on public.profiles, public.poems, public.reviews to authenticated;
grant insert on public.poems, public.reviews to authenticated;
grant select, insert, delete on public.saved to authenticated;

-- =====================================================================
-- 3. FUNCTIONS
-- =====================================================================

-- When someone signs up, check they are 16 or older and create their profile.
-- The sign-up form sends name, languages and dob. If the age check fails, sign-up is cancelled.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    birthday date;
begin
    birthday := (new.raw_user_meta_data ->> 'dob')::date;
    if birthday is null or birthday > (current_date - interval '16 years') then
        raise exception 'You must be 16 or older to join Kavira.';
    end if;

    insert into public.profiles (id, name, languages)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'name', 'Poet'),
        array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'languages', '["English"]'::jsonb)))
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Picks the signed-in poet's circle: up to 5 random other poets who share a language.
-- It is picked once and kept. If nobody matched yet, it tries again next time.
create or replace function public.assign_circle()
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
    me public.profiles;
    picked uuid[];
begin
    select * into me from public.profiles where id = auth.uid();
    if me.id is null then
        return '{}';
    end if;
    if coalesce(array_length(me.circle, 1), 0) = 0 then
        select coalesce(array_agg(t.id), '{}') into picked
        from (
            select p.id from public.profiles p
            where p.id <> me.id and p.languages && me.languages
            order by random()
            limit 5
        ) t;
        update public.profiles set circle = picked where id = me.id;
        return picked;
    end if;
    return me.circle;
end;
$$;

revoke all on function public.assign_circle() from public, anon;
grant execute on function public.assign_circle() to authenticated;

-- =====================================================================
-- 4. STARTER POETS AND POEMS (the same ones as data/poems.json)
-- =====================================================================

insert into public.profiles (id, name, languages, is_starter) values
    ('5eed0000-0000-0000-0000-000000000000', 'Meera Anand', array['English'], true),
    ('5eed0000-0000-0000-0000-000000000001', 'Rohan Verma', array['English'], true),
    ('5eed0000-0000-0000-0000-000000000002', 'Shruti Mishra', array['Hindi'], true),
    ('5eed0000-0000-0000-0000-000000000003', 'Imran Qureshi', array['English','Hindi'], true)
on conflict (id) do nothing;

insert into public.poems (author_id, title, language, body, created_at)
select '5eed0000-0000-0000-0000-000000000000', $t$The Monsoon Is Late This Year$t$, 'English', $b$The monsoon is late this year,
and the whole street is holding its breath.
My neighbour waters the dust in her courtyard
as though a promise could be taught to rain.

The clothes on the line have forgotten how to be wet.
The crows sit low on the wires, saying nothing.
Every evening the sky puts on a grey coat,
walks around the roofs, and goes back home unspent.

I keep a bucket by the door anyway.
Some faith is only a bucket by a door,
an old habit of the hands
waiting for the first heavy drop to land.$b$, now() - interval '3 hours'
where not exists (select 1 from public.poems where title = $t$The Monsoon Is Late This Year$t$);

insert into public.poems (author_id, title, language, body, created_at)
select '5eed0000-0000-0000-0000-000000000001', $t$Night Shift$t$, 'English', $b$At three in the morning the office hums
like a refrigerator in an empty house.
The cleaner pushes her cart past my desk
and we nod, two small lights in a very large dark.

I have eaten lunch at midnight so many times
that the hours no longer know their names.
The city outside is a spilled box of beads,
each window a life I will never be told about.

When the first bus finally grinds past,
I carry the morning home like a cup too full,
stepping carefully, afraid of losing
the one quiet hour that belongs to nobody.$b$, now() - interval '9 hours'
where not exists (select 1 from public.poems where title = $t$Night Shift$t$);

insert into public.poems (author_id, title, language, body, created_at)
select '5eed0000-0000-0000-0000-000000000002', $t$माँ की रसोई$t$, 'Hindi', $b$सुबह होने से पहले ही जाग जाती थी रसोई,
माँ के हाथों की चूड़ियों से बजती हुई।
तवे पर रोटी फूलती थी जैसे कोई छोटा चाँद,
और घर भर में फैल जाती थी गर्म गंध।

वह कभी नहीं कहती थी कि थक गई है,
बस पल्लू से माथे का पसीना पोंछ लेती थी।
हम बच्चे थाली के आगे बैठे शिकायत करते रहे,
और वह चुपचाप हमारी भूख गिनती रही।

आज मैं अपनी रसोई में अकेली खड़ी हूँ,
वही आटा है, वही तवा है, वही आग।
पर रोटी में वह स्वाद नहीं आता,
शायद उसमें माँ की थकान घुलनी बाकी है।$b$, now() - interval '20 hours'
where not exists (select 1 from public.poems where title = $t$माँ की रसोई$t$);

insert into public.poems (author_id, title, language, body, created_at)
select '5eed0000-0000-0000-0000-000000000003', $t$Railway Platform, Platform Four$t$, 'English', $b$The train is forty minutes late,
so the platform becomes a small country.
A boy sells tea in clay cups that will return to earth,
an old man reads yesterday's news with great attention.

We are strangers practising patience together.
Someone shares a biscuit without being asked.
A woman rocks her sleeping child with one foot,
her eyes fixed on the place where the tracks vanish.

When the engine finally rolls in, roaring,
we all stand up as if from a long prayer.
Nobody will remember anyone's face,
but for forty minutes we were a village.$b$, now() - interval '30 hours'
where not exists (select 1 from public.poems where title = $t$Railway Platform, Platform Four$t$);

insert into public.poems (author_id, title, language, body, created_at)
select '5eed0000-0000-0000-0000-000000000002', $t$बारिश के बाद$t$, 'Hindi', $b$बारिश रुकी तो आँगन ने गहरी साँस ली,
मिट्टी की ख़ुशबू छत से उतरकर आई।
नीम की पत्तियों से टपकती रहीं देर तक बूँदें,
जैसे पेड़ अब भी कुछ याद कर रहा हो।

गली में बच्चे काग़ज़ की नावें लेकर निकले,
हर नाव में एक छोटा सा सपना बैठा था।
पानी जिधर ले गया, वे उधर बह चले,
और हँसी दूर तक उनके पीछे दौड़ती रही।

मैं खिड़की पर खड़ी देखती रही चुपचाप,
धुली हुई दुनिया कितनी नई लग रही थी।
कभी कभी थोड़ा सा भीग जाना ही काफ़ी होता है
सब कुछ फिर से शुरू करने के लिए।$b$, now() - interval '52 hours'
where not exists (select 1 from public.poems where title = $t$बारिश के बाद$t$);
