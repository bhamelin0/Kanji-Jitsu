package KanjiDBLib

const InsertKanjiTableSQL = "INSERT INTO kanji (kanji, nlevel) VALUES "

const VocabInsertSQL = `
	with s as (
		select id, vocab 
		from vocab
		where vocab = $1
	), i as (
		insert into vocab ("vocab", "common")
		select $1, $2
		where not exists (select 1 from s)
		returning id
	), kanjiTable as ( 
		select id, kanji as kanjiChara
		from kanji 
		where kanji.kanji=$3
	), relationTable as (
		select kanji_id, vocab_id from
		(select id as vocab_id
		from i
		union all
		select id
		from s ) vocabTable
		cross join 
		(select id as kanji_id from kanjiTable) kanjiTable
	), z as (
	insert into kanji_vocab (kanji_id, vocab_id)
	select kanji_id, vocab_id from relationTable
	where not exists( 
		select 1 from relationTable inner join kanji_vocab on 
		relationTable.kanji_id =  kanji_vocab.kanji_id and 
		relationTable.vocab_id =  kanji_vocab.vocab_id)
		returning *
	) select vocab_id from relationTable
`

const SafeGlossInsertSQL = `
	insert into gloss (vocab_id, gloss)
	select $1, $2
	where not exists ( select 1 from gloss where vocab_id = $1 and gloss = $3)
`

const SafeReadingInsertSQL = `
	insert into reading (vocab_id, reading)
	select $1, $2
	where not exists ( select 1 from reading where vocab_id = $1 and reading = $3)
`

const ReadingInsertSQLLine = `
	($1, $2)
`

const selectKanjiVocabSQL = `select kanji.id as kanji_id, vocab.vocab, vocab.id as vocab_id, vocab.common from kanji
inner join kanji_vocab on kanji.id = kanji_vocab.kanji_id 
inner join vocab on kanji_vocab.vocab_id = vocab.id 
where kanji.kanji  = $1`

const selectGlossSQL = `select vocab.id as vocab_id, gloss from kanji
inner join kanji_vocab on kanji.id = kanji_vocab.kanji_id 
inner join vocab on kanji_vocab.vocab_id = vocab.id 
inner join gloss on vocab.id = gloss.vocab_id 
where kanji.id = $1`

const selectReadingSQL = `select vocab.id as vocab_id, reading from kanji
inner join kanji_vocab on kanji.id = kanji_vocab.kanji_id 
inner join vocab on kanji_vocab.vocab_id = vocab.id 
inner join reading on vocab.id = reading.vocab_id 
where kanji.id = $1`

const initDBSQL = `
-- public.kanji definition

-- Drop table

-- DROP TABLE public.kanji;

CREATE TABLE public.kanji (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	kanji varchar NOT NULL,
	nlevel int4 NOT NULL,
	consumed bool DEFAULT false NOT NULL,
	CONSTRAINT kanji_pk PRIMARY KEY (id),
	CONSTRAINT kanji_unique UNIQUE (kanji)
);


-- public.vocab definition

-- Drop table

-- DROP TABLE public.vocab;

CREATE TABLE public.vocab (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	vocab varchar NOT NULL,
	common bool DEFAULT false NOT NULL,
	CONSTRAINT vocab_pk PRIMARY KEY (id),
	CONSTRAINT vocab_unique UNIQUE (vocab)
);


-- public.gloss definition

-- Drop table

-- DROP TABLE public.gloss;

CREATE TABLE public.gloss (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	vocab_id int4 NOT NULL,
	gloss varchar NOT NULL,
	CONSTRAINT gloss_pk PRIMARY KEY (id),
	CONSTRAINT gloss_vocab_fk FOREIGN KEY (vocab_id) REFERENCES public.vocab(id)
);


-- public.kanji_vocab definition

-- Drop table

-- DROP TABLE public.kanji_vocab;

CREATE TABLE public.kanji_vocab (
	kanji_id int4 NOT NULL,
	vocab_id int4 NOT NULL,
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	CONSTRAINT kanji_vocab_pk PRIMARY KEY (id),
	CONSTRAINT kanji_vocab_kanji_fk FOREIGN KEY (kanji_id) REFERENCES public.kanji(id),
	CONSTRAINT kanji_vocab_vocab_fk FOREIGN KEY (vocab_id) REFERENCES public.vocab(id)
);


-- public.reading definition

-- Drop table

-- DROP TABLE public.reading;

CREATE TABLE public.reading (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	reading varchar NOT NULL,
	vocab_id int4 NOT NULL,
	CONSTRAINT reading_pk PRIMARY KEY (id),
	CONSTRAINT reading_vocab_fk FOREIGN KEY (vocab_id) REFERENCES public.vocab(id)
);
`
const DailyKanji_GetFiveNew = `
select * from (
	select id from kanji
	where daily_status is null and nlevel = 1
	order by random()
	limit 1
)
union 
select * from (
	select id from kanji
	where daily_status is null and nlevel = 2
	order by random()
	limit 1
)
union 
select * from (
	select id from kanji
	where daily_status is null and nlevel = 3
	order by random()
	limit 1
)
union 
select id from (
	select * from kanji
	where daily_status is null and nlevel = 4
	order by random()
	limit 1
)
union 
select id from (
	select * from kanji
	where daily_status is null and nlevel = 5
	order by random()
	limit 1
)`

const DailyKanji_Expire = `update kanji set daily_status = 2 where daily_status = 1`
const DailyKanji_SetDaily = `update kanji set daily_status = 1 where kanji.id in($1, $2, $3, $4, $5)`
const DailyKanji_Select = `select * from kanji where daily_status = 1 order by nlevel `
const DailyKanji_Reset = `update kanji set daily_status = null where daily_status = 2`
