
import React from 'react';
import { ModalDialog } from 'react-bootstrap'
import Draggable from 'react-draggable';

export default function DraggableModalDialog(props: any) {
    
    return (
        <Draggable><ModalDialog {...props}/></Draggable>
    )
}