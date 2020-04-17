'use strict';

function learnSpell(spell) {
  //debug(`learning ${spell} ${spelcode.indexOf(spell)}`)
  var spellIndex = spelcode.indexOf(spell);
  player.knownSpells[spellIndex] = spell;
  return spellIndex;
}



function forgetSpell(spellnum) {
  player.knownSpells[spellnum] = null;
}



var newSpellCode = null;

/* JXK: This is a hack for the "combine" spell. 
        There are nicer ways to get this input.
        TODO: Update! */
var mergeObjectIndex = -1;


function pre_cast() {
  cursors();
  nomove = 1;
  if (player.SPELLS > 0) {
    updateLog(`Enter your spell: `);
    setCharCallback(cast);
  } else {
    updateLog(`You don't have any spells!`);
  }
}



function matchesSpell(spell) {
  for (var i = 0; i < spelcode.length; i++) {
    if (spelcode[i] === spell) return true;
  }
  return false;
}



function getSpellCode(key, showAllSpells) {
  if (key == 'I' || key == ` `) {
    seemagic(true, showAllSpells);
    setCharCallback(parse_see_spells);
    return 0;
  }
  if (key == DEL && newSpellCode && newSpellCode.length >= 1) {
    newSpellCode = newSpellCode.substring(0, newSpellCode.length - 1);
    var line = deleteLog();
    updateLog(line.substring(0, line.length - 1));
    return 0;
  }
  if (key == ESC) {
    appendLog(`  aborted`);
    newSpellCode = null;
    return 1;
  }
  if (!(isalpha(key) || matchesSpell(key))) {
    return 0;
  }
  if (!newSpellCode) newSpellCode = ``;
  newSpellCode += key;
  appendLog(key);
  if (newSpellCode.length < 3) {
    return 0;
  } else {
    return newSpellCode;
  }
}


function cast(key) {
  nomove = 1;

  // keep adding to newSpellCode until it's 3 letters
  // this part is the same as wish(key) in action.js
  var codeCheck = getSpellCode(key, false);
  if (codeCheck !== newSpellCode) {
    return codeCheck;
  }
  var spellnum = player.knownSpells.indexOf(newSpellCode.toLowerCase());
  if (spellnum < 39) {
    player.setSpells(player.SPELLS - 1);
  }
  else {
    // casting a high level spell
    // if has less than 10 spells, cannot cast
    if (player.SPELLS - 10 < 0) {
      nomove = 0;
      updateLog(` You do not have enough energy `);
      newSpellCode = null;
      return 1;
    }
    else {
      player.setSpells(player.SPELLS - 10);
    }
  }
  player.SPELLSCAST++;
  if (spellnum >= 0) {
    speldamage(spellnum);
  } else {
    nomove = 0;
    updateLog(`  Nothing Happened `);
  }
  newSpellCode = null;
  return 1;
}



/*
 *  speldamage(x)       Function to perform spell functions cast by the player
 *      int x;
 *
 *  Enter with the spell number, returns no value.
 *  Please insure that there are 2 spaces before all messages here
 */
