'use strict';


/* For command mode. Perform removal of gems from a jeweled throne */
function remove_gems() {
  cursors();
  var item = itemAt(player.x, player.y);
  if (item.matches(ODEADTHRONE)) {
    updateLog(`There are no gems to remove!`);
    nomove = 1;
  } else if (item.matches(OTHRONE)) {
    act_remove_gems(item.arg);
  } else {
    updateLog(`I see no throne here to remove gems from!`);
    nomove = 1;
  }
}



/*
    act_remove_gems

    Remove gems from a throne.

    arg is zero if there is a gnome king associated with the throne

    Assumes that cursors() has been called previously, and that a check
    has been made that the throne actually has gems.
*/
function act_remove_gems(arg) {
  var k = rnd(101);
  if (k < 25) {
    for (var i = 0; i < rnd(4); i++) {
      dropItemNearPlayer(createGem()); /* gems pop off the throne */
    }
    var throneArg = itemAt(player.x, player.y).arg;
    setItem(player.x, player.y, createObject(ODEADTHRONE, throneArg));
    player.level.know[player.x][player.y] = 0;
  } else if (k < 40 && arg == 0 && !isGenocided(GNOMEKING)) {
    createmonster(GNOMEKING);
    itemAt(player.x, player.y).arg = 1;
    player.level.know[player.x][player.y] = 0;
  } else {
    updateLog(`  Nothing happens${period}`);
  }
  return;
}



/*
    For command mode.  Perform sitting on a throne.
*/
function sit_on_throne() {
  cursors();
  var item = itemAt(player.x, player.y);
  if (item.matches(OTHRONE)) {
    act_sit_throne(item.arg);
  } else if (item.matches(ODEADTHRONE)) {
    act_sit_dead_throne(item.arg);
  } else {
    updateLog(`I see no throne to sit on here!`);
    nomove = 1;
  }
}



/*
    act_sit_throne

    Sit on a throne.

    arg is zero if there is a gnome king associated with the throne

    Assumes that cursors() has been called previously.
*/
function act_sit_throne(arg) {
  var k = rnd(101);
  if (k < 30 && arg == 0 && !isGenocided(GNOMEKING)) {
    createmonster(GNOMEKING);
    itemAt(player.x, player.y).arg = 1;
    player.level.know[player.x][player.y] = 0;
  } else if (k < 35) {
    updateLog(`  Zaaaappp!  You've been teleported!`);
    beep();
    oteleport(0);
  } else {
    updateLog(`  Nothing happens${period}`);
  }
}



function act_sit_dead_throne(arg) {
  if (ULARN) {
    var k = rnd(101);
    if (k < 5) {
      player.raiselevel();
    } else if (k < 25) {
      updateLog(`  Zaaaappp!  You've been teleported!`);
      beep();
      oteleport(0);
    } else {
      updateLog(`  Nothing happens${period}`);
    }
    return;
  } else {
    act_sit_throne(arg);
  }
}