import React, { useState } from 'react';
import {Row, Container, Col, Dropdown, Button, Card} from 'react-bootstrap';
import './App.css';
import NewComponent from './components/NewComponent'

const App = () => (
  <Container className="p-3">
    <NewComponent />
  </Container>
);

export default App;
