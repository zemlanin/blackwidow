function getGameId() {
  var gameId = null;
  if (location.hash && location.hash.match(/^#[0-9a-f]{4,10}$/)) {
    gameId = location.hash.replace(/^#/, '')
  }

  // TODO: check for current sessions

  return gameId || null;
}

function setGameId(gameId) {
  location.hash = gameId;
}

function generateGameId() {
  return Math.random().toString(16).substring(2, 6);
}

module.exports = {
  getGameId: getGameId,
  setGameId: setGameId,
  generateGameId: generateGameId,
}
