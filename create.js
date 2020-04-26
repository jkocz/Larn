'use strict';


/*
    newcavelevel(level)
    int level;

    function to enter a new level.  This routine must be called anytime the
    player changes levels.  If that level is unknown it will be created.
    A new set of monsters will be created for a new level, and existing
    levels will get a few more monsters.
    Note that it is here we remove genocided monsters from the present level.
 */
function newcavelevel(depth) {
  if (level != depth) changedDepth = millis();

  /* 12.4.5
  prevent a rogue monster from starting to move towards the player
  just because it's in the same square as the last hit monster on
  another level
  */
  lasthx = 0;
  lasthy = 0;
  // eslint-disable-next-line no-global-assign
  screen = initGrid(MAXX, MAXY); // in case this was causing weird monster movement

  if (LEVELS[depth]) { // if we have visited this level before
    player.level = LEVELS[depth];
    level = depth;
    sethp(false);
    positionplayer(player.x, player.y, true);
    checkgen();
    return;
  }

  initNewLevel(depth);
  makemaze(depth);

  updateWalls();

  makeobject(depth);
  sethp(true);
  positionplayer(player.x, player.y, true);
  checkgen(); /* wipe out any genocided monsters */

  if (wizard || level == 0)
    for (var j = 0; j < MAXY; j++)
      for (var i = 0; i < MAXX; i++)
        player.level.know[i][j] = KNOWALL;


  /*
  save a checkpoint file to prevent a different random level from being created
  -- disabled in v304 since it's too easy to abuse
  if (depth > 0) {
     saveGame(true);
   }
   */

}



function initNewLevel(depth) {
  var newLevel = Object.create(Level);

  newLevel.items = initGrid(MAXX, MAXY);
  newLevel.monsters = initGrid(MAXX, MAXY);
  newLevel.know = initGrid(MAXX, MAXY);

  LEVELS[depth] = newLevel;
  player.level = newLevel;
  level = depth;
}

/* JXK: Possibly better to not concat FOREST_MAZES in config.js
        Requires less logic here.
*/

function loadcanned(d=0) {
  var mazeindex;

  if (d <= VBOTTOM) {
    // We're not in the forest, use only other mazes
    do {
      mazeindex = rund(MAZES.length - FOREST_MAZES.length);
    } while (USED_MAZES.indexOf(mazeindex) > -1);
    USED_MAZES.push(mazeindex);
    //debug(`loadcanned: used: ` + USED_MAZES);
  }
  else if (d == FBOTTOM) {
    // We're in the bottom level of the forest. Use specific level
    mazeindex = MAZES.length - 1;
    USED_MAZES.push(mazeindex);
  }
  else {
    // We're in the Forest, only use Forest levels
    mazeindex = rInterval(VBOTTOM+1, MAZES.length-2); 
    USED_MAZES.push(mazeindex);
  }
  return MAZES[mazeindex];
}



function cannedlevel(depth) {

  var canned = loadcanned(depth);

  var monsters = player.level.monsters;

  var pt = 0;
  for (var y = 0; y < MAXY; y++) {
    for (var x = 0; x < MAXX; x++) {
      switch (canned[pt++]) {
        case '#':
          setItem(x, y, OWALL);
          break;
        case 'D':
          setItem(x, y, createObject(OCLOSEDDOOR, rnd(30)));
          break;
        case '-':
          setItem(x, y, createRandomItem(depth + 1));
          break;
        case '.':
          if (depth < (ULARN ? MAXLEVEL - 6: MAXLEVEL)) break;
          monsters[x][y] = createMonster(makemonst(depth + 1));
          break;
        case '~':
          if (depth != DBOTTOM) break;
          setItem(x, y, OLARNEYE);
          ULARN ? create_guardian(DEMONPRINCE, x, y) : create_guardian(rund(8) + DEMONLORD, x, y);
          break;
        case '!':
          if (depth != VBOTTOM) break;
          setItem(x, y, createObject(OPOTION, 21));
          ULARN ? create_guardian(LUCIFER, x, y) : create_guardian(DEMONPRINCE, x, y);
          break;
      } // switch
      if (!itemAt(x, y)) {
        setItem(x, y, OEMPTY);
      }
    } // for
  } // for
}



