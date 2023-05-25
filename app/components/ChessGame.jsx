import React, { useEffect, useState } from 'react';

const ChessGame = () => {
  const [fen, setFen] = useState('start');
  const [game, setGame] = useState(null);
  const [Chessboard, setChessboard] = useState(null);
  const [lozza, setLozza] = useState(null);

  useEffect(() => {
    import('chess.js').then((module) => {
      setGame(new module.Chess());
    });

    import('chessboardjsx').then((module) => {
      setChessboard(() => module.default.default);
    });
  }, []);


  const handleMove = ({ sourceSquare, targetSquare }) => {
    let move;
    try {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to a queen for simplicity's sake
      });
    } catch (e) {
      move = null;
    }

    // illegal move
    if (move === null) return 'snapback';

    setFen(game.fen());
  };

  useEffect(() => {
    const lozzaWorker = new Worker("./lozza.js");
    lozzaWorker.postMessage('uci');                // lozza uses the uci communication protocol
    setLozza(lozzaWorker);
  }, []);

  useEffect(() => {
    if (lozza && game && game.turn() === 'b') {
      lozza.postMessage('ucinewgame');         // reset tt
      let history = game.history({verbose: true});
      let lans = history.map(x => x['lan']);
      lozza.postMessage(`position startpos moves ${lans.join(' ')} `);
      lozza.postMessage('go depth 10');        // 10 ply search

      lozza.onmessage = function(event) {
        let data = event.data;
        if (data.includes('bestmove')) {
          let bestMove = event.data.slice(9);
          game.move(bestMove, { sloppy: true });
          setFen(game.fen());
        }
      };
    }
  }, [fen, game]);
  

  if (!Chessboard) {
    return <div>Loading...</div>;
  }
  return (
    <div>
    <Chessboard position={fen} onDrop={handleMove} />
    {
      (game && game.isGameOver()) &&
      <div>
        Thank you for the game - the game is over now
      </div>
    }
    </div>
  );
};

export default ChessGame;
