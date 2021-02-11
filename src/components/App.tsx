import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import { useStore, StoreContextProvider } from "../store";
import store, {State} from "../store";
// import { observer } from "mobx-react-lite";
import List from "./List";
import AddNewList from "./AddNewList";
import { useMemo } from "react";
import { TouchBackend } from "react-dnd-touch-backend";
import { Provider, useSelector } from 'react-redux'

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

const Main = () => {
  // const { lists } = useStore() ?? {};
  const listsIds = useSelector((state: State) => Object.keys(state.list))
  return (
    <MainStyled>
      <Title>Task Manager Board</Title>
      <Container>
        {listsIds.map(id => (
          <List key={id} id={id} />
        ))}
        <AddNewList />
      </Container>
    </MainStyled>
  );
};

const App = () => {
  const isTouch = useMemo(
    () => "ontouchstart" in window || !!navigator.msMaxTouchPoints,
    []
  );
  return (
    <Provider store={store}>
      <DndProvider backend={isTouch ? TouchBackend : HTML5Backend}>
        <Main />
      </DndProvider>
    </Provider>
  );
};
export default App;