/* subroutine to make the caverns for a given level. only walls are made */
function makemaze(k) {
  var useCanned = false;
  if (k == DBOTTOM || k >= VBOTTOM) {
    useCanned = true;
  }
  else if (k > 1) {
    if (ULARN) {
      useCanned = rnd(100) < 50;
    }
    else {
      useCanned = rnd(17) <= 4;
    }
  }

  if (useCanned) {
    /* read maze from data file */
    cannedlevel(k);
    return;
  }

  var mitem = player.level.monsters;

  for (let i = 0; i < MAXY; i++) {
    for (let j = 0; j < MAXX; j++) {
      if (k == 0)
        setItem(j, i, OEMPTY);
      else
        setItem(j, i, OWALL);
    }
  }

  if (k == 0) return;

  eat(1, 1);

  if (k == 1) setItem(33, MAXY - 1, OHOMEENTRANCE);

  /*  now for open spaces */
  var tmp2 = rnd(3) + 3;
  var mx, mxl, mxh, my, myl, myh;
  var mon;
  for (let tmp = 0; tmp < tmp2; tmp++) {
    my = rnd(11) + 2;
    myl = my - rnd(2);
    myh = my + rnd(2);

    if (k < MAXLEVEL) {
      mx = rnd(44) + 5;
      mxl = mx - rnd(4);
      mxh = mx + rnd(12) + 3;
      mon = null;
    } else {
      mx = rnd(60) + 3;
      mxl = mx - rnd(2);
      mxh = mx + rnd(2);
      mon = makemonst(k);
    }

    for (var i = mxl; i < mxh; i++)
      for (var j = myl; j < myh; j++) {
        setItem(i, j, OEMPTY);
        mitem[i][j] = mon ? createMonster(mon) : null;
      }
  }
  /*  now for open spaces */

  my = rnd(MAXY - 2);
  for (let i = 1; i < MAXX - 1; i++)
    setItem(i, my, OEMPTY);

  if (k > (ULARN ? 4 : 1)) {
    treasureroom(k);
  }

}



function updateWalls(x, y, dist) {
  var x1, x2, y1, y2;
  if (x == null) {
    x1 = 0;
    x2 = MAXX - 1;
    y1 = 0;
    y2 = MAXY - 1;
  } else {
    x1 = x - dist;
    x2 = x + dist;
    y1 = y - dist;
    y2 = y + dist;
  }
  for (y = y1; y <= y2; y++)
    for (x = x1; x <= x2; x++)
      setWallArg(x, y);
}



/* function to eat away a filled in maze */
function eat(xx, yy) {
  var dir = rnd(4);
  var tries = 2;

  while (tries) {
    switch (dir) {
      case 1:
        if (xx <= 2) break; /* west */
        if (!itemAt(xx - 1, yy).matches(OWALL) || !itemAt(xx - 2,yy).matches(OWALL)) break;
        setItem(xx - 1, yy, OEMPTY);
        setItem(xx - 2, yy, OEMPTY);
        eat(xx - 2, yy);
        break;

      case 2:
        if (xx >= MAXX - 3) break; /* east */
        if (!itemAt(xx + 1, yy).matches(OWALL) || !itemAt(xx + 2, yy).matches(OWALL)) break;
        setItem(xx + 1, yy, OEMPTY);
        setItem(xx + 2, yy, OEMPTY);
        eat(xx + 2, yy);
        break;

      case 3:
        if (yy <= 2) break; /* south */
        if (!itemAt(xx, yy - 1).matches(OWALL) || !itemAt(xx, yy - 2).matches(OWALL)) break;
        setItem(xx, yy - 1, OEMPTY);
        setItem(xx, yy - 2, OEMPTY);
        eat(xx, yy - 2);
        break;

      case 4:
        if (yy >= MAXY - 3) break; /* north */
        if (!itemAt(xx, yy + 1).matches(OWALL) || !itemAt(xx, yy + 2).matches(OWALL)) break;
        setItem(xx, yy + 1, OEMPTY);
        setItem(xx, yy + 2, OEMPTY);
        eat(xx, yy + 2);
        break;
    }

    if (++dir > 4) {
      dir = 1;
      --tries;
    }
  }
}



