import { useEffect, useState } from "react";
import MiniKit from "@worldcoin/minikit-js";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [verified, setVerified] = useState(false);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  const API = "https://mi-backend.onrender.com"; // 🔴 CAMBIA ESTO

  useEffect(() => {
    const init = async () => {
      if (!MiniKit.isInstalled()) {
        alert("Abre esto dentro de World App");
        return;
      }

      const user = await MiniKit.user();
      setWallet(user.walletAddress);
    };

    init();
  }, []);

  const verify = async () => {
    try {
      setLoading(true);

      const result = await MiniKit.verify({
        action: "mining_app",
        signal: wallet
      });

      if (result.success) {
        await fetch(`${API}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: wallet,
            proof: result.proof
          })
        });

        setVerified(true);
        alert("Verificado ✅");
      }
    } catch {
      alert("Error verificando");
    } finally {
      setLoading(false);
    }
  };

  const mine = async () => {
    if (!verified) return alert("Primero verifica");

    const res = await fetch(`${API}/mine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: wallet })
    });

    const data = await res.json();

    if (data.points !== undefined) setPoints(data.points);
    else alert(data.error);
  };

  const claim = async () => {
    const res = await fetch(`${API}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: wallet })
    });

    const data = await res.json();

    if (data.success) {
      alert("TX: " + data.tx);
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#111", minHeight: "100vh" }}>
      <h1>🚀 Mining App</h1>

      <p>Wallet: {wallet || "..."}</p>
      <p>Estado: {verified ? "✅" : "❌"}</p>
      <p>Puntos: {points}</p>

      <button onClick={verify}>Verificar</button>
      <button onClick={mine}>Minar</button>
      <button onClick={claim}>Retirar</button>
    </div>
  );
}
