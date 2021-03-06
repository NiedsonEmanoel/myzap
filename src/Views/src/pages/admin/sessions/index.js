import React, { useState, useEffect } from 'react';
import useStyles from './theme';
import MenuAdmin from '../../../components/menu-admin';
import Copyright from '../../../components/footer';
import io from '../../../services/socket.io';
import { getIdUsuario, getTipoUsuario, setTipoUsuario } from '../../../services/auth';
import BackupIcon from '@material-ui/icons/Backup';
import api from '../../../services/api'
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import {
    Grid,
    Container,
    Box,
    CssBaseline,
    Paper,
    Chip,
    Table,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    TableBody,
    TableCell,
    Typography,
    TableContainer,
    Button,
    ButtonGroup,
    TableHead,
    TableRow
} from '@material-ui/core';

import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';


export default function Sessions() {
    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    const classes = useStyles();

    const [id, setId] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [open, setOpen] = useState(false);
    const [openQR, setOpenQR] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickQROpen = () => {
        setOpenQR(true);
    };

    const handleClose = () => {
        setOpenQR(false);
        setOpen(false)
    };

    function switchSessions(s) {
        setSessions(s);
    }

    function switchID(id) {
        setId(id);
    }

    useEffect(() => {
        io.on('sessionChanged', (e) => {
            (async () => {
                const handler = await api.get('/api/v1/whatsapp/sessions');
                const numberOfSessions = handler.data.numberOfSessions;
                let sessionsTemp = [];

                for (let i = 0; i < numberOfSessions; i++) {
                    let active = await (await api.get('/api/v1/whatsapp/sessions.details/' + i)).data.started;
                    let phone
                    try {
                        phone = active == true ? await (await api.get('/api/v1/whatsapp/device?id=' + i)).data.device.phone.device_model : "-";
                    }
                    catch (e) {
                        phone = 'Aguardando...'
                    }
                    let tempAux = {
                        "Session": i,
                        "active": active,
                        "device": phone
                    }
                    sessionsTemp.push(tempAux);
                }
                switchSessions(sessionsTemp);
            })();
            handleClose();
        });
    }, []);

    useEffect(() => {
        async function s() {
            let res = await (await api.get('/api/v1/workers/details/' + getIdUsuario())).data.Worker[0].tipo_usuario;
            setTipoUsuario(`${res}`);
            if ((getTipoUsuario() != '3')) {
                window.location.href = '/admin'
            }
        }
        s();
    }, [])

    useEffect(() => {
        (async () => {
            const handler = await api.get('/api/v1/whatsapp/sessions');
            const numberOfSessions = handler.data.numberOfSessions;
            let sessionsTemp = [];

            for (let i = 0; i < numberOfSessions; i++) {
                let active = await (await api.get('/api/v1/whatsapp/sessions.details/' + i)).data.started;
                let phone
                try {
                    phone = active == true ? await (await api.get('/api/v1/whatsapp/device?id=' + i)).data.device.phone.device_model : "-";
                }
                catch (e) {
                    phone = 'Aguardando...';
                }
                let tempAux = {
                    "Session": i,
                    "active": active,
                    "device": phone,
                }
                sessionsTemp.push(tempAux);
            }
            switchSessions(sessionsTemp);
        })();
    }, []);

    function getData() {
        return (
            sessions.map((value) => {
                return (
                    <TableRow>
                        <TableCell>
                            {value.Session}
                        </TableCell>

                        <TableCell align="center">
                            {value.active ? <Chip label="Ativa" color="primary" /> : <Chip label="Inativa" disabled />}
                        </TableCell>

                        <TableCell align="center">
                            {
                                value.device != '-' ?
                                    value.device != 'Aguardando...' ?
                                        <Chip label={value.device} variant="outlined" color="primary" />
                                        :
                                        <Chip label={value.device} variant="outlined" color="secondary" />
                                    :
                                    value.device
                            }
                        </TableCell>

                        <TableCell align="center">
                            <ButtonGroup >
                                <Button onClick={() => {
                                    switchID(value.Session);
                                    handleClickOpen();
                                }}>
                                    <BackupIcon />
                                </Button>
                                <Button onClick={(e) => { window.open("/dialogflow.json/" + value.Session, '_blank').focus() }}>
                                    <VisibilityRoundedIcon />
                                </Button>
                            </ButtonGroup>
                        </TableCell>

                        <TableCell align="right">
                            <ButtonGroup size="small" aria-label="small button group">
                                {value.active ?
                                    <Button onClick={async () => {

                                        const r = await api.delete('/api/v1/whatsapp/sessions?id=' + value.Session);
                                        return ('');

                                    }}>
                                        Desabilitar
                                        <ClearIcon />
                                    </Button>

                                    :

                                    <Button onClick={async () => {
                                        const r = await api.post('/api/v1/whatsapp/sessions?id=' + value.Session);
                                        return ('');
                                    }}>
                                        Habilitar
                                        <DoneIcon />
                                    </Button>
                                }

                                {value.active ?
                                    <Button onClick={() => {
                                        switchID(value.Session);
                                        handleClickQROpen();
                                    }}>
                                        QRCode
                                        <img style={{ height: "100%", paddingLeft: '3px' }} src={'/qrcode.svg'}></img>
                                    </Button>

                                    :

                                    <></>
                                }
                            </ButtonGroup>
                        </TableCell>

                    </TableRow>
                );
            })
        );
    }

    return (
        <div className={classes.root}>
            <CssBaseline />

            <MenuAdmin name="Sessões" />

            <main className={classes.content}>

                <div className={classes.appBarSpacer} />

                <Container maxWidth="lg" className={classes.container}>

                    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogContent>
                            <>
                            <Typography variant="button" display="block" color='secondary' gutterBottom>
                                Prossiga com atenção!
                            </Typography>
                            <Typography variant="caption" display="block" gutterBottom>
                                Ao enviar o novo arquivo JSON a sessão ficará instável até o sistema ser reiniciado.
                            </Typography>
                            <hr></hr>
                                <form>
                                    <input
                                        id="forme"
                                        type="file"
                                        accept=".json"
                                        multiple={false}
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                    />
                                </form>
                            </>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancelar
                            </Button>
                            <Button onClick={() => {

                                getBase64(selectedFile).then(async (data) => {
                                    let dados = {
                                        "id": id,
                                        "base64": data,
                                        "name": 'dialogflow' + id + '.json'
                                    };

                                    await api.post('/api/v1/credentials', dados);
                                    handleClose();
                                })
                            }} color="primary">
                                Enviar
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={openQR}
                        onClose={handleClose}
                    >
                        <DialogContent>
                            <iframe style={{ height: '269px', width: '269px' }} src={`/api/v1/whatsapp/qrcode?id=${id}`}></iframe>
                        </DialogContent>
                    </Dialog>

                    <Grid>
                        <Paper className={classes.paper}>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="flex-start"
                            >
                                <h2>Controle da Sessão</h2>
                            </Grid>


                            <Grid container spacing={3}>

                                <Grid item xs={12} sm={12}>

                                    <TableContainer component={Paper}>

                                        <Table className={classes.table} aria-label="simple table">

                                            <TableHead>

                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell align="center">Status</TableCell>
                                                    <TableCell align="center">Aparelho</TableCell>
                                                    <TableCell align="center">Credencial DialogFlow</TableCell>
                                                    <TableCell align="right">Opções</TableCell>
                                                </TableRow>

                                            </TableHead>

                                            <TableBody>

                                                {

                                                    getData()

                                                }

                                            </TableBody>

                                        </Table>

                                    </TableContainer>

                                </Grid>

                            </Grid>

                        </Paper>
                    </Grid>

                    <Box pt={4}>
                        <Copyright />
                    </Box>

                </Container>

            </main>
        </div>
    );
}