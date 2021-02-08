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
  font-size: 12px;
  padding-top: 10px;
`;

const Container = styled.div`
  display: flex;
  position: relative;
  align-items: flex-start;
`;

const Title = styled.h1`
  margin-left: 20px;
  font-szie: 32px;
  color: #fffb;
`;

const Main = observer(() => {
  const { lists } = useStore() ?? {};
  return (
    <MainStyled>
      <Title>Task Manager Board</Title>
      <Container>
        {lists?.listIds.map(id => (
          <List key={id} id={id} />
        ))}
        <AddNewList />
      </Container>
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
