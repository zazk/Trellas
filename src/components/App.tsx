import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useStore, StoreContextProvider } from "../store";
import { observer } from "mobx-react-lite";
import List from "./List";
import AddNewList from "./AddNewList";

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
  const { lists } = useStore() ?? {};
  return (
    <MainStyled>
      {lists?.listIds.map(id => (
        <List key={id} id={id} />
      ))}
      <AddNewList />
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