/*
 *  function to make a treasure room on a level
 */
function treasureroom(lv) {
  for (var tx = 1 + rnd(10); tx < MAXX - 10; tx += 10)
    if (rnd((ULARN ? 13 : 10)) == 2) {
      var xsize = rnd(6) + 3;
      var ysize = rnd(3) + 3;
      var ty = rnd(MAXY - 9) + 1; /* upper left corner of room */
      troom(lv, xsize, ysize, tx, ty, rnd(9));
    }
}



/*
 *  subroutine to create a treasure room of any size at a given location
 *  room is filled with objects and monsters
 *  the coordinate given is that of the upper left corner of the room
 */
function troom(lv, xsize, ysize, tx, ty, glyph) {
  var i, j;

  var mitem = player.level.monsters;

  for (j = ty - 1; j <= ty + ysize; j++)
    for (i = tx - 1; i <= tx + xsize; i++)
      setItem(i, j, OEMPTY); /* clear out space for room */

  /* now put in the walls */
  for (j = ty; j < ty + ysize; j++)
    for (i = tx; i < tx + xsize; i++) {
      setItem(i, j, OWALL);
      mitem[i][j] = null;
    }

  for (j = ty + 1; j < ty + ysize - 1; j++)
    for (i = tx + 1; i < tx + xsize - 1; i++)
    setItem(i, j, OEMPTY); /* now clear out interior */

  switch (rnd(2)) /* locate the door on the treasure room */ {
    case 1:
      /* on horizontal walls */
      i = tx + rund(xsize);
      j = ty + (ysize - 1) * rund(2);
      setItem(i, j, createObject(OCLOSEDDOOR, glyph));
      break;

    case 2:
      /* on vertical walls */
      i = tx + (xsize - 1) * rund(2);
      j = ty + rund(ysize);
      setItem(i, j, createObject(OCLOSEDDOOR, glyph));
      break;
  }

  let tmpy = ty + (ysize >> 1);

  if (getDifficulty() < 2) {
    for (let tmpx = tx + 1; tmpx <= tx + xsize - 2; tmpx += 2) {
      for (i = 0, j = rnd(6); i <= j; i++) {
        dropItem(tmpx, tmpy, createRandomItem(lv + 2));
        if (rnd(101) < 8) i--; // chance of another item
        createmonster(makemonst(lv + (ULARN ? 2 : 1)), tmpx, tmpy);
      }
    }
  } else {
    for (let tmpx = tx + 1; tmpx <= tx + xsize - 2; tmpx += 2) {
      for (i = 0, j = rnd(4); i <= j; i++) {
        dropItem(tmpx, tmpy, createRandomItem(lv + 2));
        if (rnd(101) < 8) i--; // chance of another item
        createmonster(makemonst(lv + (ULARN ? 4 : 3)), tmpx, tmpy);
      }
    }
  }

}



/*
    subroutine to create the objects in the maze for the given level
 */
