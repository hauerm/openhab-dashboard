import AirQualityCard from "./components/AirQualityCard.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div
      className="font-sans min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6"
      style={{
        backgroundImage: `url('/static/locations/house1.JPEG')`,
      }}
    >
      <div className="w-full max-w-6xl flex flex-col items-stretch gap-6 lg:flex-row">
        <div className="flex justify-center lg:justify-end">
          <AirQualityCard location="EG" />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
