import JarvisUI from "./pages/JarvisUI";
import { ControlPlane } from "./components/ControlPlane";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <ControlPlane />
        </div>
        <JarvisUI />
      </div>
    </div>
  );
}

export default App;
