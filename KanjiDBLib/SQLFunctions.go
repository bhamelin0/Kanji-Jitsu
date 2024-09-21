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
