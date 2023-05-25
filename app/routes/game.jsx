// src/routes/game.js
import ChessGame from '../components/ChessGame';

export const headers = ({ }) => ({
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
});

export default function Game() {
  return <ChessGame />;
}
