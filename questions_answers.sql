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

-- =========================================================
-- LECTURA (4)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('¿Qué significa la palabra "efímero"?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Que dura muy poco tiempo',  true),
    ('Que dura para siempre',     false),
    ('Que es muy antiguo',        false),
    ('Que es muy grande',         false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('Lee: "Marta miraba el reloj cada minuto, movía la pierna sin parar y se mordía las uñas mientras esperaba los resultados." ¿Cómo se sentía Marta?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Ansiosa',    true),
    ('Aburrida',   false),
    ('Tranquila',  false),
    ('Orgullosa',  false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué figura literaria aparece en la frase "El viento susurraba secretos entre los árboles"?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Personificación', true),
    ('Hipérbole',       false),
    ('Comparación',     false),
    ('Onomatopeya',     false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué tipo de texto es una receta de cocina?', 'lectura')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Instructivo',    true),
    ('Narrativo',      false),
    ('Argumentativo',  false),
    ('Poético',        false)
) as a(answer, is_correct);


-- =========================================================
-- MATEMÁTICAS (4)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el área de un triángulo con base de 10 cm y altura de 6 cm?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('30 cm²', true),
    ('60 cm²', false),
    ('16 cm²', false),
    ('20 cm²', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuánto es 2/3 + 1/6?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('5/6', true),
    ('3/9', false),
    ('3/6', false),
    ('1/2', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el mínimo común múltiplo (m.c.m.) de 4 y 6?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('12', true),
    ('24', false),
    ('10', false),
    ('2',  false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('Una camisa cuesta $80.000 y tiene 15% de descuento. ¿Cuánto se paga por ella?', 'matematicas')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('$68.000', true),
    ('$65.000', false),
    ('$72.000', false),
    ('$70.000', false)
) as a(answer, is_correct);


-- =========================================================
-- INGLÉS (4)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('Complete the sentence: "There ___ three books on the table."', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('are', true),
    ('is',  false),
    ('am',  false),
    ('be',  false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué significa "I''m looking forward to the weekend"?', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Tengo muchas ganas de que llegue el fin de semana', true),
    ('Estoy mirando hacia el fin de semana',              false),
    ('Voy a trabajar el fin de semana',                   false),
    ('No me gusta el fin de semana',                      false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Cuál es el opuesto (antonym) de "difficult"?', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Easy',  true),
    ('Hard',  false),
    ('Heavy', false),
    ('Slow',  false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('Complete the sentence: "My brother is ___ than me."', 'ingles')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('taller',    true),
    ('tall',      false),
    ('tallest',   false),
    ('more tall', false)
) as a(answer, is_correct);


-- =========================================================
-- CULTURA GENERAL (4)
-- =========================================================

with q as (
    insert into questions (question, category)
    values ('¿Qué gas absorben las plantas del aire para hacer la fotosíntesis?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Dióxido de carbono', true),
    ('Oxígeno',            false),
    ('Nitrógeno',          false),
    ('Hidrógeno',          false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué continente tiene más países?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('África',  true),
    ('Asia',    false),
    ('Europa',  false),
    ('América', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿En qué año ocurrió la Batalla de Boyacá?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('1819', true),
    ('1810', false),
    ('1830', false),
    ('1821', false)
) as a(answer, is_correct);

with q as (
    insert into questions (question, category)
    values ('¿Qué elemento químico tiene el símbolo "Au"?', 'cultura general')
    returning id
)
insert into answers (question_id, answer, is_correct)
select q.id, a.answer, a.is_correct
from q, (values
    ('Oro',      true),
    ('Plata',    false),
    ('Aluminio', false),
    ('Argón',    false)
) as a(answer, is_correct);