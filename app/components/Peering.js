import Peer from "peerjs";

const Peering = () => {
  let peer = null;
  let peerId = null;
  let conn = null;
  let callbacks = {};

  let peerIdPromiseResolve = null;
  let peerIdPromise = new Promise((resolve, reject) => {
    peerIdPromiseResolve = resolve;
  });

  let connPromiseResolve = null;
  let connPromise = new Promise((resolve, reject) => {
    connPromiseResolve = resolve;
  });


  async function initPeer() {
    if (peerId !== null) {
      return;
    }

    peer = new Peer();

    peer.on("error", function (err) {
      console.warn(err);
    });

    peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
      peerId = id;
      peerIdPromiseResolve(peerId);
    });

    peer.on("connection", function (connection) {
      resolveConnection(connection);
    });

    return peerIdPromise;
  }

  function resolveConnection(connection) {
    console.log("Connection established with other player.");
    connPromiseResolve(connection);
    conn = connection;
    connPromise.then((conn) => {
      conn.on("data", function (dataJson) {
        const data = JSON.parse(dataJson);
        evalCallbacks(data);
      });
    });
  }

  function getPeerId() {
    return peerIdPromise;
  }

  function getConnection() {
    return connPromise;
  }

  function evalCallbacks(data) {
    for (const [_, callbackFn] of Object.entries(callbacks)) {
      callbackFn(data);
    }
  }

  function connectToPeer(whitesPeerId) {
    if (peerId === null) {
      throw new Error("self not setup");
    }

    let connection = peer.connect(whitesPeerId);
    resolveConnection(connection);
    return peer;
  }

  function sendData(data) {
    if (conn === null) {
      throw new Error("can only send data with a valid connection");
    }

    conn.send(JSON.stringify(data));
  }

  function onData(callbackFn, callbackUid) {
    callbacks[callbackUid] = callbackFn;
  }

  return {
    initPeer,
    getPeerId,
    getConnection,
    connectToPeer,
    sendData,
    onData,
  };
};

export default Peering;
