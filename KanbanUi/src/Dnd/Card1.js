// Card.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemType } from '../constants';
import Card from 'react-bootstrap/Card';
import { MdDelete } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';

const Card1 = ({ id, text, description, setReload, handleUpdate,socket }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.CARD,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDelete = async(id) =>{
    let d = await axios.delete(`http://localhost:8080/${id}`,null);
    if(d.data.status === 'success'){
      Swal.fire({
        title:'Deleted',
        text:d.msg,
        icon:'success'
      })
      setReload(true);
      socket.emit('update card','update');
    }else if(d.data.status === 'error'){
      Swal.fire({
        title:'Warning',
        text:d.msg,
        icon:'error'
      })
    }else{
      Swal.fire({
        title:'Error',
        text:'Something Went Wrong',
        icon:'error'
      })
    }}

    const onDoubleClick = (obj) =>{
      handleUpdate(obj)
    }

  return (
    <>
    <Card
          bg={"Secondary"}
          key={"Secondary"}
          text={'dark'}
          style={{ width: '18rem',padding: '8px', margin: '4px', opacity: isDragging ? 0.5 : 1 }}
          className="mb-2"
          ref={drag}
          onDoubleClick={()=>onDoubleClick({id:id,title:text,description:description})}
        >
          <div style={{display:'flex',justifyContent:'flex-end'}}><MdDelete onClick={()=>handleDelete(id)} /></div>
          <Card.Body style={{paddingTop:0}}>
            <Card.Title>{text}</Card.Title>
            <Card.Text dangerouslySetInnerHTML={{__html:description}}>
            </Card.Text>
          </Card.Body>
        </Card>
        </>
  );
};

export default Card1;
