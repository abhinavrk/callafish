import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import Lozza from "~/components/Lozza";

const ChessGameWhite = () => {
  const [fen, setFen] = useState("start");
  const [game, setGame] = useState(null);
  const [Chessboard, setChessboard] = useState(null);
  const [lozza, setLozza] = useState(null);

  useEffect(() => {
    import("chess.js").then((module) => {
      setGame(new module.Chess());
    });

    import("chessboardjsx").then((module) => {
      setChessboard(() => module.default.default);
    });
  }, []);

  const handleMove = ({ sourceSquare, targetSquare }) => {
    let move;
    try {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for simplicity's sake
      });
    } catch (e) {
      move = null;
    }

    // illegal move
    if (move === null) return "snapback";

    setFen(game.fen());
  };

  useEffect(() => {
    const lozzaWorker = Lozza();
    lozzaWorker.initLozza();
    setLozza(lozzaWorker);
  }, []);

  useEffect(() => {
    if (lozza && game && game.turn() === "b") {
      let history = game.history({ verbose: true });
      let lans = history.map((x) => x["lan"]);

      lozza.evalPosition(lans, (bestMove) => {
        game.move(bestMove, { sloppy: true });
        setFen(game.fen());
      });
    }
  }, [fen, game]);

  if (!Chessboard) {
    return <div>Loading...</div>;
  }

  return (
    <div class="container mx-auto px-10 py-20">
      <h1 class="text-2xl py-10 font-bold">Call a Fish</h1>
      <div class="flex flex-row gap-x-5">
        <div>
          <Chessboard position={fen} onDrop={handleMove} class="px-5" />
        </div>
        <div class="shrink">
          <Button variant="destructive">Fish Me!</Button>
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
