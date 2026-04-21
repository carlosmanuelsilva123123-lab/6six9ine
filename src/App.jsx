import { useEffect, useState } from "react";
import MiniKit from "@worldcoin/minikit-js";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [verified, setVerified] = useState(false);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔗 CAMBIA ESTO POR TU BACKEND REAL
  const API = "https://mi-backend.onrender.com";

  useEffect(() => {
    const init = async () => {
      console.log("MiniKit instalado:", MiniKit.isInstalled());

      if (!MiniKit.isInstalled()) {
        alert("Abre esta app dentro de World App");
        return;
      }

      try {
        const user = await MiniKit.user();
        setWallet(user.walletAddress);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  const verify = async () => {
    try {
      setLoading(true);

      const result = await MiniKit.verify({
        action: "mining_app",
        signal: wallet,
      });

      if (result.success) {
        await fetch(`${API}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: wallet,
            proof: result.proof,
          }),
        });

        setVerified(true);
        alert("Verificado ✅");
      }
    } catch (err) {
      console.error(err);
      alert("Error en verificación");
    } finally {
      setLoading(false);
    }
  };

  const mine = async () => {
    if (!verified) return alert("Primero verifica");

    try {
      const res = await fetch(`${API}/mine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wallet }),
      });

      const data = await res.json();

      if (data.points !== undefined) {
        setPoints(data.points);
      } else {
        alert(data.error || "Error minando");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const claim = async () => {
    try {
      const res = await fetch(`${API}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wallet }),
      });

      const data = await res.json();

      if (data.success) {
        alert("TX enviada: " + data.tx);
      } else {
        alert(data.error || "Error al retirar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  return (
    <div style={{ padding: 20, background: "#111", color: "#fff", minHeight: "100vh" }}>
      <h1>🚀 Mining App</h1>

      <p>Wallet: {wallet || "..."}</p>
      <p>Estado: {verified ? "✅ Verificado" : "❌ No verificado"}</p>
      <p>Puntos: {points}</p>

      <button onClick={verify} disabled={loading}>
        {loading ? "Verificando..." : "Verificar"}
      </button>

      <br /><br />

      <button onClick={mine}>Minar</button>

      <br /><br />

      <button onClick={claim}>Retirar</button>
    </div>
  );
}
