import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import Lozza from "~/components/Lozza";
import Lichess from "~/components/Lichess";
import { Link } from "@remix-run/react";

const ChessGameWhite = () => {
  const [fen, setFen] = useState("start");
  const [game, setGame] = useState(null);
  const [Chessboard, setChessboard] = useState(null);
  const [lozza, setLozza] = useState(null);
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [conn, setConn] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [lives, setLives] = useState(3);

  useEffect(() => {
    import("chess.js").then((module) => {
      setGame(new module.Chess());
    });

    import("chessboardjsx").then((module) => {
      setChessboard(() => module.default.default);
    });

    import("~/components/Peering").then((module) => {
      setPeer(module.default());
    });
  }, []);

  const handleHumanMove = ({ sourceSquare, targetSquare, promotion }) => {
    if (game.turn() === "b") {
      return "snapback";
    }

    let moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: promotion || "q", // always promote to a queen for simplicity's sake
    };

    let move;
    try {
      move = game.move(moveData);
    } catch (e) {
      move = null;
    }

    // illegal move
    if (move === null) return "snapback";

    peer.sendData({
      ...moveData,
      type: "human",
    });
    setFen(game.fen());
  };

  const handleEngineMove = (lan) => {
    let move;
    try {
      move = game.move(lan);
    } catch (e) {
      move = null;
    }

    // illegal move
    if (move === null) return "snapback";

    peer.sendData({
      lan: lan,
      type: "engine",
    });
    setFen(game.fen());
  };

  const handleOpponentMove = (oppData) => {
    let moveData;

    if (oppData.type === "human") {
      moveData = {
        from: oppData.from,
        to: oppData.to,
        promotion: oppData.promotion || "q", // always promote to a queen for simplicity's sake
      };
    } else {
      moveData = oppData.lan;
    }

    let move;
    try {
      move = game.move(moveData);
    } catch (e) {
      move = null;
    }

    // illegal move
    if (move === null) return "snapback";
    setFen(game.fen());
  };

  function copyPeerIdToClipboard() {
    let currentUrl = window.location.href;
    let blackUrl = `${currentUrl}${peerId}`;
    navigator.clipboard.writeText(blackUrl);
    setClipboard(true);
  }

  useEffect(() => {
    const lozzaWorker = Lozza();
    lozzaWorker.initLozza();
    setLozza(lozzaWorker);
  }, []);

  useEffect(() => {
    const initPeer = async () => {
      peer.initPeer();
      let actualPeerId = await peer.getPeerId();
      setPeerId(actualPeerId);

      let actualConn = await peer.getConnection();
      setConn(actualConn);

      peer.onData((data) => {
        handleOpponentMove(data);
      });
    };

    if (peer !== null) {
      initPeer().catch(console.error);
    }
  }, [peer]);

  function fishMe() {
    let history = game.history({ verbose: true });
    let lans = history.map((x) => x["lan"]);

    lozza.evalPosition(lans, (bestMove) => {
      handleEngineMove(bestMove);
      setLives(lives - 1);
    });
  }

  function canFish() {
    return game && game.turn() === "w" && lives > 0 && !game.isGameOver();
  }

  function analyzePosition() {
    Lichess().analyzePosition(game, "white");
  }

  if (!Chessboard || !peerId) {
    return <div>Loading...</div>;
  }

  if (!conn) {
    return (
      <div class="container mx-auto">
        <div class="py-10">
          <h1 class="text-2xl font-bold">Call a Fish</h1>
          <p>
            Copyright of{" "}
            <Link to="https://github.com/abhinavrk">Abhinav Ramakrishnan</Link>{" "}
            & <Link to="https://github.com/KerimovEmil">Emil Kerimov</Link>
          </p>
        </div>
        <div class="flex flex-col gap-y-20">
          <div class="flex flex-row justify-center">
            {peerId && (
              <Button variant="destructive" onClick={copyPeerIdToClipboard}>
                <p class="text-xl">Play against a friend!</p>
              </Button>
            )}
          </div>

          <div class="flex flex-row justify-center">
            {clipboard && (
              <Alert>
                <AlertTitle class="font-bold text-xl">
                  URL copied to clipboard!
                </AlertTitle>
                <AlertDescription>
                  <p>
                    A URL has been copied to your clipboard. Share this URL with
                    your friend. Once they've connected you should be able to
                    see a chessboard and play a game as white.
                  </p>
                  <p>
                    If you wanted to play as black, ask them to start the game
                    and give you the URL.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  }

  // conn, peer, and chessboard are all present
  return (
    <div class="container mx-auto">
      <div class="py-10">
        <h1 class="text-2xl font-bold">Call a Fish</h1>
        <p>
          Copyright of{" "}
          <Link to="https://github.com/abhinavrk">Abhinav Ramakrishnan</Link> &{" "}
          <Link to="https://github.com/KerimovEmil">Emil Kerimov</Link>
        </p>
      </div>
      <div class="text-lg py-10">
        <p>
          This is a chess variant that gives you 3 opportunities to ask an
          engine for advice. You can get the engine to play on your behalf by
          hitting the "Fish Me!" button.
        </p>
        <p>
          You will not get the eval, or the continuation. The engine simply
          plays a move for you and you take it from there.
        </p>
      </div>
      <div class="flex flex-row gap-x-5">
        <div>
          <Chessboard position={fen} onDrop={handleHumanMove} class="px-5" />
        </div>
        <div class="flex flex-col gap-y-10">
          {canFish() && (
            <Button variant="destructive" onClick={fishMe}>
              Fish Me ({lives})!
            </Button>
          )}

          {!canFish() && (
            <Button variant="destructive" disabled>
              Fish Me ({lives})!
            </Button>
          )}

          {game && game.isGameOver() && (
            <Button variant="destructive" onClick={analyzePosition}>
              Analyze on Lichess.
            </Button>
          )}
        </div>
      </div>
      {game && game.isGameOver() && (
        <div class="py-5">
          <Alert>
            <AlertTitle>Game Over!</AlertTitle>
            <AlertDescription>Thank you for the game.</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default ChessGameWhite;
