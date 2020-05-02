'use strict';


/************************************************/
/* never, ever, never use a code formatter here */
/************************************************/


/*
 *  for the monster data
 *
 *  array to do rnd() to create monsters <= a given level
 */
const monstlevel = [5, 11, 17, 22, 27, 33, 39, 42, 46, 50, 53, 56];

var monsterlist;

//new Monster(`<font color='red'>B</font>`, `bat`, 1, 0, 1, 0, 0, 3, 0, 1, 1), // this works, but is not HTML5
//new Monster(`<p style='color:red'>G</p>`, `gnome`, 1, 10, 1, 0, 0, 8, 30, 2, 2), // using CSS messes up the screen badly
const LARN_monsterlist = [
  // 0
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(` `, ` `,                             0,   0,  0,  0,  3,  0,    0,   0,      0),
  new Monster(`B`, `bat`,                           1,   0,  1,  0,  3,  0,    1,   1,      1),
  new Monster(`G`, `gnome`,                         1,   10, 1,  0,  8,  30,   2,   2,      2),
  new Monster(`H`, `hobgoblin`,                     1,   14, 2,  0,  5,  25,   3,   2,      3),
  new Monster(`J`, `jackal`,                        1,   17, 1,  0,  4,  0,    1,   1,      4),
  new Monster(`K`, `kobold`,                        1,   20, 1,  0,  7,  10,   1,   1,      5),
  // 6
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`O`, `orc`,                           2,   12, 1,  0,  9,  40,   4,   2,      6),
  new Monster(`S`, `snake`,                         2,   15, 1,  0,  3,  0,    3,   1,      7),
  new Monster(`c`, `giant centipede`,               2,   14, 0,  4,  3,  0,    1,   2,      8),
  new Monster(`j`, `jaculi`,                        2,   20, 1,  0,  3,  0,    2,   1,      9),
  new Monster(`t`, `troglodyte`,                    2,   10, 2,  0,  5,  80,   4,   3,      10),
  new Monster(`A`, `giant ant`,                     2,   8,  1,  4,  4,  0,    5,   5,      11),
  // 12
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`E`, `floating eye`,                  3,   8,  1,  0,  3,  0,    5,   2,      12),
  new Monster(`L`, `leprechaun`,                    3,   3,  0,  8,  3,  1500, 13,  45,     13),
  new Monster(`N`, `nymph`,                         3,   3,  0,  14, 9,  0,    18,  45,     14),
  new Monster(`Q`, `quasit`,                        3,   5,  3,  0,  3,  0,    10,  15,     15),
  new Monster(`R`, `rust monster`,                  3,   4,  0,  1,  3,  0,    18,  25,     16),
  new Monster(`Z`, `zombie`,                        3,   12, 2,  0,  3,  0,    6,   7,      17),
  // 18
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`a`, `assassin bug`,                  4,   9,  3,  0,  3,  0,    20,  15,     18),
  new Monster(`b`, `bugbear`,                       4,   5,  4,  15, 5,  40,   20,  35,     19),
  new Monster(`h`, `hell hound`,                    4,   5,  2,  2,  6,  0,    16,  35,     20),
  new Monster(`i`, `ice lizard`,                    4,   11, 2,  10, 6,  50,   16,  25,     21),
  new Monster(`C`, `centaur`,                       4,   6,  4,  0,  10, 40,   24,  45,     22),
  // 23
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`T`, `troll`,                         5,   4,  5,  0,  9,  80,   50,  300,    23),
  new Monster(`Y`, `yeti`,                          5,   6,  4,  0,  5,  50,   35,  100,    24),
  new Monster(`d`, `white dragon`,                  5,   2,  4,  5,  16, 500,  55,  1000,   25),
  new Monster(`e`, `elf`,                           5,   8,  1,  0,  15, 50,   22,  35,     26),
  new Monster(`g`, `gelatinous cube`,               5,   9,  1,  0,  3,  0,    22,  45,     27),
  // 28
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`m`, `metamorph`,                     6,   7,  3,  0,  3,  0,    30,  40,     28),
  new Monster(`v`, `vortex`,                        6,   4,  3,  0,  3,  0,    30,  55,     29),
  new Monster(`z`, `ziller`,                        6,   15, 3,  0,  3,  0,    30,  35,     30),
  new Monster(`F`, `violet fungi`,                  6,   12, 3,  0,  3,  0,    38,  100,    31),
  new Monster(`W`, `wraith`,                        6,   3,  1,  6,  3,  0,    30,  325,    32),
  new Monster(`f`, `forvalaka`,                     6,   2,  5,  0,  7,  0,    50,  280,    33),
  // 34
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`l`, `lawless`,                       7,   7,  3,  0,  6,  0,    35,  80,     34),
  new Monster(`o`, `osequip`,                       7,   4,  3,  16, 4,  0,    35,  100,    35),
  new Monster(`r`, `rothe`,                         7,   15, 5,  0,  3,  100,  50,  250,    36),
  new Monster(`X`, `xorn`,                          7,   0,  6,  0,  13, 0,    60,  300,    37),
  new Monster(`V`, `vampire`,                       7,   3,  4,  6,  17, 0,    50,  1000,   38),
  new Monster(`I`, `invisible stalker`,             7,   3,  6,  0,  5,  0,    50,  350,    39),
  // 40
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`p`, `poltergeist`,                   8,   1,  4,  0,  3,  0,    50,  450,    40),
  new Monster(`q`, `disenchantress`,                8,   3,  0,  9,  3,  0,    50,  500,    41),
  new Monster(`s`, `shambling mound`,               8,   2,  5,  0,  6,  0,    45,  400,    42),
  new Monster(`y`, `yellow mold`,                   8,   12, 4,  0,  3,  0,    35,  250,    43),
  new Monster(`U`, `umber hulk`,                    8,   3,  7,  11, 14, 0,    65,  600,    44),
  // 45
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`k`, `gnome king`,                    9,  -1,  10, 0,  18, 2000, 100, 3000,   45),
  new Monster(`M`, `mimic`,                         9,   5,  6,  0,  8,  0,    55,  99,     46),
  new Monster(`w`, `water lord`,                    9,  -10, 15, 7,  20, 0,    150, 15000,  47),
  new Monster(`D`, `bronze dragon`,                 9,   2,  9,  3,  16, 300,  80,  4000,   48),
  new Monster(`D`, `green dragon`,                  9,   3,  8,  10, 15, 200,  70,  2500,   49),
  new Monster(`P`, `purple worm`,                   9,  -1,  11, 0,  3,  100,  120, 15000,  50),
  new Monster(`x`, `xvart`,                         9,  -2,  12, 0,  13, 0,    90,  1000,   51),
  // 52
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(`n`, `spirit naga`,                   10, -20, 12, 12, 23, 0,    95,  20000,  52),
  new Monster(`D`, `silver dragon`,                 10, -1,  12, 3,  20, 700,  100, 10000,  53),
  new Monster(`D`, `platinum dragon`,               10, -5,  15, 13, 22, 1000, 130, 24000,  54),
  new Monster(`u`, `green urchin`,                  10, -3,  12, 0,  3,  0,    85,  5000,   55),
  new Monster(`D`, `red dragon`,                    10, -2,  13, 3,  19, 800,  110, 14000,  56),
  // 57
  /*          CHAR         NAME                     LV   AC  DAM ATT INT GOLD  HP   EXP     ARG */
  new Monster(OEMPTY.char, `type I demon lord`,     12, -30, 18, 0,  20, 0,    140, 50000,  57),
  new Monster(OEMPTY.char, `type II demon lord`,    13, -30, 18, 0,  21, 0,    160, 75000,  58),
  new Monster(OEMPTY.char, `type III demon lord`,   14, -30, 18, 0,  22, 0,    180, 100000, 59),
  new Monster(OEMPTY.char, `type IV demon lord`,    15, -35, 20, 0,  23, 0,    200, 125000, 60),
  new Monster(OEMPTY.char, `type V demon lord`,     16, -40, 22, 0,  24, 0,    220, 150000, 61),
  new Monster(OEMPTY.char, `type VI demon lord`,    17, -45, 24, 0,  25, 0,    240, 175000, 62),
  new Monster(OEMPTY.char, `type VII demon lord`,   18, -70, 27, 6,  26, 0,    260, 200000, 63),
  new Monster(OEMPTY.char, `demon prince`,          25, -127,30, 6,  28, 0,    345, 300000, 64),
];