function speldamage(x) {
  /* no such spell */
  //if (x >= SPNUM) return;

  /* not if time stopped */
  if (player.TIMESTOP) {
    updateLog(`  It didn't seem to work`);
    return;
  }

  var playerLev = player.LEVEL;
  if ((rnd(23) == 7) || (rnd(18) > player.INTELLIGENCE)) {
    nomove = 0;
    updateLog(`  It didn't work!`);
    return;
  }
  if (playerLev * 3 + 2 < x) {
    nomove = 0;
    updateLog(`  Nothing happens.  You seem inexperienced at this`);
    return;
  }

  nomove = 0;

  switch (x) {
    /* ----- LEVEL 1 SPELLS ----- */

    case 0:
      /* protection field +2 */
      player.updateProtectionTime(250);
      return;

    case 1:
      /* magic missile */
      prepare_direction_event(spell_magic_missile);
      return;

    case 2:
      /* dexterity   */
      player.updateDexCount(400);
      return;

    case 3:
      /* sleep */
      prepare_direction_event(spell_sleep);
      return;

    case 4:
      /* charm monster */
      player.updateCharmCount(player.CHARISMA << 1);
      return;

    case 5:
      /* sonic spear */
      prepare_direction_event(spell_sonic_spear);
      return;

      /* ----- LEVEL 2 SPELLS ----- */

    case 6:
      /* web */
      prepare_direction_event(spell_web);
      return;

    case 7:
      /* strength */
      player.updateStrCount(150 + rnd(100));
      return;

    case 8: {
      /* enlightenment */
      let yl = Math.max(0, player.y - 5);
      let yh = Math.min(MAXY, player.y + 6);
      let xl = Math.max(0, player.x - 15);
      let xh = Math.min(MAXX, player.x + 16);
      for (let i = xl; i < xh; i++)
        for (let j = yl; j < yh; j++)
          player.level.know[i][j] = KNOWALL;
      return;
    }

    case 9:
      /* healing */
      player.raisehp(20 + (playerLev << 1));
      return;

    case 10:
      /* cure blindness */
      if (player.BLINDCOUNT)
        player.BLINDCOUNT = 1;
      return;

    case 11:
      /* create monster */
      createmonster(makemonst(level + 1) + 8);
      return;

    case 12:
      /* phantasmal forces */
      prepare_direction_event(spell_phantasmal);
      return;

    case 13:
      /* invisibility */
      var amuletmodifier = 0;
      var amulet = isCarrying(OAMULET);
      /* if he has the amulet of invisibility then add more time */
      if (amulet) {
        amuletmodifier += 1 + amulet.arg;
      }
      player.updateInvisibility((amuletmodifier << 7) + 12);
      return;

      /* ----- LEVEL 3 SPELLS ----- */

    case 14:
      /* fireball */
      prepare_direction_event(spell_fireball);
      return;

    case 15:
      /* cold */
      prepare_direction_event(spell_cold);
      return;

    case 16:
      /* polymorph */
      prepare_direction_event(spell_polymorph);
      return;

    case 17:
      /* cancellation */
      player.updateCancellation(5 + playerLev);
      return;

    case 18:
      /* haste self */
      player.updateHasteSelf(7 + playerLev);
      return;

    case 19:
      /* cloud kill */
      omnidirect(x, 30 + rnd(10), `gasps for air`);
      return;

    case 20: {
      /* vaporize rock */
      let xh = Math.min(player.x + 1, MAXX - 2);
      let yh = Math.min(player.y + 1, MAXY - 2);
      for (let i = Math.max(player.x - 1, 1); i <= xh; i++) {
        for (let j = Math.max(player.y - 1, 1); j <= yh; j++) {
          let item = itemAt(i, j);
          if (item.matches(OWALL)) {
            /* can't vpr below V2 */
            if (level < VBOTTOM - (ULARN ? 2 : 0)) {
              setItem(i, j, OEMPTY);
            }
          } else if (item.matches(OSTATUE)) {
            let doCrumble = getDifficulty() < 3;
            if (ULARN) doCrumble = getDifficulty() <= 3 && rnd(60) < 30;
            if (doCrumble) {
              setItem(i, j, createObject(OBOOK, level));
            }
          } else if (item.matches(OTHRONE)) {
            if (item.arg == 0) {
              create_guardian(GNOMEKING, i, j);
              item.arg = 1; // nullify the throne
            }
          } else if (item.matches(OALTAR)) {
            create_guardian(DEMONPRINCE, i, j);
            if (ULARN) {
              createmonster(DEMONPRINCE);
              createmonster(DEMONPRINCE);
              createmonster(DEMONPRINCE);
            }
          } else if (!ULARN && item.matches(OFOUNTAIN)) {
            create_guardian(WATERLORD, i, j);
          } else if (monsterAt(i, j) && monsterAt(i, j).matches(XORN)) {
            ifblind(i, j);
            hitm(i, j, 200);
          } else if (ULARN && monsterAt(i, j) && monsterAt(i, j).matches(TROLL)) {
            ifblind(i, j);
            hitm(i, j, 200);
          }
          player.level.know[i][j] = KNOWALL; // HACK fix for black tile
        }
      }

      updateWalls(player.x, player.y, 2);

      return;
    }

    /* ----- LEVEL 4 SPELLS ----- */

    case 21:
      /* dehydration */
      prepare_direction_event(spell_dry);
      return;

    case 22:
      /* lightning */
      prepare_direction_event(spell_lightning);
      return;

    case 23:
      /* drain life */
      prepare_direction_event(spell_drain);
      return;

    case 24:
      /* globe of invulnerability */
      if (player.GLOBE == 0) player.setMoreDefenses(player.MOREDEFENSES + 10);
      player.GLOBE += 200;
      loseint();
      return;

    case 25:
      /* flood */
      omnidirect(x, 32 + playerLev, `struggles for air in your flood!`);
      return;

    case 26:
      /* finger of death */
      if (rnd(151) != 63) {
        prepare_direction_event(spell_finger);
      } else {
        beep();
        updateLog(`  Your heart stopped!`);
        //nap(4000);
        died(DIED_WAYWARD_FINGER, false); /* erased by a wayward finger */
      }
      return;

      /* ----- LEVEL 5 SPELLS ----- */

    case 27:
      /* scare monster */
      player.updateScareMonst(rnd(10) + playerLev);
      if (isCarrying(OHANDofFEAR)) {
        player.SCAREMONST *= 3;
      }
      return;

    case 28:
      /* hold monster */
      player.updateHoldMonst(rnd(10) + playerLev);
      return;

    case 29:
      /* time stop */
      player.updateTimeStop(rnd(20) + (playerLev << 1));
      return;

    case 30:
      /* teleport away */
      prepare_direction_event(spell_teleport);
      return;

    case 31:
      /* magic fire */
      omnidirect(x, 35 + rnd(10) + playerLev, `cringes from the flame`);
      return;

      /* ----- LEVEL 6 SPELLS ----- */

    case 32:
      /* make wall */
      prepare_direction_event(spell_makewall);
      return;

    case 33:
      /* sphere of annihilation */
      if (!isCarrying(OSPHTALISMAN) && (rnd(23) == 5)) {
        //beep();
        updateLog(`You have been enveloped by the zone of nothingness!`);
        //nap(4000);
        died(DIED_ANNIHILATED_SELF, false); /* self - annihilated */
        return;
      }
      loseint();
      prepare_direction_event(spell_sphere);
      return;
      //
    case 34:
      /* genocide */
      updateLog(`Genocide what monster? `);
      setCharCallback(genmonst);
      if (!wizard)
        forgetSpell(GEN); /* forget */
      loseint();
      return;

    case 35: {
      /* summon demon */
      if (rnd(100) > 30) {
        prepare_direction_event(spell_summon);
      } else if (rnd(100) > 15) {
        updateLog(`  Nothing seems to have happened`);
      } else {
        updateLog(`  The demon turned on you and vanished!`);
        beep();
        let i = rnd(40) + 30;
        lastnum = DIED_DEMON; /* attacked by a revolting demon */
        player.losehp(i);
      }
      return;
    }

    case 36:
      /* walk through walls */
      player.updateWTW(rnd(10) + 5);
      return;

    case 37: {
      /* alter reality */
      var savemon = [];
      var saveitm = [];
      var empty = OEMPTY;
      let i, j;
      for (j = 0; j < MAXY; j++) {
        for (i = 0; i < MAXX; i++) /* save all items and monsters */ {
          let item = itemAt(i, j);
          let monster = monsterAt(i, j);
          if (!item.matches(OEMPTY) && !item.matches(OWALL) &&
            !item.matches(OANNIHILATION) && !item.matches(OHOMEENTRANCE)) {
            saveitm.push(item);
          }
          if (monster) {
            savemon.push(monster);
          }
          if (level != 0) {
            setItem(i, j, OWALL);
          } else {
            setItem(i, j, OEMPTY);
          }
          player.level.monsters[i][j] = null;
          if (wizard)
            player.level.know[i][j] = KNOWALL;
          else
            player.level.know[i][j] = 0;
        }
      }
      if (level != 0) eat(1, 1);
      if (level == 1)
        setItem(33, MAXY - 1, createObject(OHOMEENTRANCE));
      for (j = rnd(MAXY - 2), i = 1; i < MAXX - 1; i++) {
        // JRP: I'm not sure why we do this, but it's in the original code
        setItem(i, j, empty);
      }
      /* put objects back in level */
      while (saveitm.length > 0) {
        let item = saveitm.pop();
        fillroom(item, item.arg);
      }
      /* put monsters back in */
      while (savemon.length > 0) {
        let monster = savemon.pop();
        fillmonst(monster.arg);
      }
      loseint();
      if (!wizard)
        forgetSpell(ALT); /* forget */
      positionplayer();
      /* 12.4.5
      the last hit monster is probably somewhere else now
      */
      lasthx = 0;
      lasthy = 0;

      updateWalls();

      return;
    }

    case 38:
      /* permanence */
      adjtime(-99999);
      if (!wizard)
        forgetSpell(PER); /* forget */
      loseint();
      return;
 
      /* ----- LEVEL 7 SPELLS ----- */

    case 39:
      /* portal */
      newcavelevel(0);
      positionplayer();
      return;

    case 40:
      /* combine */
      setCharCallback(spell_combine);
      updateLog(`Enter your items (press <b>space</b> to show):`);
      return;

    case 41:
      /* break */
      let xh = Math.min(player.x + 1, MAXX - 2);
      let yh = Math.min(player.y + 1, MAXY - 2);
      for (let i = Math.max(player.x - 1, 1); i <= xh; i++) {
        for (let j = Math.max(player.y - 1, 1); j <= yh; j++) {
          let item = itemAt(i, j);
          if (item.matches(OWALL)) {
            setItem(i, j, OEMPTY);
          } else if (item.matches(OSTATUE)) {
              setItem(i, j, createObject(OBOOK, level));
          } else if (item.matches(OTHRONE)) {
              setItem(i, j, OEMPTY);
          } else if (item.matches(OALTAR)) {
              setItem(i,j, OEMPTY);
          } else if (item.matches(OFOUNTAIN)) {
              setItem(i,j, OEMPTY);
          }
          player.level.know[i][j] = KNOWALL; // HACK fix for black tile
        }
      }
      updateWalls(player.x, player.y, 2);
      omnidirect(x, 500, `is tossed around by the earthquake`);
      return;

    case 42:
      /* desiccate */
      omnidirect(x, 1000, `is mummified by a shrill wind`);
      return;

    case 43:
      /* burn */
      prepare_direction_event(spell_burn);
      return;

    case 44:
      /* freeze */
      prepare_direction_event(spell_freeze);
      return;

    case 45: 
      /* time stop monster */
      player.updateStopMonst(rnd(20) + (playerLev << 1));
      return;

    case 46:
      /* ghost */
      //player.updateWTW(50);
      // WTW now managed via INVUN
      if (player.INVUN == 0) player.setMoreDefenses(player.MOREDEFENSES + 999);
      player.INVUN += 50;
      return;
    
    case 47:
      /* rebound */
      player.REBOUND += 50;
      return;
    
    default:
      nomove = 0;
      appendLog(`  spell ${x} not available!`);
      beep();
      return;
  }
}



