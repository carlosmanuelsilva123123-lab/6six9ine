import { useEffect, useState } from "react";
import MiniKit from "@worldcoin/minikit-js";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🚀 CONECTAR MINIKIT
  useEffect(() => {
    const init = async () => {
      console.log("MiniKit instalado:", MiniKit.isInstalled());

      if (!MiniKit.isInstalled()) {
        alert("❌ Abre esta app dentro de World App");
        return;
      }

      try {
        const user = await MiniKit.user();
        console.log("Usuario:", user);

        setWallet(user.walletAddress);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  // 🔐 VERIFICAR WORLD ID
  const verify = async () => {
    try {
      setLoading(true);

      const result = await MiniKit.verify({
        action: "mining_app",
        signal: wallet
      });

      console.log("Resultado verify:", result);

      if (result.success) {
        setVerified(true);
        alert("✅ Verificado correctamente");
      } else {
        alert("❌ No verificado");
      }

    } catch (err) {
      console.error(err);
      alert("Error en verificación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#0b0b0b",
      color: "white",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Arial"
    }}>
      <h1>🚀 MiniKit Test</h1>

      <p><b>Wallet:</b> {wallet || "Conectando..."}</p>
      <p><b>Estado:</b> {verified ? "✅ Verificado" : "❌ No verificado"}</p>

      <button onClick={verify} disabled={loading}>
        {loading ? "Verificando..." : "Verificar"}
      </button>
    </div>
  );
}
