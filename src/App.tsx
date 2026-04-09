import { useEffect } from "react";
import AirQualityCard from "./components/AirQualityCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initializeWebSocket,
  disconnectWebSocket,
} from "./services/websocket-service";

function App() {
  useEffect(() => {
    void initializeWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div
      className="font-sans min-h-screen bg-slate-900 bg-cover bg-center bg-no-repeat p-8"
      style={{
        backgroundImage: `url('/static/locations/house1.JPEG')`,
      }}
    >
      <div className="w-full max-w-6xl mx-auto">
        <AirQualityCard location="EG" />
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
