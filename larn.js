'use strict';

const VERSION = '12.6.0 (pre-alpha)';
const BUILD = '005';

//var ULARN = false; // are we playing LARN or ULARN?
//var FOREST = false; // are we playing the FOREST?

var ULARN = true; // are we playing LARN or ULARN?
var FOREST = true; // are we playing the FOREST?

const IMG_HEIGHT = 24;
const IMG_WIDTH = 12;

var DEBUG_STATS = false;
var DEBUG_OUTPUT = false;
var DEBUG_STAIRS_EVERYWHERE = false;
var DEBUG_KNOW_ALL = false;
var DEBUG_PAINT = 0;
var DEBUG_LPRCAT = 0;
var DEBUG_LPRC = 0;
var DEBUG_PROXIMITY = false;

var dofs = false;
var lambda;

function play() {

  // this role only has access to invoke the lambda score function 
  AWS.config.accessKeyId = "AWS_CONFIG_ACCESSKEYID";
  AWS.config.secretAccessKey = "AWS_CONFIG_SECRETACCESSKEY";

  // real credentials are set here, and not committed
  try {
    initLambdaCredentials();
  } catch (error) {
    console.error(`not loading aws credentials: ${error}`);
  }

  lambda = new AWS.Lambda({
    region: 'us-east-1',
    apiVersion: '2015-03-31'
  });

  initKeyBindings();

  document.addEventListener("click", onMouseClick);

  /* warn the player that closing their window will kill the game.
     this is a bit annoying, and I'm tempted to get rid of it now
     that there are checkpoints in place */
  if (location.hostname === 'localhost') {
    enableDebug();
  } else {
    window.onbeforeunload = confirmExit;
  }

  // TODO: setup for not repainting in text mode
  // TODO: need to update io.js:os_put_font(), display.js:blt(), larn.js:play()
  // TODO: this will break scoreboard rendering
  if (altrender) {
    for (var y = 0; y < 24; y++) {
      for (var x = 0; x < 80; x++) {
        display[x][y] = createDiv(x, y);
      }
    }

    if (!images) {
      loadImages();
    }

    bltDocument();
  }

  //loadURLParameters();

  no_intro = PARAMS.nointro ? PARAMS.nointro == `true` : false;
  mobile = PARAMS.mobile ? PARAMS.mobile == `true` : false;
  //ULARN = PARAMS.ularn ? PARAMS.ularn == `true` : false;
  //FOREST = PARAMS.forest ? PARAMS.forest == `true` : false;

  setGameConfig();

  if (PARAMS.score) {
    player = new Player();
    loadScores(null, true, true);
  } else {
    welcome(); // show welcome screen, start the game
  }

}



function loadURLParameters() {
  // internet explorer doesn't support "URLSearchParams" yet
  PARAMS = {};
  location.search.substr(1).split("&").forEach(function (item) {
    PARAMS[item.split("=")[0]] = item.split("=")[1]
  });
  console.log(`url parameters`, PARAMS);
}



function confirmExit() {
  if (!GAMEOVER)
    return `Are you sure? Your game will be lost!`;
}