/* it would be nice to have these methods closer to the
spells they are for, but they need to be at the top level
for firefox compatibility */

function spell_magic_missile(direction) {
  var damage = rnd(((player.LEVEL + 1) << 1)) + player.LEVEL + 3;
  setup_godirect(100, MLE, direction, damage, '+');
}

function spell_sleep(direction) {
  var hits = rnd(3) + 1;
  direct(SLE, direction, fullhit(hits), hits);
}

function spell_sonic_spear(direction) {
  var damage = rnd(10) + 15 + player.LEVEL;
  setup_godirect(70, SSP, direction, damage, '@');
}

function spell_web(direction) {
  var hits = rnd(3) + 2;
  direct(WEB, direction, fullhit(hits), hits);
}

function spell_phantasmal(direction) {
  if (rnd(11) + 7 <= player.WISDOM) {
    direct(PHA, direction, rnd(20) + 20 + player.LEVEL, 0)
  } else {
    updateLog(`  It didn't believe the illusions!`);
  }
}

function spell_fireball(direction) {
  var damage = rnd(25 + player.LEVEL) + 25 + player.LEVEL;
  setup_godirect(40, BAL, direction, damage, '*');
}

function spell_cold(direction) {
  var damage = rnd(25) + 20 + player.LEVEL;
  setup_godirect(60, CLD, direction, damage, 'O');
}

