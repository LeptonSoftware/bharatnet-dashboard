import { HTTPEvent, toWebRequest } from "vinxi/http";

export async function GET(event: HTTPEvent) {
  const request = toWebRequest(event);

  const url =
    "http://networkaccess.bnet.leptonsoftware.com/RVNL/Smartinventory_services/api/VectorLayer/GetVectorEntityStyle";
  const options = {
    method: "POST",
    headers: {
      Authorization:
        "Bearer dsM2pXNdRQ1HosWeA6kTbMk2dLsjVNbFzTb3No0-8FS3Mp_JI9kFWrqPVZVFgd5oBmsOXUemQpnliPnLBSp1KBdnp-Nj64w999c3D70zU3n43aEgDqMtHGpm1F2ZcQm1kT5_u-h8OA8eehwIT9bISb2AV26POA9tZoRlni5XBWk2hgxR-w5rslHqOPi6mWnIqPKTu3NukFJTJQn4XwJTeQVwVUagcJ6IIC3-TcAhvrs-QCmO1ehveR-YMwd9Kca779dtHcqiIueHzPlWahyIs6cmIOuL0I3SXWiA1RflJT9yuOW82mz8B3KgcTcUMYhmO9pkZn6qCr0idiyMiho4dQhVY-cIpXVlqL9AzQUdaPmIBll34F9pVv_p9fEGDcviWFWK0PZm-Fp4kI-jqg_z9yEWoCUxLI2-piYux2IbBMjmj9XHoyO2m4eBRP49Wr13-snVnkp-cWP8XbT7SpTCxA",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.results.LayerAttribute;
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}