const ULARN_monsterlist = [
  new Monster(` `, ` `,                             0,    0,   0,  0,   3,    0,     0,       0,  0),
  new Monster(`l`, `lemming`,                       1,    0,   0,  0,   3,    0,     0,       1,  1),
  new Monster(`G`, `gnome`,                         1,   10,   1,  0,   8,   30,     2,       2,  2),
  new Monster(`H`, `hobgoblin`,                     1,   13,   2,  0,   5,   25,     3,       2,  3),
  new Monster(`J`, `jackal`,                        1,    7,   1,  0,   4,    0,     1,       1,  4),
  new Monster(`K`, `kobold`,                        1,   15,   1,  0,   7,   10,     1,       1,  5),
  new Monster(`O`, `orc`,                           2,   15,   3,  0,   9,   40,     5,       2,  6),
  new Monster(`S`, `snake`,                         2,   10,   1,  0,   3,    0,     3,       1,  7),
  new Monster(`c`, `giant centipede`,               2,   13,   1,  4,   3,    0,     2,       2,  8),
  new Monster(`j`, `jaculi`,                        2,    9,   1,  0,   3,    0,     2,       1,  9),
  new Monster(`t`, `troglodyte`,                    2,   10,   2,  0,   5,   80,     5,       3, 10),
  new Monster(`A`, `giant ant`,                     2,    8,   1,  4,   4,    0,     5,       4, 11),
  new Monster(`E`, `floating eye`,                  3,    8,   2,  0,   3,    0,     7,       2, 12),
  new Monster(`L`, `leprechaun`,                    3,    3,   0,  8,   3, 1500,    15,      40, 13),
  new Monster(`N`, `nymph`,                         3,    3,   0, 14,   9,    0,    20,      40, 14),
  new Monster(`Q`, `quasit`,                        3,    5,   3,  0,   3,    0,    14,      10, 15),
  new Monster(`R`, `rust monster`,                  3,    5,   0,  1,   3,    0,    18,      20, 16),
  new Monster(`Z`, `zombie`,                        3,   12,   3,  0,   3,    0,     9,       7, 17),
  new Monster(`a`, `assassin bug`,                  4,    4,   3,  0,   3,    0,    23,      13, 18),
  new Monster(`b`, `bitbug`,                        4,    5,   4, 15,   5,   40,    24,      33, 19),
  new Monster(`h`, `hell hound`,                    4,    5,   2,  2,   6,    0,    20,      33, 20),
  new Monster(`i`, `ice lizard`,                    4,   11,   3, 10,   6,   50,    19,      23, 21),
  new Monster(`C`, `centaur`,                       4,    6,   4,  0,  10,   40,    25,      43, 22),
  new Monster(`T`, `troll`,                         5,    9,   5,  0,   9,   80,    55,     250, 23),
  new Monster(`Y`, `yeti`,                          5,    8,   4,  0,   5,   50,    45,      90, 24),
  new Monster(`d`, `white dragon`,                  5,    4,   5,  5,  16,  500,    65,    1000, 25),
  new Monster(`e`, `elf`,                           5,    3,   3,  0,  15,   50,    25,      33, 26),
  new Monster(`g`, `gelatinous cube`,               5,    9,   3,  0,   3,    0,    24,      43, 27),
  new Monster(`m`, `metamorph`,                     6,    9,   3,  0,   3,    0,    32,      40, 28),
  new Monster(`v`, `vortex`,                        6,    5,   4,  0,   3,    0,    33,      53, 29),
  new Monster(`z`, `ziller`,                        6,   15,   3,  0,   3,    0,    34,      33, 30),
  new Monster(`F`, `violet fungus`,                 6,   12,   3,  0,   3,    0,    39,      90, 31),
  new Monster(`W`, `wraith`,                        6,    3,   1,  6,   3,    0,    36,     300, 32),
  new Monster(`f`, `forvalaka`,                     6,    3,   5,  0,   7,    0,    55,     270, 33),
  new Monster(`l`, `lama nobe`,                     7,   14,   7,  0,   6,    0,    36,      70, 34),
  new Monster(`o`, `osequip`,                       7,    4,   7, 16,   4,    0,    36,      90, 35),
  new Monster(`r`, `rothe`,                         7,   15,   5,  0,   3,  100,    53,     230, 36),
  new Monster(`X`, `xorn`,                          7,    6,   7,  0,  13,    0,    63,     290, 37),
  new Monster(`V`, `vampire`,                       7,    5,   4,  6,  17,    0,    55,     950, 38),
  new Monster(`I`, `invisible stalker`,             7,    5,   6,  0,   5,    0,    55,     330, 39),
  new Monster(`p`, `poltergeist`,                   8,    1,   8,  0,   3,    0,    55,     430, 40),
  new Monster(`q`, `disenchantress`,                8,    3,   1,  9,   3,    0,    57,     500, 41),
  new Monster(`s`, `shambling mound`,               8,   13,   5,  0,   6,    0,    47,     390, 42),
  new Monster(`y`, `yellow mold`,                   8,   12,   4,  0,   3,    0,    37,     240, 43),
  new Monster(`U`, `umber hulk`,                    8,    6,   7, 11,  14,    0,    67,     600, 44),
  new Monster(`k`, `gnome king`,                    9,   -1,  10,  0,  18, 2000,   120,    3000, 45),
  new Monster(`M`, `mimic`,                         9,    9,   7,  0,   8,    0,    57,     100, 46),
  new Monster(`w`, `water lord`,                    9,  -10,  15,  7,  20,    0,   155,   15000, 47),
  new Monster(`D`, `bronze dragon`,                 9,    5,   9,  3,  16,  300,    90,    4000, 48),
  new Monster(`D`, `green dragon`,                  9,    4,   4, 10,  15,  200,    80,    2500, 49),
  new Monster(`P`, `purple worm`,                   9,   -1,  13,  0,   3,  100,   130,   15000, 50),
  new Monster(`x`, `xvart`,                         9,   -2,  14,  0,  13,    0,   100,    1000, 51),
  new Monster(`n`, `spirit naga`,                  10,  -20,  15, 12,  23,    0,   100,   20000, 52),
  new Monster(`D`, `silver dragon`,                10,   -4,  10,  3,  20,  700,   110,   10000, 53),
  new Monster(`D`, `platinum dragon`,              10,   -7,  15, 13,  22, 1000,   150,   25000, 54),
  new Monster(`u`, `green urchin`,                 10,   -5,  12,  0,   3,    0,    95,    5000, 55),
  new Monster(`D`, `red dragon`,                   10,   -4,  13,  3,  19,  800,   120,   14000, 56),
  //   
  new Monster(OEMPTY.char, `type I demon lord`,    12,  -40,  20,  3,  20,    0,   150,   50000, 57),
  new Monster(OEMPTY.char, `type II demon lord`,   13,  -45,  25,  5,  22,    0,   200,   75000, 58),
  new Monster(OEMPTY.char, `type III demon lord`,  14,  -50,  30,  9,  24,    0,   250,  100000, 59),
  new Monster(OEMPTY.char, `type IV demon lord`,   15,  -55,  35, 11,  26,    0,   300,  125000, 60),
  new Monster(OEMPTY.char, `type V demon lord`,    16,  -60,  40, 13,  28,    0,   350,  150000, 61),
  new Monster(OEMPTY.char, `type VI demon lord`,   17,  -65,  45, 13,  30,    0,   400,  175000, 62),
  new Monster(OEMPTY.char, `type VII demon lord`,  18,  -70,  50,  6,  32,    0,   450,  200000, 63),
  new Monster(OEMPTY.char, `demon prince`,         19, -100,  80,  6,  40,    0,  1000,  500000, 64),
  new Monster(OEMPTY.char, `God of Hellfire`,      20, -127, 127,  6, 100,    0, 32767, 1000000, 65)
];

