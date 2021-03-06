import React, { useState, useEffect } from "react";
import api from '../../../services/api';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import useStyles from './style';
import useStylesFull from "../Whatsapp/style";
import Copyright from '../../../components/footer';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link, useHistory, useParams } from 'react-router-dom';
import Forme from '../../../components/form';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import CancelIcon from '@material-ui/icons/Cancel';
import './fonts.css'
import { getPreferenceColor } from '../../../services/auth'
import {
    AudioMessage,
    PaymentMessage,
    ImageMessage,
    TextMessage,
    VideoMessage,
    DocumentMessage
} from '../../../components/cardsMessage';
import io from '../../../services/socket.io';

import {
    Grid,
    Dialog,
    Box,
    DialogContent,
    DialogActions,
    DialogTitle,
    Button,
    CardContent,
    IconButton,
    Avatar,
    CardHeader,
    Paper,
    GridList
} from '@material-ui/core';

import { getNomeUsuario, getToken, getIdUsuario } from '../../../services/auth';

const StyleDefault = window.screen.width <= 899 ?
    useStyles
    :
    window.screen.height <= 500 ?
        useStyles
        :
        useStylesFull;

function UserChat() {
    let history = useHistory()
    const [contact, setContact] = useState({});
    const { idChat } = useParams();
    const [messagesList, setMessagesList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [open, setOpen] = useState(false);
    const classes = StyleDefault();

    const mobile = window.screen.width <= 899 ?
        true
        :
        window.screen.height <= 500 ?
            true
            :
            false

    let wall = getPreferenceColor() == 'dark' ? 'wall-dark' : 'wall-light';

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    useEffect(() => {
        async function loadClient() {
            let response
            try {
                response = await api.get('/api/v1/clients/details/' + idChat);
            } catch (e) {
                history.push('/admin/whatsapp');
            }

            let client = response.data.Client[0];

            setContact(client)
        }
        loadClient();
    }, []);

    useEffect(() => {
        io.on('receiveMessages', (e) => {
            setMessagesList(e);
        })
    }, []);

    useEffect(() => {
        io.emit('requestMessages', { "chatId": contact.chatId })
    }, [contact]);

    useEffect(() => {
        io.on('newMessage', (e) => {
            if (e.from == contact.chatId) {
                io.emit('requestMessages', { "chatId": contact.chatId })
            }
        });

        io.on('newMessageSent', (e) => {
            if (e.from == contact.chatId) {
                io.emit('requestMessages', { "chatId": contact.chatId })
            }
        });

        io.on('newFile', (e) => {
            if (e.from == contact.chatId) {
                io.emit('requestMessages', { "chatId": contact.chatId })
                setOpen(false);
            }
        });
    }, [contact]);

    function getRightList() {
        return (
            <CardContent>
                {messagesList.map((message) => {
                    switch (message.type) {
                        case 'chat':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sent : classes.received;
                                let mess = new String(message.body);
                                return (
                                    <TextMessage
                                        classe={classMessage}
                                        author={message.author}
                                        message={mess}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());
                        case 'image':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sentVideo : classes.receivedVideo;
                                let s = mobile ? 's' : 'w'
                                return (
                                    <ImageMessage
                                        mobile={s}
                                        classe={classMessage}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());

                        case 'ptt':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sentAudio : classes.receivedAudio;
                                return (
                                    <AudioMessage
                                        classe={classMessage}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());

                        case 'audio':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sent : classes.received;
                                return (
                                    <AudioMessage
                                        a={true}
                                        classe={classMessage}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());

                        case 'video':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sentVideo : classes.receivedVideo;
                                let s = mobile ? 's' : 'w'
                                return (
                                    <VideoMessage
                                        mobile={s}
                                        classe={classMessage}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());

                        case 'sticker':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sentSticker : classes.receivedSticker;
                                return (
                                    <ImageMessage
                                        classe={classMessage}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());

                        case 'document':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sent : classes.received;
                                return (
                                    <DocumentMessage
                                        classe={classMessage}
                                        name={message.fileName}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());

                        case 'payment':
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sent : classes.received;
                                return (
                                    <>
                                        <PaymentMessage
                                            classe={classMessage}
                                            message={message}
                                            currency={message.currency}
                                            note={message.note}
                                            amount={message.amount}
                                            author={message.author}
                                            date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                        />
                                    </>
                                );
                            }());

                        default:
                            return (function () {
                                let classMessage = message.isServer == true ? classes.sent : classes.received;
                                return (
                                    <DocumentMessage
                                        classe={classMessage}
                                        name={message.fileName}
                                        src={message.fileLink}
                                        date={new Date(message.createdAt).toLocaleString('pt-BR')}
                                    />
                                );
                            }());
                    }
                })}
            </CardContent>
        );
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Enviar Arquivo</DialogTitle>
                <DialogContent>
                    <form>
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={() => {
                        console.log(selectedFile)
                        getBase64(selectedFile).then(async (data) => {
                            let type = selectedFile.type.split('/', 1);
                            let ext = selectedFile.type.split('/', 2);
                            ext = ext[1];
                            if (type == 'aplication') {
                                type = 'document'
                            }
                            let dados = {
                                "base64": data,
                                "type": type,
                                "numbers": contact.chatId,
                                "ext": ext,
                                "name": selectedFile.name,
                                "token": getToken()
                            };

                            await api.post('/api/v1/whatsapp/message.doc?id=0', dados).then(() => handleClose);
                        })
                    }} color="primary">
                        Enviar
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container style={{ overflow: 'hidden' }}>
                <Grid item xs={12}>

                    <Paper elevation={5} style={{ width: "100%" }}>
                        <CardHeader
                            avatar={
                                <Avatar aria-label="Recipe" src={contact.profileUrl}></Avatar>
                            }
                            action={
                                mobile ? <>

                                    <Link to="/admin/whatsapp" style={{ textDecoration: "none" }}>
                                        <IconButton >
                                            <ArrowBackIcon />
                                        </IconButton>
                                    </Link>

                                    <IconButton onClick={handleClickOpen}>
                                        <AttachFileIcon />
                                    </IconButton>

                                    <IconButton onClick={async () => {
                                        let data = {
                                            "worker": getIdUsuario(),
                                            "name": getNomeUsuario()
                                        }
                                        if (contact.firstAttendace !== undefined) {
                                            if (contact.firstAttendace == false) {
                                                io.emit('sendMessage', {
                                                    "numbers": contact.chatId.replace('@c.us', ''),
                                                    "worker": getNomeUsuario(),
                                                    "messages": 'ffat'
                                                })
                                                
                                                await api.put('/api/v1/clients/' + contact._id, data);

                                                window.location.href = '/admin/whatsapp';
                                            } else {
                                                await api.patch('/api/v1/clients/first/?_id=' + contact._id, data);
                                                window.location.reload();
                                            }
                                        }
                                    }}>
                                        {contact.firstAttendace ? <AssignmentTurnedInIcon /> : <CancelIcon />}
                                    </IconButton>
                                </> : <><h3>Modo de visualização</h3></>
                            }
                            title={contact.fullName}
                            subheader={
                                contact.WorkerAttendance != undefined ?
                                    contact.WorkerAttendance != 'no-one' ?
                                        `Sendo atendido por: ${contact.NameAttendance}`
                                        :
                                        ""
                                    :
                                    "Selecione alguma conversa."
                            }
                        />
                        <GridList cols={1} style={{
                            marginTop: "0%",
                            height: "100%",
                            backgroundImage: `url(/${wall}.png)`,
                            backgroundRepeat: 'repeat-y',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}>
                            <CardContent style={{
                                display: "flex",
                                flexDirection: "column-reverse",
                                height: mobile ? "calc(72vh - 3vw)" : "91.75vh",
                                flexGrow: 1,
                                width: "100%",
                                overflow: 'auto',
                            }}>

                                {getRightList()}

                            </CardContent>
                        </GridList>

                    </Paper>
                </Grid>
            </Grid>

            {
                mobile ?
                    <div style={{ marginTop: "5%" }}>
                        <Forme number={contact} worker={getNomeUsuario()} mobile='s' />
                    </div>
                    :
                    <></>
            }

        </>
    );
}

export default UserChat;