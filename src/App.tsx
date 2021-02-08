import "./App.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useStore, StoreContextProvider } from "./store";
import { observer } from "mobx-react-lite";
import Board from "./components/Board";

const Main = observer(() => {
  const { boards } = useStore() ?? {};
  return (
    <main className="App-main">
      <button
        style={{ position: "absolute", top: 0 }}
        onClick={() => { boards?.addNewBoard(); }}
      >
        add new Board
      </button>
      {boards?.boardsIds.map(id => (
        <Board key={id} id={id} />
      ))}
    </main>
  );
});

const App = () => (
  <StoreContextProvider>
    <DndProvider backend={HTML5Backend}>
      <Main />
    </DndProvider>
  </StoreContextProvider>
);
export default App;
