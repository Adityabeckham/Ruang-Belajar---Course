import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  const data = useQuery(api.message.get);
  const message = data ? data.message : "Loading...";

  return (
    <div>
      <h1>React + Convex Backend</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;