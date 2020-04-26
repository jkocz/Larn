'use strict';

function setGameConfig() {

    // GAME NAME
    GAMENAME = ULARN ? `Ularn` : `Larn`;

    // TIME
    TIMELIMIT = ULARN ? 40000 : 30000;

    // DUNGEON, VOLCANO and FOREST LEVELS
    MAXLEVEL = ULARN ? 16 : 11;
    MAXVLEVEL = ULARN ? 5 : 3;
    MAXFLEVEL = FOREST ? 10 : 0;
    DBOTTOM = (MAXLEVEL - 1);
    VBOTTOM = (MAXLEVEL + MAXVLEVEL - 1);
    FBOTTOM = (MAXLEVEL + MAXVLEVEL + MAXFLEVEL - 1);

    // MAZES
    LEVELS = new Array(MAXLEVEL + MAXVLEVEL + MAXFLEVEL);
    MAZES = COMMON_MAZES.concat(ULARN ? ULARN_MAZES : LARN_MAZES);

    // ITEMS
    FORTUNES = COMMON_FORTUNES.concat(ULARN ? ULARN_FORTUNES : LARN_FORTUNES);

    // Allow extra MAZES and FORTUNES for the FOREST
    if (FOREST) {
      MAZES = MAZES.concat(FOREST_MAZES);
      FORTUNES = FORTUNES.concat(FOREST_FORTUNES);
    }

    // SETUP MONSTERS, SPELLS and FORTUNES
    if (FOREST) {
      monsterlist = FOREST_monsterlist;
      splev = FOREST_splev;
      spelweird = FOREST_spelweird;
      STORE_INVENTORY = FOREST_STORE_INVENTORY;
    }
    else if (ULARN) {
      monsterlist = ULARN_monsterlist;
      splev = ULARN_splev;
      spelweird = ULARN_spelweird;
      STORE_INVENTORY = ULARN_STORE_INVENTORY;
    } 
    else {
      monsterlist = LARN_monsterlist;
      splev = LARN_splev;
      spelweird = LARN_spelweird;
      STORE_INVENTORY = LARN_STORE_INVENTORY;
    }

    // BUILDINGS
    MAXITM = STORE_INVENTORY.length;

    MAX_BANK_BALANCE = ULARN ? 1000000 : 500000;
    OBANK.desc = `the bank of ${GAMENAME}`;
    OBANK2.desc = `the ${ULARN ? 8 : 5}th branch of the Bank of ${GAMENAME}`;

    OSCHOOL.desc = `the College of ${GAMENAME}`;

    OLRS.desc = `the ${GAMENAME} Revenue Service`;

    if (ULARN) OTRADEPOST.desc = `the Ularn trading Post`;

    if (ULARN) {
        DEATH_REASONS.set(DIED_BOTTOMLESS_TRAPDOOR, `fell through a trap door to HELL`);
        DEATH_REASONS.set(DIED_BOTTOMLESS_PIT, `fell into a pit to HELL`);
    }

}
