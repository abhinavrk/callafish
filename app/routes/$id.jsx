import { json } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";
import ChessGameBlack from "../components/ChessGameBlack";

export let loader = async ({ params }) => {
  // params object contains the URL parameters
  const { id } = params;

  return json({id});
};

export default function IdComponent() {
  const data = useLoaderData();

  return (
    <ChessGameBlack whitePeerId={data.id} />
  );
}
