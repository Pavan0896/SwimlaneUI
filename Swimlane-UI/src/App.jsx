import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";
import SwimlaneBoard from "./Components/SwimlaneBoard";

function App() {
  return (
    <>
      <h1>Swimlane UI</h1>
      <DndProvider backend={HTML5Backend}>
        <SwimlaneBoard />
      </DndProvider>
    </>
  );
}

export default App;
