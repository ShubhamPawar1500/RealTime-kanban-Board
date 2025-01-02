// Column.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemType } from '../constants';
import Card1 from './Card1';

const Column = ({ status, cards, onDropCard, setReload, handleUpdate,socket }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType.CARD,
    drop: (item) => onDropCard(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} style={{ flex: 1, padding: '0px 8px 8px 8px', margin: '8px', backgroundColor: isOver ? 'lightblue' : 'lightgray', minHeight: '300px',overflow: 'auto', borderRadius: '12px 12px 6px 6px', height: 600 }}>
      <div className="note-head" style={{ background: status === 'To Do' ? 'rgb(0, 134, 255)' : status === 'In Progress' ? 'rgb(255, 189, 0)' : 'rgb(0, 178, 18)' }}>{status}</div>
      <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'center'}}>
      {cards.map((card) => (
        <>
        <Card1 key={card._id} id={card._id} text={card.title} description={card.description} setReload={setReload} handleUpdate={handleUpdate} socket={socket} />
        </>
      ))}
      </div>
    </div>
  );
};

export default Column;