function makeobject(depth) {
  if (depth == 0) {
    fillroom(OENTRANCE, 0);  /*  entrance to dungeon         */
    fillroom(ODNDSTORE, 0);  /*  the DND STORE               */
    fillroom(OSCHOOL, 0);    /*  college of Larn             */
    fillroom(OBANK, 0);      /*  1st national bank of larn   */
    fillroom(OVOLDOWN, 0);   /*  volcano shaft to temple     */
    fillroom(OHOME, 0);      /*  the players home & family   */
    fillroom(OTRADEPOST, 0); /*  the trading post            */
    fillroom(OLRS, 0);       /*  the larn revenue service    */
    return;
  }

  if (depth == 1) {
    LEVELS[depth].items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OHOMEENTRANCE);
  }

  if (depth == (MAXLEVEL + MAXVLEVEL)) {
    LEVELS[depth].items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OFORESTENTRANCE);
    LEVELS[depth].items[Math.floor(MAXX / 2)][0] = createObject(OFORESTDOWN);
  }
  if (depth == MAXLEVEL) fillroom(OVOLUP, 0); /* volcano shaft up from the temple */

  if ((depth > 0) &&                         /* no stairs on home level */
      (depth != DBOTTOM) &&                  /* no stairs on bottom of dungeon */
      (depth < VBOTTOM - (ULARN ? 2 : 0))) { /* no stairs on v3, v4, v5 */
    fillroom(OSTAIRSDOWN, 0);
  }

  if ((depth > 1) && (depth != MAXLEVEL) && (depth < MAXLEVEL + MAXVLEVEL)) {
    fillroom(OSTAIRSUP, 0);
  }

  if ((depth > MAXLEVEL + MAXVLEVEL) && (depth < FBOTTOM)) {
    LEVELS[depth].items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OFORESTUP);
    LEVELS[depth].items[Math.floor(MAXX / 2)][0] = createObject(OFORESTDOWN);
  }

  if ((depth > MAXLEVEL + MAXVLEVEL) && (depth == FBOTTOM)) {
    LEVELS[depth].items[Math.floor(MAXX / 2)][MAXY - 1] = createObject(OFORESTUP);
  }

  if (ULARN) {
    if (depth > 3 &&          // > 3
        depth != DBOTTOM &&   // not on 15
        depth != MAXLEVEL &&  // not on V1
        depth != VBOTTOM) {   // not on V5
      createArtifact(OELEVATORUP, player.ELEVUP, rnd(100) > 85);
    }
    if (depth > 0 &&               // not on home
        (depth <= (DBOTTOM - 5) || // < level 10
         depth == DBOTTOM ||       // 15
         depth == VBOTTOM)) {      // V5
      createArtifact(OELEVATORDOWN, player.ELEVDOWN, rnd(100) > 85);
    }
  }

  /* make the random objects in the maze */
  fillmroom(rund(3), OBOOK, depth);
  fillmroom(rund(3), OALTAR, 0);
  fillmroom(rund(3), OSTATUE, 0);
  fillmroom(rund(3), OFOUNTAIN, 0);
  fillmroom(rund(2), OTHRONE, 0);
  fillmroom(rund(2), OMIRROR, 0);
  fillmroom(rund(3), OCOOKIE, 0);

  /* be sure to have pits and trapdoors on V3, V4, and V5 */
	/* because there are no stairs on those levels */
  if (ULARN && depth >= MAXLEVEL + MAXVLEVEL - 3) {
    fillroom(OPIT, 0);
    // don't have trapdoors in the forest 
    if (depth <= VBOTTOM) {
      fillroom(OIVTRAPDOOR,0);
    }
  }
  /* regular pits */ 
  fillmroom(rund(3), OPIT, 0);

  if (ULARN || (depth != DBOTTOM) && (depth != VBOTTOM)) {
    // don't have trapdoors in the forest
    if (depth <= VBOTTOM) {
      fillmroom(rund(2), OIVTRAPDOOR, 0);
    }
  }
  fillmroom(rund(2), OTRAPARROWIV, 0);
  fillmroom(rnd(3) - 2, OIVDARTRAP, 0);
  fillmroom(rnd(3) - 2, OIVTELETRAP, 0);

  if (depth == 1) 
    fillmroom(1, OCHEST, depth);
  else 
    fillmroom(rund(2), OCHEST, depth);

  if (depth < MAXLEVEL) {
    fillmroom((rund(2)), ODIAMOND, rnd(10 * depth + 1) + 10);
    fillmroom(rund(2), ORUBY, rnd(6 * depth + 1) + 6);
    fillmroom(rund(2), OEMERALD, rnd(4 * depth + 1) + 4);
    fillmroom(rund(2), OSAPPHIRE, rnd(3 * depth + 1) + 2);
  }

  var i;
  for (i = 0; i < rnd(4) + 3; i++) 
    fillroom(OPOTION, newpotion()); /* make a POTION */
  for (i = 0; i < rnd(5) + 3; i++) 
    fillroom(OSCROLL, newscroll()); /* make a SCROLL */
  for (i = 0; i < rnd(12) + 11; i++) 
    fillroom(OGOLDPILE, 12 * rnd(depth + 1) + (depth << 3) + 10); /* make GOLD */

  if (depth == (ULARN ? 8 : 5)) 
    fillroom(OBANK2, 0); /* branch office of the bank */

  if (ULARN && depth >= 4) {
    /* Dealer McDope's Pad */
    createArtifact(OPAD, player.PAD, rnd(100) > 75);
  }

  froom(2, ORING, 0); /* a ring mail */
  froom(1, OSTUDLEATHER, 0); /* a studded leather */
  froom(3, OSPLINT, 0); /* a splint mail */
  froom(5, OSHIELD, rund(3)); /* a shield */
  froom(2, OBATTLEAXE, rund(3)); /* a battle axe */
  froom(5, OLONGSWORD, rund(3)); /* a long sword */
  froom(5, OFLAIL, rund(3)); /* a flail */
  froom(7, OSPEAR, rnd(5)); /* a spear */
  froom(4, OREGENRING, rund(3)); /* ring of regeneration */
  froom(1, OPROTRING, rund(3)); /* ring of protection */
  froom(2, OSTRRING, 1 + rnd(3)); /* ring of strength */
  froom(2, ORINGOFEXTRA, 0); /* ring of extra regen */

  if (ULARN) {
    // only one of these per level
    var created = false;
    created |= createArtifact(OBRASSLAMP,    player.LAMP,         !created && rnd(120) < 8);
    created |= createArtifact(OWWAND,        player.WAND,         !created && rnd(120) < 8);
    created |= createArtifact(OORBOFDRAGON,  player.SLAYING,      !created && rnd(120) < 8);
    created |= createArtifact(OSPIRITSCARAB, player.NEGATESPIRIT, !created && rnd(120) < 8);
    created |= createArtifact(OCUBEofUNDEAD, player.CUBEofUNDEAD, !created && rnd(120) < 8);
    created |= createArtifact(ONOTHEFT,      player.NOTHEFT,      !created && rnd(120) < 8);
    created |= createArtifact(OSWORDofSLASHING, player.SLASH,     !created && rnd(120) < 8);
    created |= createArtifact(OHAMMER,       player.BESSMANN,     !created && rnd(120) < 8);
    created |= createArtifact(OSPHTALISMAN,  player.TALISMAN,     !created && rnd(120) < 8);
    created |= createArtifact(OHANDofFEAR,   player.HAND,         !created && rnd(120) < 8);
    created |= createArtifact(OORB,          player.ORB,          !created && rnd(120) < 8);
    created |= createArtifact(OELVENCHAIN,   player.ELVEN,        !created && rnd(120) < 8);
    created |= createArtifact(OSLAYER,       player.SLAY,         !created && depth >= 10 && depth <= VBOTTOM && rnd(100) > (85 - (depth - 10)));
    created |= createArtifact(OVORPAL,       player.VORPAL,       !created && rnd(120) < 8);
    created |= createArtifact(OPSTAFF,       player.STAFF,        !created && depth >= 8 && depth <= VBOTTOM && rnd(100) > (85 - (depth - 10)));
  }
  else {
    createArtifact(OORBOFDRAGON,     player.SLAYING,      rnd(151) < 3);
    createArtifact(OSPIRITSCARAB,    player.NEGATESPIRIT, rnd(151) < 4);
    createArtifact(OCUBEofUNDEAD,    player.CUBEofUNDEAD, rnd(151) < 4);
    createArtifact(ONOTHEFT,         player.NOTHEFT,      rnd(151) < 3);
    createArtifact(OSWORDofSLASHING, player.SLASH,        rnd(151) < 2);
    createArtifact(OHAMMER,          player.BESSMANN,     rnd(151) < 4);
  }

  // If we don't already have Slayer, create.
  if (FOREST) {
    createArtifact(OSLAYER,          player.SLAY,         !created && depth > VBOTTOM);
  }

  if (getDifficulty() < 3 || (rnd(4) == 3)) {
    if (depth > 3) {
      froom(3, OSWORD, rund(6)); /* sunsword */
      froom(5, O2SWORD, rnd(6)); /* a two handed sword */
      froom(3, OBELT, rund(7)); /* belt of striking */
      froom(3, OENERGYRING, rund(6)); /* energy ring */
      froom(4, OPLATE, rund(8)); /* platemail */
      if (!ULARN) froom(3, OCLEVERRING, 1 + rnd(2)); /* ring of cleverness */
    }
  }
} // makeobject()



