import type { FC } from 'react'
import { useDrag } from 'react-dnd'
import type { ID } from '../store'
import logo from "../assets/logo.svg";

enum ItemTypes {
  CARD = 'CARD'
}


const Card: FC<{ text: string, id: ID, boardId: ID }> = (({ id, boardId, text }) => {
  const [{ opacity }, dragRef] = useDrag({
    item: { type: ItemTypes.CARD, id, boardId },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1
    }),
  })
  return (
    <div ref={dragRef} style={{ opacity }} className='item'>
      <img src={logo} className="App-logo" alt="logo" />
      {text}
    </div>
  )
})

export default Card
