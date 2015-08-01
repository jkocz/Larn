"use strict";


var KNOWNOT = 0x00;
var HAVESEEN = 0x1;
var KNOWHERE = 0x2;
var KNOWALL = (HAVESEEN | KNOWHERE);


/*
    bottomline()

    now for the bottom line of the display
 */
function bottomline() {
  recalc();
  // TODO: lots

  cursor(1, 18);

  lprcat(player.getStatString());
  lprc("\n");

  for (var logindex = 0; logindex < LOG.length; logindex++) {
    cltoeoln();
    lprcat(LOG[logindex] + "\n");
  }

  var doc = document.getElementById("STATS");
  if (doc != null)
    document.getElementById("STATS").innerHTML = DEBUG_STATS ? game_stats() : "";


}


const blank = "          ";

function botsideline(stat, name, line) {
  cursor(70, line + 1);
  if (stat > 0) lprcat(name);
  else lprcat(blank);
}

function botside() {
  var line = 0;
  botsideline(player.STEALTH, "stealth", line++);
  botsideline(player.UNDEADPRO, "undead pro", line++);
  botsideline(player.SPIRITPRO, "spirit pro", line++);
  botsideline(player.CHARMCOUNT, "Charm", line++);
  botsideline(player.TIMESTOP, "Time Stop", line++);
  botsideline(player.HOLDMONST, "Hold Monst", line++);
  botsideline(player.GIANTSTR, "Giant Str", line++);
  botsideline(player.FIRERESISTANCE, "Fire Resit", line++);
  botsideline(player.DEXCOUNT, "Dexterity", line++);
  botsideline(player.STRCOUNT, "Strength", line++);
  botsideline(player.SCAREMONST, "Scare", line++);
  botsideline(player.HASTESELF, "Haste Self", line++);
  botsideline(player.CANCELLATION, "Cancel", line++);
  botsideline(player.INVISIBILITY, "Invisible", line++);
  botsideline(player.ALTPRO, "Protect 3", line++);
  botsideline(player.PROTECTIONTIME, "Protect 2", line++);
  botsideline(player.WTW, "Wall-Walk", line++);
}


/*
    this routine shows only the spot that is given it.  the spaces around
    these coordinated are not shown
    used in godirect() in monster.c for missile weapons display
 */
function show1cell(x, y) {
  cursor(x + 1, y + 1);
  /* see nothing if blind, but clear previous player position */
  if (player.BLINDCOUNT > 0) {
    if ((x == oldx) && (y == oldy)) {
      lprc(' ');
    }
    return;
  }

  var c = monsterAt(x,y) != null ? monsterAt(x,y).char : getItem(x,y).char;

  player.level.know[x][y] = KNOWALL; /* we end up knowing about it */
}



/* subroutine to show where the player is on the screen, cursor values start from 1 up */
function showplayer() {
  show1cell(oldx, oldy);
  show1cell(player.x, player.y);
  oldx = player.x;
  oldy = player.y;
}



/* subroutine to display a cell location on the screen */
function showcell(x, y) {
  if (IN_STORE) return; // TODO HACK

  if (player.BLINDCOUNT > 0) {
    if (x == oldx && y == oldy) {
      cursor(1 + x, 1 + y);
      lprc(' ');
    }
    if (x == player.x && y == player.y) {
      cursor(1 + x, 1 + y);
      lprc(player.char);
    }
  } else {
    var minx, maxx, miny, maxy, i, j;

    if (player.AWARENESS > 0) {
      minx = x - 3;
      maxx = x + 3;
      miny = y - 3;
      maxy = y + 3;
    } else {
      minx = x - 1;
      maxx = x + 1;
      miny = y - 1;
      maxy = y + 1;
    }


    if (minx < 0) minx = 0;
    if (maxx > MAXX - 1) maxx = MAXX - 1;
    if (miny < 0) miny = 0;
    if (maxy > MAXY - 1) maxy = MAXY - 1;

    for (j = miny; j <= maxy; j++)
      for (i = minx; i <= maxx; i++) {
        show1cell(i, j);
        // cursor(1+i, 1+j);
        //
        // if (i == playerx && j == playery) lprc_map('@', 0);
        // else if (mitem[i][j])             lprc_map(monstnamelist[mitem[i][j]], mitem[i][j]);
        // else                              lprc_map(objnamelist[item[i][j]], item[i][j]);
        //
        // know[i][j] = KNOWALL;
      }
  }

  cursor(1 + x, 1 + y);
}
