import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import {Button} from '~/components/ui/button';

const Lozza = () => {
  let lozza = null;

  function initLozza() {
    const lozzaWorker = new Worker("./lozza.js");
    lozzaWorker.postMessage("uci"); // lozza uses the uci communication protocol
    lozza = lozzaWorker;
  }

  function evalPosition(lans, callbackFn) {
    if (lozza === null) {
      throw new Error('cannot eval without setting up engine');
    }

    lozza.postMessage("ucinewgame"); // reset tt
    lozza.postMessage(`position startpos moves ${lans.join(" ")} `);
    lozza.postMessage("go depth 10"); // 10 ply search

    lozza.onmessage = function (event) {
      let data = event.data;
      if (data.includes("bestmove")) {
        let bestMove = event.data.slice(9);
        callbackFn(bestMove);
      }
    };
  }

  return {
    initLozza,
    evalPosition,
  };
};

export default Lozza;