function spell_dry(direction) {
  direct(DRY, direction, 100 + player.LEVEL, 0);
}

function spell_lightning(direction) {
  var damage = rnd(25) + 20 + (player.LEVEL << 1);
  setup_godirect(10, LIT, direction, damage, '~');
}

function spell_drain(direction) {
  var damage = Math.min(player.HP - 1, player.HPMAX / 2);
  direct(DRL, direction, damage + damage, 0);
  player.losehp(Math.round(damage));
}

function spell_finger(direction) {
  if (player.WISDOM > rnd(10) + 10) {
    direct(FGR, direction, 2000, 0);
  } else {
    updateLog(`  It didn't work`);
  }
}

function spell_makewall(direction) {
  makewall(direction);
}

function spell_sphere(direction) {
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  newsphere(x, y, direction, rnd(20) + 11, level); /* make a sphere */
  newsphereflag = true;
}

function spell_summon(direction) {
  direct(SUM, direction, 150, 0);
}



/*
 *  dirpoly(spnum)      Routine to ask for a direction and polymorph a monst
 *      int spnum;
 *
 *  Subroutine to polymorph a monster and ask for the direction its in
 *  Enter with the spell number in spmun.
 *  Returns no value.
 */
function spell_polymorph(direction) {
  //if (spnum < 0 || spnum >= SPNUM) return; /* bad args */

  if (isconfuse())
    return; /* if he is confused, he can't aim his magic */

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var monster = getMonster(direction);
  if (!monster) {
    updateLog(`  There wasn't anything there!`);
    return;
  }

  ifblind(x, y);

  if (nospell(PLY, monster) == 0) {
    player.level.monsters[x][y] = null;
    createmonster(rnd(monsterlist.length - 1), x, y);
    show1cell(x, y); /* show the new monster */
  } else {
    lasthx = x;
    lasthy = y;
  }
}



/*
 *  tdirect(spnum)      Routine to teleport away a monster
 *      int spnum;
 *
 *  Routine to ask for a direction to a spell and then teleport away monster
 *  Enter with the spell number that wants to teleport away
 *  Returns no value.
 */