function createArtifact(artifact, exists, odds) {
  var createdArtifact = false;
  if (!exists && odds) {
    artifact = fillroom(artifact);
    createdArtifact = true;
    debug(`created ${artifact} on ${level}`);
  }
  if (createdArtifact) {
    switch (artifact.id) {
      case OBRASSLAMP.id:       player.LAMP = true;         break;
      case OWWAND.id:           player.WAND = true;         break;
      case OORBOFDRAGON.id:     player.SLAYING = true;      break;
      case OSPIRITSCARAB.id:    player.NEGATESPIRIT = true; break;
      case OCUBEofUNDEAD.id:    player.CUBEofUNDEAD = true; break;
      case ONOTHEFT.id:         player.NOTHEFT = true;      break;
      case OSPHTALISMAN.id:     player.TALISMAN = true;     break;
      case OHANDofFEAR.id:      player.HAND = true;         break;
      case OORB.id:             player.ORB = true;          break;
      case OELVENCHAIN.id:      player.ELVEN = true;        break;
      case OSWORDofSLASHING.id: player.SLASH = true;        break;
      case OHAMMER.id:          player.BESSMANN = true;     break;
      case OSLAYER.id:          player.SLAY = true;         break;
      case OVORPAL.id:          player.VORPAL = true;       break;
      case OPSTAFF.id:          player.STAFF = true;        break;

      case OPAD.id:             player.PAD = true;          break;
      case OELEVATORUP.id:      player.ELEVUP = true;       break;
      case OELEVATORDOWN.id:    player.ELEVDOWN = true;     break;

      default:
        debug(`unidentified artifact created: ${artifact}`);
        break;
    }
    return createdArtifact;
  }
}