function initKeyBindings() {
  Mousetrap.bind('.', mousetrap); // stay here
  Mousetrap.bind(',', mousetrap); // take
  Mousetrap.bind('<', mousetrap); // go up
  Mousetrap.bind('>', mousetrap); // go down
  Mousetrap.bind('^', mousetrap); // identify traps
  Mousetrap.bind('!', mousetrap); // keyboard hints
  Mousetrap.bind('@', mousetrap); // auto-pickup
  Mousetrap.bind('#', mousetrap); // inventory 
  Mousetrap.bind('{', mousetrap); // retro fonts
  Mousetrap.bind('}', eventToggleMode); // classic/hack/amiga 
  Mousetrap.bind('?', mousetrap); // help
  Mousetrap.bind('_', mousetrap); // password
  Mousetrap.bind('-', mousetrap); // disarm 
  Mousetrap.bind('+', mousetrap); // load games via password

  Mousetrap.bind(['(', ')'], mousetrap); // allow () for pvnert(x)

  //Mousetrap.bind('enter', mousetrap);
  Mousetrap.bind('tab', mousetrap); // so we can block default browser action
  Mousetrap.bind('return', mousetrap);
  Mousetrap.bind('escape', mousetrap);
  //Mousetrap.bind('del', mousetrap);
  Mousetrap.bind('backspace', mousetrap);
  Mousetrap.bind('space', mousetrap);

  Mousetrap.bind(['up', 'shift+up'], mousetrap);
  Mousetrap.bind(['down', 'shift+down'], mousetrap);
  Mousetrap.bind(['left', 'shift+left'], mousetrap);
  Mousetrap.bind(['right', 'shift+right'], mousetrap);
  Mousetrap.bind(['pageup', 'shift+pageup'], mousetrap);
  Mousetrap.bind(['pagedown', 'shift+pagedown'], mousetrap);
  Mousetrap.bind(['home', 'shift+home'], mousetrap);
  Mousetrap.bind(['end', 'shift+end'], mousetrap);

  Mousetrap.bind(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'], mousetrap);
  Mousetrap.bind(['n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], mousetrap);

  Mousetrap.bind(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], mousetrap);
  Mousetrap.bind(['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], mousetrap);

  Mousetrap.bind('*', mousetrap);
  Mousetrap.bind(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], mousetrap);
}



function enableDebug() {
  debug_used = 1;
  Mousetrap.bind('alt+`', eventToggleDebugStats);
  Mousetrap.bind('alt+1', eventToggleDebugOutput);
  Mousetrap.bind('alt+2', eventToggleDebugWTW);
  Mousetrap.bind('alt+3', eventToggleDebugStairs);
  Mousetrap.bind('alt+4', eventToggleDebugKnowAll);
  Mousetrap.bind('alt+5', eventToggleDebugStealth);
  Mousetrap.bind('alt+6', eventToggleDebugAwareness);
  Mousetrap.bind('alt+7', eventToggleDebugImmortal);
  Mousetrap.bind('alt+8', eventMagicMap);
  Mousetrap.bind('alt+9', eventEngolden);
  Mousetrap.bind('alt+0', eventToggleDebugProximity);
}



// toggle between classic, hack and amiga mode
function eventToggleMode(event, key, quiet) {
  nomove = 1;
  // classic => hack
  if (original_objects && !amiga_mode) {
    document.body.style.fontSize = retro_mode ? '25px' : '22px';
    original_objects = false;
    if (!quiet) updateLog(`Switching to Hack mode`);
  }
  // hack mode => amiga
  else if (!original_objects && !amiga_mode) {
    document.body.style.fontSize = '20px';
    amiga_mode = true;
    original_objects = true;
    for (var y = 0; y < 24; y++) {
      for (var x = 0; x < 80; x++) {
        display[x][y] = createDiv(x, y);
      }
    }
    if (!images) {
      loadImages();
    }
    bltDocument();
    if (!quiet) updateLog(`Switching to Amiga mode`);
    clear();
  }
  // amiga mode => classic
  else {
    document.body.style.fontSize = retro_mode ? '25px' : '22px';
    amiga_mode = false;
    original_objects = true;
    if (!quiet) updateLog(`Switching to Classic mode`);
  }

  paint();
}



function createDiv(x, y) {
  var callback = ``;
  if (mobile) {
    var key = `.`;
    if (x < 22 && y <= 5) key = `y`;
    else if (x <= 44 && y <= 5) key = `k`;
    else if (x <= 67 && y <= 5) key = `u`;
    else if (x < 22 && y <= 11) key = `h`;
    else if (x <= 44 && y <= 11) key = `.`;
    else if (x <= 67 && y <= 11) key = `l`;
    else if (x < 22 && y <= 16) key = `b`;
    else if (x <= 44 && y <= 16) key = `j`;
    else if (x <= 67 && y <= 16) key = `n`;
    callback = `onclick='mousetrap(null, "${key}")'`;
  }
  return `<div id='${x},${y}' class='image' ${callback}></div>`;
}



function eventToggleDebugStats() {
  nomove = 1;
  debug_used = 1;
  DEBUG_STATS = !DEBUG_STATS;
  updateLog(`DEBUG_STATS: ` + DEBUG_STATS);
  paint();
}



function eventToggleDebugOutput() {
  nomove = 1;
  debug_used = 1;
  DEBUG_OUTPUT = !DEBUG_OUTPUT;
  updateLog(`DEBUG_OUTPUT: ` + DEBUG_OUTPUT);
  paint();
}



function eventToggleDebugWTW() {
  nomove = 1;
  debug_used = 1;
  player.updateWTW(player.WTW == 0 ? 100000 : -player.WTW);
  updateLog(`DEBUG_WALK_THROUGH_WALLS: ` + (player.WTW > 0));
  paint();
}



function eventToggleDebugStairs() {
  nomove = 1;
  debug_used = 1;
  DEBUG_STAIRS_EVERYWHERE = !DEBUG_STAIRS_EVERYWHERE;
  updateLog(`DEBUG_STAIRS_EVERYWHERE: ` + DEBUG_STAIRS_EVERYWHERE);
  paint();
}



function eventToggleDebugKnowAll() {
  nomove = 1;
  debug_used = 1;
  DEBUG_KNOW_ALL = true;
  learnAll();
  updateLog(`DEBUG_KNOW_ALL: ` + DEBUG_KNOW_ALL);
  paint();
}



function learnAll() {
  for (let i = 0; i < spelcode.length; i++) {
    learnSpell(spelcode[i]);
  }
  for (let i = 0; i < SCROLL_NAMES.length; i++) {
    learnScroll(createObject(OSCROLL, i));
  }
  for (let i = 0; i < POTION_NAMES.length; i++) {
    learnPotion(createObject(OPOTION, i));
  }
}



function eventToggleDebugStealth() {
  nomove = 1;
  debug_used = 1;
  if (player.STEALTH <= 0) {
    player.updateHoldMonst(100000);
    player.updateStealth(100000);
    updateLog(`DEBUG: FREEZING MONSTERS`);
  } else {
    player.updateHoldMonst(-player.HOLDMONST);
    player.updateStealth(-player.STEALTH);
    updateLog(`DEBUG: UNFREEZING MONSTERS`);
  }
  paint();
}



function eventToggleDebugAwareness() {
  nomove = 1;
  debug_used = 1;
  if (player.AWARENESS <= 0) {
    player.AWARENESS = 100000;
    updateLog(`DEBUG: EXPANDED AWARENESS++`);
  } else {
    player.AWARENESS = 0;
    updateLog(`DEBUG: EXPANDED AWARENESS--`);
  }
  paint();
}



function eventMagicMap() {
  nomove = 1;
  debug_used = 1;
  read_scroll(createObject(OSCROLL, 15));
  paint();
}



function eventEngolden() {
  nomove = 1;
  debug_used = 1;
  player.GOLD += 250000;
  paint();
}



function eventToggleDebugImmortal() {
  nomove = 1;
  debug_used = 1;
  if (player.LIFEPROT <= 0) {
    player.LIFEPROT = 100000;
    updateLog(`DEBUG: LIFE PROTECTION++`);
  } else {
    player.LIFEPROT = 0;
    updateLog(`DEBUG: LIFE PROTECTION--`);
  }
  paint();
}



function eventToggleDebugProximity() {
  nomove = 1;
  debug_used = 1;
  DEBUG_PROXIMITY = !DEBUG_PROXIMITY;
  updateLog(`DEBUG: PROXIMITY: ` + DEBUG_PROXIMITY);
  paint();
}



function onMouseClick(event) {
  try {

    let xy, x, y;

    if (amiga_mode) {
      if (!event.target.attributes.id) return; // clicking outside the 80,24 window
      xy = event.target.attributes.id.value.split(`,`);
      x = xy[0];
      y = xy[1];
    } 
    else {

      return;

      /*
      // this is too unreliable to ship
      let el = document.getElementById('LARN');
      let style = window.getComputedStyle(el, null).getPropertyValue('font-size');
      let fontSize = parseFloat(style);
      let fontWidth = getTextWidth("0", fontSize + 'pt dos');
      // console.log(`fontwidth: ${fontWidth} fontSize: ${fontSize}`);

      // console.log(event.layerX, event.layerY);
      // console.log(event.clientX, event.clientY);

      let offx = 25; // event.target.offsetLeft;
      let offy = 25; // event.target.offsetTop);
      // let offx = event.target.offsetLeft;
      // let offy = event.target.offsetTop;
      console.log(offx, offy);
      
      let clickX = event.clientX - offx;
      let clickY = event.clientY - offy;
      // console.log(`clickX`, clickX, `clickY`, clickY);

      x = clickX / fontWidth;
      y = clickY / fontSize;
      console.log(x, y);

      let weirdHackX = (66/59.52);
      let weirdHackY = (16/18.45);
      x = Math.floor((clickX / fontWidth) * weirdHackX);
      y = Math.floor((clickY / fontSize) * weirdHackY);
      */

    }

    let monster = monsterAt(x, y);
    let item = itemAt(x, y);

    if (!item) return; // clicking outside the 67,17 maze

    let description = ``;
    let prefix = `It's `;
    let sayEmpty = false;

    // console.log(event);
    // console.log(x, y);
    // updateLog(`${x}, ${y}`);

    if (monster) {
      // no help for invisible monsters or if you're blind
      sayEmpty = !monster.isVisible() || player.BLINDCOUNT > 0;
    }

    if (sayEmpty) monster = null; // what monster?

    if (!player.level.know[x][y]) {
      description = `a mystery`;
    }
    else if (x == player.x && y == player.y) {
      description = `our Hero`;
    } 
    else if (monster) {
      description = monster.toString();
      if (monster.matches(MIMIC)) description = monsterlist[monster.mimicarg].toString();
      let firstChar = description.substring(0, 1).toLocaleLowerCase();
      prefix = `It's a `;
      if (`aeiou`.indexOf(firstChar) >= 0) prefix = `It's an `;
    }
    else if (sayEmpty || item.matches(OIVDARTRAP) || item.matches(OIVTELETRAP) || item.matches(OIVTRAPDOOR) || item.matches(OTRAPARROWIV)) {
      description = OEMPTY.desc;
    }
    else {
      description = item.desc;
    }

    description = prefix + description;
    updateLog(description);
    paint();
  } catch (error) {
    console.log(`onMouseClick`, error);
  }
}