const FOREST_monsterlist = [
  /*          CHAR         NAME                    LV    AC  DAM ATT  INT  GOLD     HP      EXP ARG */
  new Monster(` `, ` `,                             0,    0,   0,  0,   3,    0,     0,       0,  0),
  new Monster(`l`, `lemming`,                       1,    0,   0,  0,   3,    0,     0,       1,  1),
  new Monster(`G`, `gnome`,                         1,   10,   1,  0,   8,   30,     2,       2,  2),
  new Monster(`H`, `hobgoblin`,                     1,   13,   2,  0,   5,   25,     3,       2,  3),
  new Monster(`J`, `jackal`,                        1,    7,   1,  0,   4,    0,     1,       1,  4),
  new Monster(`K`, `kobold`,                        1,   15,   1,  0,   7,   10,     1,       1,  5),
  new Monster(`O`, `orc`,                           2,   15,   3,  0,   9,   40,     5,       2,  6),
  new Monster(`S`, `snake`,                         2,   10,   1,  0,   3,    0,     3,       1,  7),
  new Monster(`c`, `giant centipede`,               2,   13,   1,  4,   3,    0,     2,       2,  8),
  new Monster(`j`, `jaculi`,                        2,    9,   1,  0,   3,    0,     2,       1,  9),
  new Monster(`t`, `troglodyte`,                    2,   10,   2,  0,   5,   80,     5,       3, 10),
  new Monster(`A`, `giant ant`,                     2,    8,   1,  4,   4,    0,     5,       4, 11),
  new Monster(`E`, `floating eye`,                  3,    8,   2,  0,   3,    0,     7,       2, 12),
  new Monster(`L`, `leprechaun`,                    3,    3,   0,  8,   3, 1500,    15,      40, 13),
  new Monster(`N`, `nymph`,                         3,    3,   0, 14,   9,    0,    20,      40, 14),
  new Monster(`Q`, `quasit`,                        3,    5,   3,  0,   3,    0,    14,      10, 15),
  new Monster(`R`, `rust monster`,                  3,    5,   0,  1,   3,    0,    18,      20, 16),
  new Monster(`Z`, `zombie`,                        3,   12,   3,  0,   3,    0,     9,       7, 17),
  new Monster(`a`, `assassin bug`,                  4,    4,   3,  0,   3,    0,    23,      13, 18),
  new Monster(`b`, `bitbug`,                        4,    5,   4, 15,   5,   40,    24,      33, 19),
  new Monster(`h`, `hell hound`,                    4,    5,   2,  2,   6,    0,    20,      33, 20),
  new Monster(`i`, `ice lizard`,                    4,   11,   3, 10,   6,   50,    19,      23, 21),
  new Monster(`C`, `centaur`,                       4,    6,   4,  0,  10,   40,    25,      43, 22),
  new Monster(`T`, `troll`,                         5,    9,   5,  0,   9,   80,    55,     250, 23),
  new Monster(`Y`, `yeti`,                          5,    8,   4,  0,   5,   50,    45,      90, 24),
  new Monster(`d`, `white dragon`,                  5,    4,   5,  5,  16,  500,    65,    1000, 25),
  new Monster(`e`, `elf`,                           5,    3,   3,  0,  15,   50,    25,      33, 26),
  new Monster(`g`, `gelatinous cube`,               5,    9,   3,  0,   3,    0,    24,      43, 27),
  new Monster(`m`, `metamorph`,                     6,    9,   3,  0,   3,    0,    32,      40, 28),
  new Monster(`v`, `vortex`,                        6,    5,   4,  0,   3,    0,    33,      53, 29),
  new Monster(`z`, `ziller`,                        6,   15,   3,  0,   3,    0,    34,      33, 30),
  new Monster(`F`, `violet fungus`,                 6,   12,   3,  0,   3,    0,    39,      90, 31),
  new Monster(`W`, `wraith`,                        6,    3,   1,  6,   3,    0,    36,     300, 32),
  new Monster(`f`, `forvalaka`,                     6,    3,   5,  0,   7,    0,    55,     270, 33),
  new Monster(`l`, `lama nobe`,                     7,   14,   7,  0,   6,    0,    36,      70, 34),
  new Monster(`o`, `osequip`,                       7,    4,   7, 16,   4,    0,    36,      90, 35),
  new Monster(`r`, `rothe`,                         7,   15,   5,  0,   3,  100,    53,     230, 36),
  new Monster(`X`, `xorn`,                          7,    6,   7,  0,  13,    0,    63,     290, 37),
  new Monster(`V`, `vampire`,                       7,    5,   4,  6,  17,    0,    55,     950, 38),
  new Monster(`I`, `invisible stalker`,             7,    5,   6,  0,   5,    0,    55,     330, 39),
  new Monster(`p`, `poltergeist`,                   8,    1,   8,  0,   3,    0,    55,     430, 40),
  new Monster(`q`, `disenchantress`,                8,    3,   1,  9,   3,    0,    57,     500, 41),
  new Monster(`s`, `shambling mound`,               8,   13,   5,  0,   6,    0,    47,     390, 42),
  new Monster(`y`, `yellow mold`,                   8,   12,   4,  0,   3,    0,    37,     240, 43),
  new Monster(`U`, `umber hulk`,                    8,    6,   7, 11,  14,    0,    67,     600, 44),
  new Monster(`k`, `gnome king`,                    9,   -1,  10,  0,  18, 2000,   120,    3000, 45),
  new Monster(`M`, `mimic`,                         9,    9,   7,  0,   8,    0,    57,     100, 46),
  new Monster(`w`, `water lord`,                    9,  -10,  15,  7,  20,    0,   155,   15000, 47),
  new Monster(`D`, `bronze dragon`,                 9,    5,   9,  3,  16,  300,    90,    4000, 48),
  new Monster(`D`, `green dragon`,                  9,    4,   4, 10,  15,  200,    80,    2500, 49),
  new Monster(`P`, `purple worm`,                   9,   -1,  13,  0,   3,  100,   130,   15000, 50),
  new Monster(`x`, `xvart`,                         9,   -2,  14,  0,  13,    0,   100,    1000, 51),
  new Monster(`n`, `spirit naga`,                  10,  -20,  15, 12,  23,    0,   100,   20000, 52),
  new Monster(`D`, `silver dragon`,                10,   -4,  10,  3,  20,  700,   110,   10000, 53),
  new Monster(`D`, `platinum dragon`,              10,   -7,  15, 13,  22, 1000,   150,   25000, 54),
  new Monster(`u`, `green urchin`,                 10,   -5,  12,  0,   3,    0,    95,    5000, 55),
  new Monster(`D`, `red dragon`,                   10,   -4,  13,  3,  19,  800,   120,   14000, 56),
  //   
  new Monster(OEMPTY.char, `type I demon lord`,    12,  -40,  20,  3,  20,    0,   150,   50000, 57),
  new Monster(OEMPTY.char, `type II demon lord`,   13,  -45,  25,  5,  22,    0,   200,   75000, 58),
  new Monster(OEMPTY.char, `type III demon lord`,  14,  -50,  30,  9,  24,    0,   250,  100000, 59),
  new Monster(OEMPTY.char, `type IV demon lord`,   15,  -55,  35, 11,  26,    0,   300,  125000, 60),
  new Monster(OEMPTY.char, `type V demon lord`,    16,  -60,  40, 13,  28,    0,   350,  150000, 61),
  new Monster(OEMPTY.char, `type VI demon lord`,   17,  -65,  45, 13,  30,    0,   400,  175000, 62),
  new Monster(OEMPTY.char, `type VII demon lord`,  18,  -70,  50,  6,  32,    0,   450,  200000, 63),
  new Monster(OEMPTY.char, `demon prince`,         19, -100,  80,  6,  40,    0,  1000,  500000, 64),
  new Monster(OEMPTY.char, `God of Hellfire`,      20, -127, 127,  6, 100,    0, 32767, 1000000, 65),

  // JXK: Starting values only. All these attributes need to be reviewed for balance. 
  // JXK: Do we want them to have the benefits of demons? 
  new Monster(`!`, `Earth Guardian`,               22,  -50, 100, 6,  10,     0, 5000, 10000000, 66),
  new Monster(`!`, `Air Guardian`,                 22,  -70,  80, 6,  50,     0, 3000, 10000000, 67),
  new Monster(`!`, `Fire Guardian`,                22,  -70,  80, 6,  50,     0, 3000, 10000000, 68),
  new Monster(`!`, `Water Guardian`,               22,  -70,  80, 6,  50,     0, 3000, 10000000, 69),
  new Monster(`!`, `Time Guardian`,                23,  -100, 80, 6, 110,     0, 3000, 10000000, 70),
  new Monster(`!`, `Ethereal Guardian`,            23,  -150, 80, 6, 110,     0, 2500, 20000000, 71),
  //
  new Monster(`*`, `Apprentice`,                   24,  -200,150, 6, 120,     0, 5000, 30000000, 72),
  new Monster(`#`, `Master`,                       25,  -250,200, 6, 120,     0,10000, 50000000, 73),
  new Monster(`P`, `Lost Wizard`,                  30,  -275,250, 6, 150,     0,50000,100000000, 74)
];

