import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useStore, StoreContextProvider } from "../store";
import { observer } from "mobx-react-lite";
import Board from "./Board";
import AddNewBoard from "./AddNewBoard";

import styled from "styled-components";

const MainStyled = styled.main`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  font-size: 12px;
  color: white;
  padding-top: 50px;
  position: relative;
`;

const Main = observer(() => {
  const { boards } = useStore() ?? {};
  return (
    <MainStyled>
      {boards?.boardsIds.map(id => (
        <Board key={id} id={id} />
      ))}
      <AddNewBoard />
    </MainStyled>
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