function spell_teleport(direction) {
  //if (spnum < 0 || spnum >= SPNUM) return; /* bad args */
  if (isconfuse()) return;

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  var monster = getMonster(direction);
  if (!monster) {
    updateLog(`  There wasn't anything there!`);
    return;
  }
  ifblind(x, y);
  if (nospell(TEL, monster) == 0) {
    fillmonst(monster.arg);
    player.level.monsters[x][y] = null;
    player.level.know[x][y] &= ~KNOWHERE;

    /* 12.4.5
    fix for last hit monster chasing the player from across the maze
    caused by hitting monster, teleporting it away, then a new monster
    appears in the same spot
    */
    lasthx = 0;
    lasthy = 0;

  } else {
    lasthx = x;
    lasthy = y;
    return;
  }
}

/* Forest of Larn spells */
function spell_combine(index) {
  //no move = 1;
  if (index == '*' || index == ' ' || index == 'I') {
    if (mazeMode) {
      showinventory(true,spell_combine,showall, false, false, true); 
    } else {
      setMazeMode(true);
    }
    return 0;
  }

  if (index == '.') {
    // Can not yet combine gold
    setMazeMode(true);
    updateLog(`You can't combine gold! `);    

    //updateLog(`How much gold will you use? `);
    // Lose the amount of gold
    return 1;
  }
        
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];

  if (!item) {
    if (useindex >= 0 && useindex < 26) {
      updateLog(`  You do not have item ${index}`);
    }
    if (useindex <= -1) {
      appendLog(` cancelled`);
    }
    setMazeMode(true);
    return 1;
  }


  if (mergeObjectIndex == -1) {
     mergeObjectIndex = useindex;
  }
  else {
    var itemA = player.inventory[mergeObjectIndex];

    updateLog(` The ${itemA} and ${item} have been combined!`);

    if (itemA.id == item.id) {
      // create new item with combined stats
      destroyInventory(itemA);
      destroyInventory(item);
      // extra + 1 to account for the invisible +0 that actually gives +1
      itemA.arg += item.arg + 1; 
      updateLog(` You have created a ${itemA}`);
      take(createObject(itemA));
    }
    else if (((itemA.id == OSLAYER.id)  && (item.id == OLANCE.id)) || ((itemA.id == OLANCE.id) && (item.id == OSLAYER.id))) {
      updateLog(` You have created The Destroyer!`);
      destroyInventory(itemA);
      destroyInventory(item);
      take(createObject(ODESTROYER));
      // produce destroyer /
    } 
    else if (((itemA.id == ODESTROYER.id) && (item.id == OSWORDofSLASHING.id)) || ((item.id == ODESTROYER.id) && (itemA.id == OSWORDofSLASHING.id))) {
      updateLog(` You have created Flawless!`);
      destroyInventory(itemA);
      destroyInventory(item);
      take(createObject(OFLAWLESS)); 
    }
    else {
      updateLog(` The items spark and explode!`);
      // destroy both items
      destroyInventory(itemA);
      destroyInventory(item);
    }

    // reset the merge index for the next time
    mergeObjectIndex = -1;
    setMazeMode(true);
    return 1;
  } 
 
  return 0;
}

function spell_burn(direction) {
  /* upgraded version of BAL. Creates a stream of flame in a direction.
     Monsters immune to BAL are damaged by this flame. */ 
  var damage = rnd(1000 + player.LEVEL) + 750;
  setup_godirect(20, BRN, direction, damage, '<');
}

function spell_freeze(direction) {
  /* upgraded version of CLD. Cretes a ray of frost in a direction.
     Monsters immune to CLD are damaged by this ray. */
  var damage = rnd(750 + player.LEVEL) + 1000;
  setup_godirect(20, FRZ, direction, damage, '^');
}


/*
    Create a guardian for a throne/altar/fountain, as a result of the player
    using a VPR spell or pulverization scroll on it.
*/
function create_guardian(monst, x, y) {
  /* prevent the guardian from being created on top of the player */
  if ((x == player.x) && (y == player.y)) {
    var k = rnd(8);
    x += diroffx[k];
    y += diroffy[k];
  }
  player.level.know[x][y] = 0;
  if (!isGenocided(monst))
    createmonster(monst, x, y);

  // 12.4.5: not in original, but maybe a good idea?
  // if (monsterAt(x,y)) {
  //   monsterAt(x,y).awake = true;
  // }
}



/*
 *  Routine to subtract 1 from your int (intelligence) if > 3
 *
 *  No arguments and no return value
 */
function loseint() {
  player.setIntelligence(player.INTELLIGENCE - 1);
}



/*
 *  isconfuse()         Routine to check to see if player is confused
 *
 *  This routine prints out a message saying `You can't aim your magic!`
 *  returns 0 if not confused, non-zero (time remaining confused) if confused
 */