const demonchar = [`1`,`2`,`3`,`4`,`5`,`6`,`7`,`9`,`0`];

/* defines for the monsters as objects */
const BAT = 1;
const LEMMING = 1;
const GNOME = 2;
const HOBGOBLIN = 3;
const JACKAL = 4;
const KOBOLD = 5;
const ORC = 6;
const SNAKE = 7;
const CENTIPEDE = 8;
const JACULI = 9;
const TROGLODYTE = 10;
const ANT = 11;
const EYE = 12;
const LEPRECHAUN = 13;
const NYMPH = 14;
const QUASIT = 15;
const RUSTMONSTER = 16;
const ZOMBIE = 17;
const ASSASSINBUG = 18;
const BUGBEAR = 19;
const BITBUG = 19;
const HELLHOUND = 20;
const ICELIZARD = 21;
const CENTAUR = 22;
const TROLL = 23;
const YETI = 24;
const WHITEDRAGON = 25;
const ELF = 26;
const CUBE = 27;
const METAMORPH = 28;
const VORTEX = 29;
const ZILLER = 30;
const VIOLETFUNGI = 31;
const WRAITH = 32;
const FORVALAKA = 33;
const LAWLESS = 34;
const LAMANOBE = 34;
const OSEQUIP = 35;
const ROTHE = 36;
const XORN = 37;
const VAMPIRE = 38;
const INVISIBLESTALKER = 39;
const POLTERGEIST = 40;
const DISENCHANTRESS = 41;
const SHAMBLINGMOUND = 42;
const YELLOWMOLD = 43;
const UMBERHULK = 44;
const GNOMEKING = 45;
const MIMIC = 46;
const WATERLORD = 47;
const BRONZEDRAGON = 48;
const GREENDRAGON = 49;
const PURPLEWORM = 50;
const XVART = 51;
const SPIRITNAGA = 52;
const SILVERDRAGON = 53;
const PLATINUMDRAGON = 54;
const GREENURCHIN = 55;
const REDDRAGON = 56;
const DEMONLORD = 57;
const DEMONPRINCE = 64;
const LUCIFER = 65;
const EARTHGUARDIAN = 66;
const AIRGUARDIAN = 67;
const FIREGUARDIAN = 68;
const WATERGUARDIAN = 69;
const TIMEGUARDIAN = 70;
const ETHEREALGUARDIAN = 71;
const APPRENTICE = 72;
const MASTER = 73;
const POLINNEAUS = 74;
