"use strict";

const MAXLEVEL = 11;    /*  max # levels in the dungeon         */
const MAXVLEVEL = 3;    /*  max # of levels in the temple of the luran  */
var LEVELS = [14];
var LOG_SIZE = 5;
var LOG = [""];
var LAST_LOG = 0;

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;

var IN_STORE = false;

var Larn = {
  run: function() {
    document.onkeypress = this.keyPress;
    document.onkeydown = this.keyDown;
    //document.onkeyup = this.keyUp;

    player.x = rnd(MAXX - 2);
    player.y = rnd(MAXY - 2);

    updateLog("Welcome to Larn"); // need to initialize the log

    player.inventory[0] = createObject(ODAGGER);
    player.inventory[1] = createObject(OLEATHER);
    player.WIELD = player.inventory[0];
    player.WEAR = player.inventory[1];

    learnSpell("pro");
    learnSpell("mle");
    newcavelevel(0);

  },

  // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  keyPress: function(e) {
    e = e || window.event;
    preParseEvent(e, false, false);
  }, // KEYPRESS

  keyDown: function(e) {
    e = e || window.event;
    preParseEvent(e, true, false);
  }, // KEYDOWN

  keyUp: function(e) {
    e = e || window.event;
    preParseEvent(e, false, true);
  }, // KEYUP

}; // LARN OBJECT



function positionplayer(x, y, exact) {
  if (x == null) x = player.x;
  if (y == null) y = player.y;
  if (exact == null) exact = false;

  // short circuit for moving to exact location
  var distance = 0;
  if (exact && canMove(x, y)) {
    player.x = x;
    player.y = y;
    player.level.paint();
    debug("positionplayer: (" + distance + ") got " + xy(x, y));
    return true;
  }

  // try 20 times to be 1 step away, then 2 steps, etc...
  distance = 1;
  var maxTries = 20;
  var numTries = maxTries;
  while (distance < 10) {
    while (numTries-- > 0) {
      var newx = x + (rnd(3) - 2) * distance;
      var newy = y + (rnd(3) - 2) * distance;
      debug("positionplayer: (" + distance + ") try " + xy(newx, newy));
      if ((newx != x || newy != y)) {
        if (canMove(newx, newy)) {
          player.x = newx;
          player.y = newy;
          player.level.paint();
          debug("positionplayer: (" + distance + ") got " + xy(newx, newy));
          return true;
        }
      }
    }
    numTries = maxTries;
    distance++;
  }
  return false;
}


/*
    moveplayer(dir)

    subroutine to move the player from one room to another
    returns 0 if can't move in that direction or hit a monster or on an object
    else returns 1
    nomove is set to 1 to stop the next move (inadvertent monsters hitting
    players when walking into walls) if player walks off screen or into wall
 */

const diroffx = [0, 0, 1, 0, -1, 1, -1, 1, -1];
const diroffy = [0, 1, 0, -1, 0, -1, -1, 1, 1];

/*  from = present room #  direction =
        [1-north] [2-east] [3-south] [4-west]
        [5-northeast] [6-northwest] [7-southeast] [8-southwest]
        if direction=0, don't move--just show where he is */
function moveplayer(dir) {
  var prayed;

  if (player.CONFUSE > 0) {
    if (player.level.depth < rnd(30)) {
      dir = rund(9); /*if confused any dir*/
    }
  }

  var k = player.x + diroffx[dir];
  var m = player.y + diroffy[dir];
  if (k < 0 || k >= MAXX || m < 0 || m >= MAXY) {
    nomove = 1;
    yrepcount = 0;
    return (0);
  }
  var item = player.level.items[k][m];
  var monster = player.level.monsters[k][m];

  /* prevent the player from moving onto a wall, or a closed door when
     in command mode, unless the character has Walk-Through-Walls.
   */
  if ((item.matches(OCLOSEDDOOR) && !prompt_mode) || (item.matches(OWALL)) && player.WTW <= 0) {
    nomove = 1;
    yrepcount = 0;
    return (0);
  }

  if (item.matches(OHOMEENTRANCE)) {
    updateLog("Going to Home Level");
    newcavelevel(0);
    moveNear(OENTRANCE, false);
    return 0;
  }

  /* hit a monster
   */
  if (monster != null) {
    hitmonster(k, m);
    yrepcount = 0;
    return (0);
  }

  /* check for the player ignoring an altar when in command mode.
   */
  if ((!prompt_mode) &&
    (getItem(player.x, player.y).matches(OALTAR)) &&
    (!prayed)) {
    updateLog("You have ignored the altar!");
    act_ignore_altar();
  }
  prayed = 0;

  lastpx = player.x;
  lastpy = player.y;
  player.x = k;
  player.y = m;

  // TODO: JRP NOT IN ORIGINAL CODE
  // stop running when hitting an object
  if (!getItem(k, m).matches(OEMPTY)) {
    yrepcount = 0;
    return (0);
  }

  if (!item.matches(OTRAPARROWIV) && !item.matches(OIVTELETRAP) && //
    !item.matches(OIVDARTRAP) && !item.matches(OIVTRAPDOOR)) {
    yrepcount = 0;
    return (1);
  } else {
    return (1);
  }
}

function run(dir) {
  var i = 1;
  while (i == 1) {
    i = moveplayer(dir);
    if (i > 0) {
      if (player.HASTEMONST > 0) {
        movemonst();
      }
      movemonst();
      randmonst();
      regen();
      gtime++; // TODO
    }
    if (hitflag == 1) {
      i = 0;
    }
    if (i != 0) {
      //showcell(playerx, playery); // TODO?
    }
  }
}


function randmonst() {
  //debug("TODO: larn.randmonst()");
};

function regen() {
  //debug("TODO: larn.regen()");
}


// move near an item, or on top of it if possible
function moveNear(item, exact) {
  // find the item
  for (var x = 0; x < MAXX; x++) {
    for (var y = 0; y < MAXY; y++) {
      if (isItem(x, y, item)) {
        debug("movenear: found: " + item.id + " at " + xy(x, y));
        positionplayer(x, y, exact);
        return true;
      }
    }
  }
  debug("movenear: NOT FOUND: " + item.id);
  return false;
} // movenear

function canMove(x, y) {
  //debug("canMove: testing: (" + x + "," + y + ")");
  if (x < 0) return false;
  if (x >= MAXX) return false;
  if (y < 0) return false;
  if (y >= MAXY) return false;

  var item = player.level.items[x][y];
  if (isItem(x, y, OWALL) /*|| player.level.monsters[x][y] != null*/ ) {
    return false;
  } else {
    return true;
  }
}


function parse2() {
  debug("TODO: larn.parse2()");
  // if (c[HASTEMONST]) {
  //   movemonst();
  // }
  // movemonst(); /* move the monsters       */
  // randmonst();
  // regen();
}


function updateLog(text) {
  if (DEBUG_OUTPUT) {
    //console.log(`LARN: ${text}`);
  }
  LOG.push(text);
  if (LOG.length > LOG_SIZE) {
    LOG.shift();
  }
  if (player != null && player.level != null) {
    player.level.paint();
  }
}


function lprcat(text) {
  updateLog(text);
}

function appendLog(text) {
  var newText;
  if (text == DEL) {
    newText = LOG.pop();
    newText = newText.substring(0, newText.length - 1);
  } else {
    newText = LOG.pop() + text;
  }
  updateLog(newText);
}