function isconfuse() {
  if (player.CONFUSE) {
    updateLog(`  You can't aim your magic!`);
    beep();
  }
  return (player.CONFUSE > 0);
}



/*
 *  nospell(x,monst)    Routine to return 1 if a spell doesn't affect a monster
 *      int x,monst;
 *
 *  Subroutine to return 1 if the spell can't affect the monster
 *    otherwise returns 0
 *  Enter with the spell number in x, and the monster number in monst.
 */
function nospell(x, monst) {
  var tmp = spelweird[monst.arg - 1][x];
  //if (x >= SPNUM || monst >= MAXMONST + 8 || monst < 0 || x < 0) return (0); /* bad spell or monst */
  if (tmp == 0) {
    return (0);
  }
  cursors();
  updateLog(spelmes[tmp](monst));
  return (1);
}



/*
 *  fullhit(xx)     Function to return full damage against a monster (aka web)
 *      int xx;
 *
 *  Function to return hp damage to monster due to a number of full hits
 *  Enter with the number of full hits being done
 */
function fullhit(xx) {
  if (xx < 0 || xx > 20) return (0); /* fullhits are out of range */
  if (level <= VBOTTOM) {
    if (player.WIELD && player.WIELD.matches(OLANCE)) return (10000); /* lance of death */
  }
  else {
    if (player.WIELD && player.WIELD.matches(OLANCE)) return (100); /* the monsters in the forest are tough! */
  }
  var i = xx * ((player.WCLASS >> 1) + player.STRENGTH + player.STREXTRA - getDifficulty() - 12 + player.MOREDAM);
  return ((i >= 1) ? i : xx);
}



/*
 *  direct(spnum,dam,str,arg)   Routine to direct spell damage 1 square in 1 dir
 *      int spnum,dam,arg;
 *      char *str;
 *
 *  Routine to ask for a direction to a spell and then hit the monster
 *  Enter with the spell number in spnum, the damage to be done in dam,
 *    lprintf format string in str, and lprintf's argument in arg.
 *  Returns no value.
 */
function direct(spnum, direction, dam, arg) {
  //if (spnum < 0 || spnum >= SPNUM || str == 0) return; /* bad arguments */
  if (isconfuse()) {
    return;
  }
  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];

  var monster = getMonster(direction);
  var item = getItemDir(direction);

  if (!monster && !item.matches(OMIRROR)) {
    updateLog(`  There wasn't anything there!`);
    return;
  }

  var str = attackmessage[spnum];

  if (item.matches(OMIRROR) && !monster) {
    if (spnum == SLE) /* sleep */ {
      updateLog(`  You fall asleep! `);
      beep();
      arg += 2;
      while (arg-- > 0) {
        parse2();
        //nap(1000);
      }
      return;
    } else if (spnum == WEB) /* web */ {
      updateLog(`  You get stuck in your own web! `);
      beep();
      arg += 2;
      while (arg-- > 0) {
        parse2();
        //nap(1000);
      }
      return;
    } else {
      lastnum = DIED_OWN_MAGIC; /* hit by own magic */
      updateLog(str(`spell caster (that's you)`));
      beep();
      player.losehp(dam);
      return;
    }
  }
  ifblind(x, y);
  if (nospell(spnum, monster) == 0) {
    updateLog(str(monster, arg));
    hitm(x, y, dam);
  } else {
    lasthx = x;
    lasthy = y;
    return;
  }
}



function setup_godirect(delay, spnum, direction, damage, cshow, stroverride) {
  napping = true;
  nomove = 1;
  setTimeout(godirect, delay, spnum, player.x, player.y, diroffx[direction], diroffy[direction], damage, delay, cshow, stroverride);
  // // might need this for IE compatibility? so far so good though
  // setTimeout(
  //   function() {
  //     godirect(spnum, player.x, player.y, diroffx[direction], diroffy[direction], damage, delay, cshow, stroverride);
  //   }
  // );
}



/*
 *  Function to perform missile attacks
 *
 *  Function to hit in a direction from a missile weapon and have it keep
 *  on going in that direction until its power is exhausted
 *  Enter with the spell number in spnum, the power of the weapon in hp,
 *    lprintf format string in str, the # of milliseconds to delay between
 *    locations in delay, and the character to represent the weapon in cshow.
 *  Returns no value.
 */