/*
    subroutine to fill in a number of objects of the same kind
 */
function fillmroom(n, what, arg) {
  for (var i = 0; i < n; i++) {
    fillroom(what, arg);
  }
}



function froom(n, itm, arg) {
  if (rnd(151) < n) {
    fillroom(itm, arg);
  }
}



/*
    subroutine to put an object into an empty room
 *  uses a random walk
*/
function fillroom(what, arg) {
  var safe = 100;
  var x = rnd(MAXX - 2);
  var y = rnd(MAXY - 2);
  while (!itemAt(x, y).matches(OEMPTY)) {
    x += rnd(3) - 2;
    y += rnd(3) - 2;
    if (x > MAXX - 2) x = 1;
    if (x < 1) x = MAXX - 2;
    if (y > MAXY - 2) y = 1;
    if (y < 1) y = MAXY - 2;
    if (safe-- == 0) {
      debug(`fillroom: SAFETY!`);
      break;
    }
  }
  var newItem = createObject(what, arg);
  setItem(x, y, newItem);
  return newItem;
  //debug(`fillroom(): ${newItem}`);
}



/*
    subroutine to put monsters into an empty room without walls or other
    monsters
 */
function fillmonst(what, awake) {
  var monster = createMonster(what);
  for (var trys = 10; trys > 0; --trys) /* max # of creation attempts */ {
    var x = rnd(MAXX - 2);
    var y = rnd(MAXY - 2);
    //debug(`fillmonst: ${x},${y} ${itemAt(x, y)}`);
    if ((itemAt(x, y).matches(OEMPTY)) && //
      (!player.level.monsters[x][y]) && //
      ((player.x != x) || (player.y != y))) {
      player.level.monsters[x][y] = monster;
      if (awake) monster.awake = awake;
      player.level.know[x][y] &= ~KNOWHERE;
      return monster;
    }
  }
  return null; /* creation failure */
}


