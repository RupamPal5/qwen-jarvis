import JarvisUI from "./pages/JarvisUI";
import { ControlPlane } from "./components/ControlPlane";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
        <div className="container mx-auto px-4 py-6">
          <ControlPlane />
          <div className="mt-6">
            <JarvisUI />
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