function godirect(spnum, x, y, dx, dy, dam, delay, cshow, stroverride) {

  if (isconfuse()) {
    exitspell();
    return;
  }

  //debug(`${x}, ${y}: ${dam}`);

  // clear the previous square
  if (x != player.x || y != player.y) {
    cursor(x + 1, y + 1);
    if (amiga_mode) {
      lprc(` `);
    } else {
      lprc(itemAt(x, y).getChar());
    }
  }

  x += dx;
  y += dy;
  if ((x > MAXX - 1) || (y > MAXY - 1) || (x < 0) || (y < 0)) {
    dam = 0;
    exitspell();
    return;
  } /* out of bounds */

  /* if energy hits player */
  if (x == player.x && y == player.y) {
    cursors();
    updateLog(`  You are hit by your own magic!`);

    lastnum = DIED_OWN_MAGIC;
    player.losehp(dam);
    exitspell();
    return;
  }

  /* if not blind show effect */
  if (player.BLINDCOUNT == 0) {
    cursor(x + 1, y + 1);
    lprc(cshow);
    //nap(delay);
    show1cell(x, y);
  }

  var monster = monsterAt(x, y);
  var item = itemAt(x, y);
  var str = stroverride || attackmessage[spnum];

  /* is there a monster there? */
  if (monster) {
    ifblind(x, y);

    /* cannot cast a missile spell at lucifer!! */
    if (ULARN && (monster.matches(LUCIFER) || (monster.isDemon() && rnd(100) < 10))) {
      dx *= -1;
      dy *= -1;
      cursors();
      updateLog(`  the ${monster} returns your puny missile!`);
    } else {
      if (nospell(spnum, monster)) {
        lasthx = x;
        lasthy = y;
        exitspell();
        return;
      }

      cursors();
      updateLog(str(monster));
      dam -= hitm(x, y, dam);
      show1cell(x, y);
      //nap(1000);

      x -= dx;
      y -= dy;
    }
  } else if (item.matches(OWALL)) {
    cursors();
    updateLog(str(`wall`));
    if ( /* enough damage? */
      dam >= 50 + getDifficulty() &&
      /* not on V3,V4,V5 */
      level < VBOTTOM - (ULARN ? 2 : 0) &&
      x < MAXX - 1 && y < MAXY - 1 &&
      x != 0 && y != 0) {
      updateLog(`  The wall crumbles`);
      setItem(x, y, OEMPTY);

      updateWalls(x, y, 1);

    }
    dam = 0;
  } else if (item.matches(OCLOSEDDOOR)) {
    cursors();
    updateLog(str(`door`));
    if (dam >= 40) {
      updateLog(`  The door is blasted apart`);
      setItem(x, y, OEMPTY);
    }
    dam = 0;
  } else if (item.matches(OSTATUE)) {
    cursors();
    updateLog(str(`statue`));
    if (dam > 44) {
      var doCrumble = getDifficulty() < 3;
      if (ULARN) doCrumble = getDifficulty() <= 3 && rnd(60) < 30;
      if (doCrumble) {
        updateLog(`  The statue crumbles`);
        setItem(x, y, createObject(OBOOK, level));
      }
    }
    dam = 0;
  } else if (item.matches(OTHRONE)) {
    cursors();
    updateLog(str(`throne`));
    var throneStrength = ULARN ? 39 : 33;
    if (dam > throneStrength && item.arg == 0) {
      create_guardian(GNOMEKING, x, y);
      item.arg = 1; // nullify the throne
      show1cell(x, y);
    }
    dam = 0;
  } else if (!ULARN && item.matches(OALTAR)) {
    cursors();
    updateLog(str(`altar`));
    if (dam > 75 - (getDifficulty() >> 2)) {
      create_guardian(DEMONPRINCE, x, y);
      show1cell(x, y);
    }
    dam = 0;
  } else if (!ULARN && item.matches(OFOUNTAIN)) {
    cursors();
    updateLog(str(`fountain`));
    if (dam > 55) {
      create_guardian(WATERLORD, x, y);
      show1cell(x, y);
    }
    dam = 0;
  } else if (item.matches(OMIRROR)) {
    var bounce = 0;
    var odx = dx;
    var ody = dy;

    /* spells may bounce directly back or off at an angle */
    if (rnd(100) < 50) {
      bounce = 1;
      dx *= -1;
    }
    if (rnd(100) < 50) {
      bounce = 1;
      dy *= -1;
    }
    /* guarantee a bounce */
    if (!bounce || (odx == dx && ody == dy)) {
      dx = -odx;
      dy = -ody;
    }
  }

  dam -= 3 + (getDifficulty() >> 1);

  if (dam > 0) {
    nomove = 1;
    blt(); // don't use paint() because it doesn't show missile trail
    setTimeout(godirect, delay, spnum, x, y, dx, dy, dam, delay, cshow, stroverride);
  } else {

    // clear the previous square
    cursor(x + 1, y + 1);
    if (amiga_mode) {
      lprc(` `);
    }

    exitspell();
    return;
  }

}



function exitspell() {
  napping = false;
  nomove = 0;
  gtime++; // this is pretty hacky
  parse2(); // monsters need a chance to attack
  paint();
}



