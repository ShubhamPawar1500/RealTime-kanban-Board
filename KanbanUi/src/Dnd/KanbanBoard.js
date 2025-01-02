// KanbanBoard.js
import React, { useEffect, useState } from 'react';
import Column from './Column';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa6';
import axios from 'axios';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client'
import Editor from 'react-simple-wysiwyg';

const socket = io('http://localhost:8080');

const initialCards = [
    { id: '1', text: 'Task 1', status: 'To Do' },
    { id: '2', text: 'Task 2', status: 'To Do' },
    { id: '3', text: 'Task 3', status: 'In Progress' },
    { id: '4', text: 'Task 4', status: 'Done' },
    { id: '5', text: 'Task 1', status: 'To Do' },
    { id: '6', text: 'Task 2', status: 'To Do' },
    { id: '7', text: 'Task 3', status: 'In Progress' },
    { id: '8', text: 'Task 4', status: 'Done' },
];

const KanbanBoard = () => {
    const [cards, setCards] = useState(initialCards);
    const [showadd, setshowAdd] = useState(false);
    const [id, setId] = useState();
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [status, setStatus] = useState();
    const [reload, setReload] = useState();
    const [operation, setOperation] = useState('Add');

    useEffect(()=>{
        const getAllNotes = async() =>{
            let d = await axios.get('http://localhost:8080');
            if(d.data){
                console.log(d.data);
                setCards(d.data);
            }
        }

        getAllNotes();
        setReload(false);
    },[reload])

    socket.on('update card',(msg) =>{
        setReload(true);
    })

    const handleDropCard = async(id, newStatus) => {
        // setCards((prevCards) =>
        //     prevCards.map((card) =>
        //         card.id === id ? { ...card, status: newStatus } : card
        //     )
        // );
        const res = await axios.put(`http://localhost:8080/${id}/${newStatus}`,null);
        console.log(res);
        setReload(true);
        socket.emit('update card','update');
    };

    const columns = ['To Do', 'In Progress', 'Done'];

    const ModalOpen = () => { setshowAdd(true) }

    const ModalClose = () => {
        setId(null);
        setTitle(null)
        setDescription(null)
        setStatus(null)
        setshowAdd(false)
        setOperation('Add')
    }

    const handlesubmit = async() => {
        if(title == null || title == ''){
            Swal.fire({
                title:'Warning',
                text:'Title is Empty',
                icon:'warning'
            })
        }else if(description == null || description == ''){
            Swal.fire({
                title:'Warning',
                text:'Description is Empty',
                icon:'warning'
            })
        }else{
            const data = {
                title:title,
                description:description,
                status:"To Do"
            }
            let d = await axios.post('http://localhost:8080',data);
            if(d.data.status === 'success'){
                Swal.fire({
                    title:'Success',
                    text:d.data.msg,
                    icon:'success'
                })
                setReload(true);
                setTitle('');
                setDescription('');
                setshowAdd(false);
                socket.emit('update card','update');
            }else if(d.data.status === 'error'){
                Swal.fire({
                    title:'Error',
                    text:d.data.msg,
                    icon:'error'
                })
            }else{
                Swal.fire({
                    title:'Error',
                    text:'Something Went Wrong',
                    icon:'error'
                })
            }
        }
    }

    const handleEdit = async() =>{
        if(title == null || title == ''){
            Swal.fire({
                title:'Warning',
                text:'Title is Empty',
                icon:'warning'
            })
        }else if(description == null || description == ''){
            Swal.fire({
                title:'Warning',
                text:'Description is Empty',
                icon:'warning'
            })
        }else{
            const data = {
                _id:id,
                title:title,
                description:description
            }
            let d = await axios.put('http://localhost:8080/'+id,data);
            if(d.data.status === 'success'){
                Swal.fire({
                    title:'Success',
                    text:d.data.msg,
                    icon:'success'
                })
                setReload(true);
                setTitle('');
                setDescription('');
                setshowAdd(false);
                setOperation('Add');
                socket.emit('update card','update');
            }else if(d.data.status === 'error'){
                Swal.fire({
                    title:'Error',
                    text:d.data.msg,
                    icon:'error'
                })
            }else{
                Swal.fire({
                    title:'Error',
                    text:'Something Went Wrong',
                    icon:'error'
                })
            }
        }
    }

    const handleUpdate = (obj) =>{
        setId(obj.id);
        setTitle(obj.title);
        setDescription(obj.description);
        setOperation('Update');
        setshowAdd(true);
    }

    return (
        <>
            <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', margin: '20px' }}>

                <div style={{ float: 'right' }}>
                    <Button style={{ backgroundColor: "#28B3D2" }} onClick={ModalOpen}>
                        <FaPlus />
                    </Button>
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {columns.map((column) => (
                    <Column
                        key={column}
                        status={column}
                        cards={cards.filter((card) => card.status === column)}
                        onDropCard={handleDropCard}
                        setReload={setReload}
                        handleUpdate={handleUpdate}
                        socket={socket}
                    />
                ))}
            </div>

            <Modal show={showadd} onHide={() => ModalClose()}>
                <Modal.Header closeButton>
                    <Modal.Title>{operation} Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Title <span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                        style={{
                            height: 46,
                            borderWidth: 2,
                            paddingHorizontal: 8,
                            marginBottom: 16,
                            borderTopLeftRadius: 20,
                            borderBottomRightRadius: 20,
                        }}
                        type="text"
                        placeholder="Enter Note Title"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value) }}
                    />
                    <Form.Label>Description <span style={{ color: 'red' }}>*</span></Form.Label>
                    <Editor placeholder='Enter Description' value={description} onChange={(e) => { setDescription(e.target.value) }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => ModalClose()}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={operation === 'Add' ? handlesubmit : handleEdit}
                    >
                        {operation} Note
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default KanbanBoard;
