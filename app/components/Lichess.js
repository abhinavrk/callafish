const Lichess = () => {
  function openInNewTab(url) {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  }

  function analyzePosition(game, player) {
    fetch("https://lichess.org/api/import", {
      method: "POST",
      mode: "cors", // no-cors, *cors, same-origin
      headers: {
        Authorization: `Bearer lip_uA2k70Ba3aR20d75HOu1`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pgn: game.pgn(),
      }),
    }).then((res) => {
      let resbody = res.json();
      resbody.then((jsonbody) => {
        let orientedUrl = `${jsonbody.url}/${player}`;
        openInNewTab(orientedUrl);
      });
    });
  }

  return {
    analyzePosition,
  };
};

export default Lichess;