/*
    creates an entire set of monsters for a level
    must be done when entering a new level
    if sethp(1) then wipe out old monsters else leave them there
 */
function sethp(flg) {
  // if (flg) {
  //   for (var i = 0; i < MAXY; i++) {
  //     for (var j = 0; j < MAXX; j++) {
  //       var monster = player.level.monsters[j][i];
  //       if (monster)
  //         monster.awake = false;
  //     }
  //   }
  // }

  /* if teleported and found level 1 then know level we are on */
  if (level == 0) {
    player.TELEFLAG = 0;
    return;
  }

  var nummonsters;
  if (flg) {
    nummonsters = rnd(12) + 2 + (level >> 1);
  } else {
    nummonsters = (level >> 1) + 1;
  }

  for (let i = 0; i < nummonsters; i++) {
    fillmonst(makemonst(level));
  }

  if (ULARN & flg) {
    /*
    ** level 11 gets 1 demon lord
    ** level 12 gets 2 demon lords
    ** level 13 gets 3 demon lords
    ** level 14 gets 4 demon lords
    ** level 15 gets 5 demon lords
    */
    var numdemons = 0;
    if ((level >= MAXLEVEL - 5) && (level < MAXLEVEL)) {
      numdemons = level - 10;
      for (let j = 1 ; j <= numdemons ; j++) {
        if (!fillmonst(DEMONLORD + rund(7))) {
          j--;
        }
      }
    }
    /*
    ** level V1 gets 1 demon prince
    ** level V2 gets 2 demon princes
    ** level V3 gets 3 demon princes
    ** level V4 gets 4 demon princes
    ** level V5 gets 5 demon princes
    */
    else if ((level >= MAXLEVEL) && (level <= VBOTTOM)) {
      numdemons = level - MAXLEVEL + 1;
      for (let j = 1 ; j <= numdemons ; j++){
        if (!fillmonst(DEMONPRINCE)) {
          j--;
        }
      }
    }
    /*
    ** level F3 gets Earth Guardian 
    ** level F4 gets Air Guardian
    ** level F5 gets Fire Guardian
    ** level F6 gets Water Guardian
    ** level F7 gets Time Guardian
    ** level F8 gets Ethereal Guardian
    ** level F9 gets Apprentice
    ** level F10 gets Master
    */
    else if (level == FBOTTOM) {
       create_guardian(MASTER,33,9);
    }
    else if (level == FBOTTOM - 1) {
       fillmonst(APPRENTICE);
    }
    else if (level == FBOTTOM - 2) {
      fillmonst(ETHEREALGUARDIAN);
    }
    else if (level == FBOTTOM - 3) {
       fillmonst(TIMEGUARDIAN);
    }
    else if (level == FBOTTOM - 4) {
       fillmonst(WATERGUARDIAN);
    }
    else if (level == FBOTTOM - 5) {
       fillmonst(FIREGUARDIAN);
    }
    else if (level == FBOTTOM - 6) {
       fillmonst(AIRGUARDIAN);
    }
    else if (level == FBOTTOM - 7) {
       fillmonst(EARTHGUARDIAN);
    }
    
  }

}



/* Function to destroy all genocided monsters on the present level */
function checkgen() {
  for (var y = 0; y < MAXY; y++) {
    for (var x = 0; x < MAXX; x++) {
      var monster = player.level.monsters[x][y];
      if (monster && isGenocided(monster.arg)) {
        player.level.monsters[x][y] = null;
      }
    }
  }
}
