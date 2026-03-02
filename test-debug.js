const { io } = require("socket.io-client");
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiZGVidWd0ZXN0MyIsImVtYWlsIjoiZGVidWczQHRlc3QuY29tIiwiaWF0IjoxNzcyNDIxMDEzLCJleHAiOjE3NzI0MjE5MTN9.CGHtBynnt_8EtNKOz8ftuSl2fcwzqROWY5jmIm7ItGw";
const SERVER = "http://localhost:3002";
function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function runGame(socket, gn) {
  return new Promise(function(resolve, reject) {
    var crossedEvents = [];
    var gameOverData = null;
    var currentLane = 0;
    console.log("\n============================================================");
    console.log("GAME " + gn + " STARTING");
    console.log("============================================================");
    socket.removeAllListeners("game:started");
    socket.removeAllListeners("game:crossed");
    socket.removeAllListeners("game:over");
    socket.removeAllListeners("game:error");
    socket.on("game:error", function(d) {
      console.log("[GAME " + gn + "] ERROR: " + JSON.stringify(d, null, 2));
    });
    socket.on("game:started", function(d) {
      console.log("[GAME " + gn + "] game:started => " + JSON.stringify(d, null, 2));
      currentLane = 1;
      console.log("[GAME " + gn + "] Sending game:cross for lane " + currentLane + "...");
      socket.emit("game:cross");
    });
    socket.on("game:crossed", function(d) {
      console.log("\n[GAME " + gn + "] game:crossed (lane " + currentLane + ") => ALL FIELDS:");
      console.log("  lane: " + d.lane);
      console.log("  safe: " + d.safe);
      console.log("  isSafeZone: " + d.isSafeZone);
      console.log("  multiplier: " + d.multiplier);
      console.log("  nextMultiplier: " + d.nextMultiplier);
      if (d.revealedLane) {
        console.log("  revealedLane: " + JSON.stringify(d.revealedLane));
        console.log("  revealedLane.hasCar: " + d.revealedLane.hasCar);
      } else {
        console.log("  revealedLane: " + d.revealedLane);
      }
      var kf = ["lane","safe","isSafeZone","multiplier","nextMultiplier","revealedLane"];
      Object.keys(d).forEach(function(k) {
        if (kf.indexOf(k) === -1) console.log("  [EXTRA FIELD] " + k + ": " + JSON.stringify(d[k]));
      });
      crossedEvents.push(Object.assign({}, d, { requestedLane: currentLane }));
      if (d.safe) {
        currentLane++;
        setTimeout(function() {
          console.log("[GAME " + gn + "] Sending game:cross for lane " + currentLane + "...");
          socket.emit("game:cross");
        }, 300);
      }
    });
    socket.on("game:over", function(d) {
      gameOverData = d;
      console.log("\n[GAME " + gn + "] game:over => ALL FIELDS:");
      console.log("  result: " + d.result);
      console.log("  multiplier: " + d.multiplier);
      console.log("  profit: " + d.profit);
      if (d.revealedLanes) {
        console.log("  revealedLanes (" + d.revealedLanes.length + " total):");
        d.revealedLanes.forEach(function(lane, idx) {
          console.log("    Lane " + idx + ": hasCar=" + lane.hasCar + ", " + JSON.stringify(lane));
        });
      } else {
        console.log("  revealedLanes: " + d.revealedLanes);
      }
      var kf2 = ["result","multiplier","profit","revealedLanes"];
      Object.keys(d).forEach(function(k) {
        if (kf2.indexOf(k) === -1) console.log("  [EXTRA FIELD] " + k + ": " + JSON.stringify(d[k]));
      });
      console.log("\n[GAME " + gn + "] ====== BUG ANALYSIS ======");
      if (d.revealedLanes) {
        var bugFound = false;
        crossedEvents.forEach(function(ce, idx) {
          var cli = ce.lane !== undefined ? ce.lane : idx;
          var rbi = d.revealedLanes[cli];
          var rbim = d.revealedLanes[cli - 1];
          console.log("  Crossed event #" + (idx+1) + ": lane=" + ce.lane + ", safe=" + ce.safe + ", isSafeZone=" + ce.isSafeZone);
          if (rbi) {
            console.log("    -> revealedLanes[" + cli + "].hasCar = " + rbi.hasCar);
            if (ce.safe === true && rbi.hasCar === true) {
              console.log("    *** BUG FOUND: Lane " + cli + " safe=true in game:crossed but hasCar=true in revealedLanes! ***");
              bugFound = true;
            }
          }
          if (rbim && (cli-1) !== cli) {
            console.log("    -> revealedLanes[" + (cli-1) + "].hasCar = " + rbim.hasCar);
            if (ce.safe === true && rbim.hasCar === true) {
              console.log("    *** BUG FOUND: Lane " + (cli-1) + " safe=true in game:crossed but hasCar=true in revealedLanes! ***");
              bugFound = true;
            }
          }
        });
        if (!bugFound) console.log("  No safe/hasCar mismatch found in this game.");
      }
      if (crossedEvents.length > 0) {
        var lc = crossedEvents[crossedEvents.length - 1];
        console.log("\n  Last crossed event: safe=" + lc.safe + ", isSafeZone=" + lc.isSafeZone);
        console.log("  game:over result: " + d.result);
        if (lc.safe === true && d.result === "hit") {
          console.log("  *** BUG FOUND: Last game:crossed was safe=true but game:over says result=hit! ***");
        } else if (lc.safe === false && d.result !== "hit") {
          console.log("  *** ANOMALY: Last game:crossed was safe=false but game:over result is " + d.result + " (expected hit) ***");
        } else {
          console.log("  Result consistency: OK");
        }
      }
      console.log("[GAME " + gn + "] ====== END ANALYSIS ======\n");
      socket.removeAllListeners("game:started");
      socket.removeAllListeners("game:crossed");
      socket.removeAllListeners("game:over");
      socket.removeAllListeners("game:error");
      resolve({ crossedEvents: crossedEvents, gameOverData: gameOverData });
    });
    console.log("[GAME " + gn + "] Emitting game:start with amount=5, difficulty=1");
    socket.emit("game:start", { amount: 5, difficulty: 1 });
  });
}
async function main() {
  console.log("Connecting to Socket.io at " + SERVER);
  var socket = io(SERVER, { auth: { token: TOKEN }, transports: ["websocket"] });
  await new Promise(function(resolve, reject) {
    socket.on("connect", function() {
      console.log("Connected! Socket ID: " + socket.id);
      resolve();
    });
    socket.on("connect_error", function(err) {
      console.error("Connection error: " + err.message);
      reject(err);
    });
  });
  socket.on("balance:update", function(d) {
    console.log("[BALANCE UPDATE] " + JSON.stringify(d));
  });
  var allResults = [];
  for (var i = 1; i <= 3; i++) {
    try {
      var result = await runGame(socket, i);
      allResults.push(result);
    } catch (err) {
      console.error("Game " + i + " failed: " + err);
    }
    await sleep(1000);
  }
  console.log("\n============================================================");
  console.log("FINAL SUMMARY ACROSS ALL GAMES");
  console.log("============================================================");
  allResults.forEach(function(r, idx) {
    var g = idx + 1;
    var ce = r.crossedEvents;
    var go = r.gameOverData;
    console.log("Game " + g + ": " + ce.length + " lanes crossed, result=" + go.result + ", multiplier=" + go.multiplier + ", profit=" + go.profit);
    if (go.revealedLanes) {
      ce.forEach(function(crossEvt) {
        var li = crossEvt.lane;
        for (var off = -1; off <= 1; off++) {
          var ci = li + off;
          if (ci >= 0 && ci < go.revealedLanes.length) {
            var rl = go.revealedLanes[ci];
            if (crossEvt.safe === true && rl.hasCar === true) {
              console.log("  *** CONFIRMED BUG in Game " + g + ": crossed lane " + li + " (safe=true) but revealedLanes[" + ci + "].hasCar=true ***");
            }
          }
        }
      });
    }
  });
  console.log("\nDone. Disconnecting.");
  socket.disconnect();
  process.exit(0);
}
main().catch(function(err) { console.error("Fatal error: " + err); process.exit(1); });
