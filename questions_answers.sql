-- =========================================================
-- LECTURA (5)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('"Aunque llovía con fuerza, Pedro salió sin paraguas y llegó empapado a la escuela." ¿Por qué llegó empapado?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Porque llovía fuerte y no llevó paraguas', true),
    ('Porque se cayó en un charco',              false),
    ('Porque llegó tarde',                       false),
    ('Porque olvidó su mochila',                 false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál de estas palabras es sinónimo de "veloz"?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Rápido',  true),
    ('Lento',   false),
    ('Pesado',  false),
    ('Callado', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el antónimo (opuesto) de "escaso"?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Abundante', true),
    ('Poco',      false),
    ('Raro',      false),
    ('Pobre',     false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué figura literaria aparece en la frase "Tus ojos son dos luceros"?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Metáfora',        true),
    ('Hipérbole',       false),
    ('Personificación', false),
    ('Onomatopeya',     false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el sujeto de la oración "Los niños juegan en el parque"?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Los niños',       true),
    ('Juegan',          false),
    ('En el parque',    false),
    ('Juegan en el parque', false)
) as a(answer, is_correct);


-- =========================================================
-- MATEMÁTICAS (5)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('¿Cuánto es 15 x 12?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('180', true),
    ('170', false),
    ('160', false),
    ('190', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuánto es 3/4 de 80?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('60', true),
    ('50', false),
    ('40', false),
    ('70', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el perímetro de un cuadrado cuyo lado mide 9 cm?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('36 cm', true),
    ('18 cm', false),
    ('81 cm', false),
    ('27 cm', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuánto es el 25% de 200?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('50',  true),
    ('25',  false),
    ('75',  false),
    ('100', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el resultado de 5 + 3 x 4?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('17', true),
    ('32', false),
    ('24', false),
    ('12', false)
) as a(answer, is_correct);


-- =========================================================
-- INGLÉS (5)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('Complete the sentence: "I ___ a student."', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('am',  true),
    ('is',  false),
    ('are', false),
    ('be',  false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el plural de "child" en inglés?', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Children', true),
    ('Childs',   false),
    ('Childrens', false),
    ('Childes',  false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el pasado del verbo "go"?', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Went',  true),
    ('Goed',  false),
    ('Gone',  false),
    ('Going', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué significa "Where are you from?"', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('¿De dónde eres?',        true),
    ('¿Cómo estás?',           false),
    ('¿Cuántos años tienes?',  false),
    ('¿Dónde vives?',          false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('Complete the sentence: "She ___ to school every day."', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('goes', true),
    ('go',   false),
    ('going', false),
    ('gone', false)
) as a(answer, is_correct);


-- =========================================================
-- CULTURA GENERAL (5)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('¿Cuál es la capital de Australia?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Canberra',  true),
    ('Sídney',    false),
    ('Melbourne', false),
    ('Perth',     false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Quién pintó la Mona Lisa?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Leonardo da Vinci', true),
    ('Pablo Picasso',     false),
    ('Vincent van Gogh',  false),
    ('Miguel Ángel',      false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el planeta más cercano al Sol?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Mercurio', true),
    ('Venus',    false),
    ('Marte',    false),
    ('Tierra',   false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuántos huesos tiene aproximadamente el cuerpo de un adulto?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('206', true),
    ('150', false),
    ('300', false),
    ('108', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿En qué año llegó Cristóbal Colón a América?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('1492', true),
    ('1500', false),
    ('1453', false),
    ('1810', false)
) as a(answer, is_correct);