import "./App.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useStore, StoreContextProvider } from "./store";
import { observer } from "mobx-react-lite";
import Board from "./components/Board";
import AddNewBoard from "./components/AddNewBoard";

const Main = observer(() => {
  const { boards } = useStore() ?? {};
  return (
    <main className="App-main">
      {boards?.boardsIds.map(id => (
        <Board key={id} id={id} />
      ))}
      <AddNewBoard />
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
