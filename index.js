#!/usr/bin/env node
// This file is the entry point of the server, but just uses 'babel-register'
// to transpile the rest of the application into older JavaScript that node.js
// can deal with
require('babel-register');
require('./server');
