import AirQualityCard from "./components/AirQualityCard.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div
      className="font-sans min-h-screen bg-cover bg-center bg-no-repeat p-8"
      style={{
        backgroundImage: `url('/static/locations/house1.JPEG')`,
      }}
    >
      <div className="w-full max-w-2xl">
        <AirQualityCard location="EG" />
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