/*
 *  omnidirect(sp,dam,str)   Routine to damage all monsters 1 square from player
 *      int sp,dam;
 *      char *str;
 *
 *  Routine to cast a spell and then hit the monster in all directions
 *  Enter with the spell number in sp, the damage done to wach square in dam,
 *    and the lprintf string to identify the spell in str.
 *  Returns no value.
 */
function omnidirect(spnum, dam, str) {
  //if (spnum < 0 || spnum >= SPNUM || str == 0) return; /* bad args */
  for (var x = player.x - 1; x <= player.x + 1; x++) {
    for (var y = player.y - 1; y <= player.y + 1; y++) {
      var monster = monsterAt(x, y);
      if (monster) {
        if (nospell(spnum, monster) == 0) {
          ifblind(x, y);
          cursors();
          updateLog(`  The ${monster} ${str}`);
          hitm(x, y, dam);
          //player.level.know[x][y] = KNOWALL; // HACK FIX FOR BLACK TILE IF KNOW = 0 in HITM()
          //nap(800);
        } else {
          lasthx = x;
          lasthy = y;
        }
      }
    }
  }
}



function makewall(direction) {
  //if (spnum < 0 || spnum >= SPNUM || str == 0) return; /* bad args */

  if (isconfuse()) return;

  var x = player.x + diroffx[direction];
  var y = player.y + diroffy[direction];
  var item = itemAt(x, y);
  var monster = monsterAt(x, y);

  if (!item || item.matches(OHOMEENTRANCE)) { // not dungeon entrance
    updateLog(`  you can't make a wall there!`);
    return;
  }

  if ((y >= 0) && (y <= MAXY - 1) && (x >= 0) && (x <= MAXX - 1)) { // within bounds
    if (!item.matches(OWALL)) { // not a wall
      if (item.matches(OEMPTY)) { // no other items there
        if (!monster) { // no monsters
          setItem(x, y, createObject(OWALL));
          updateWalls(player.x, player.y, 2);
        } else {
          updateLog(`  there's a monster there!`);
        }
      } else {
        updateLog(`  there's something there already!`);
      }
    } else {
      updateLog(`  there's a wall there already!`);
    }
  }
}



/*
 *  annihilate()    Routine to annihilate all monsters around player (player.x,player.y)
 *
 *  Gives player experience, but no dropped objects
 *  Returns the experience gained from all monsters killed
 */
function annihilate() {
  var k = 0;
  for (var i = player.x - 1; i <= player.x + 1; i++) {
    for (var j = player.y - 1; j <= player.y + 1; j++) {
      var monster = monsterAt(i, j);
      if (monster) {
        /* if a monster there */
        if (!monster.isDemon()) {
          // JRP: Everyone gets an easter egg. This one is mine.
          if (!ULARN && monster.arg == LAWLESS) {
            updateLog(`Lawless resists!`);
          } else {
            k += monster.experience;
            killMonster(i, j);
          }
        } else {
          updateLog(`  The ${monster} barely escapes being annihilated!`);
          monster.hitpoints = (monster.hitpoints >> 1) + 1; /* lose half hit points*/
        }
      }
    }
  }
  if (k > 0) {
    updateLog(`  You hear loud screams of agony!`);
    player.raiseexperience(k);
  }
  return k;
}



function isGenocided(monsterId) {
  return genocide.indexOf(monsterId) >= 0;
}



function setGenocide(monsterId) {
  genocide.push(monsterId);
}



/* Function to ask for monster and genocide from game */
function genmonst(key) {

  if (!isalpha(key)) {
    return 0;
  }

  //bell();

  appendLog(key);

  for (var j = 0; j < monsterlist.length; j++) {
    if (monsterlist[j].char == key && !isGenocided(j)) {
      var monstname;
      if (!(!ULARN && j == LAWLESS)) setGenocide(j); // JRP see below
      switch (j) {
        case JACULI:
          monstname = `jaculi`;
          break;
        case YETI:
          monstname = `yeti`;
          break;
        case ELF:
          monstname = `elves`;
          break;
        case VORTEX:
          monstname = `vortexes`;
          break;
        case VIOLETFUNGI:
          monstname = `violet fungi`;
          break;
        case DISENCHANTRESS:
          monstname = `disenchantresses`;
          break;
        case LAWLESS:
          // JRP: Everyone gets an easter egg. This one is mine.
          if (!ULARN) {
            updateLog(`  Lawless resists!`);
            return 1;
          }
          // lama nobe falls through
          // eslint-disable-next-line no-fallthrough
          default:
            monstname = monsterlist[j] + `s`;
            break;
      }

      updateLog(`  There will be no more ${monstname}`);

      newcavelevel(level); /* now wipe out monsters on this level */
      paint();
      return 1;
    }
  }
  updateLog(`  You sense failure!`);
  return 1;
}

