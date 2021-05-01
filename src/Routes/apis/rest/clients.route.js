const express = require('express');
const Router = express.Router();
const Clients = require('../../../Controllers/clients.controller');

Router.get('/', Clients.index);
Router.get('/attendance', Clients.getAttendace);
Router.get('/details/:_id', Clients.details);

Router.post('/', Clients.create);

Router.put('/:_id', Clients.switchAt);
Router.patch('/first', Clients.SwitchFist);

Router.patch('/', Clients.togle);

Router.delete('/:_id', Clients.delete)

module.exports = Router;