import { Dropdown, Button, Card, Container, Row, Col, Form } from 'react-bootstrap'
import axios from 'axios';
import {AnimatedTree} from 'react-tree-graph';

// eslint-disable-next-line no-undef
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valueNewMember: '',
            name: '',
            level: '',
            bonus: '_',
            combination: '',
            parentId: '',
            parentName: '',
            newIdMember: '',
            statusMigrate: '',
            migrateMemberID: '',
            migrateMemberName: '',
            migrateNewParentID: '',
            migrateNewParentName: '',
            dataNode : [],
            options1: [],
            options2: []
        };
    }

    componentDidMount() {
        axios.get('http://localhost:3003/tree').then(res => {
            let data = res.data;
            let dataTree = [];
            for (let i in data) {
                dataTree.push(this.dataToTreeGraph(data[i]))
            }
            
            this.setState({dataNode: dataTree})

            let dataNode = [];
            for (let i=0;i<data.length;i++){
                dataNode.push(...this.dismountData(data[i]))
            }
            
            this.setState({options1: dataNode})
        })
    }

    dismountData = (data, newData = []) => {
        const node = {
            _id: data._id,
            value: data.value,
            level: data.level,
            bonus: data.bonus
        }
        newData.push(node);
        
        for (let prop in data.children){
            newData.push(...this.dismountData(data.children[prop])) 
        }

        return newData;
    }

    dataToTreeGraph = (data) => {
        let nodeData = {
            name: data.value+'<br>Member lvl. '+data.level+'<br>(Bonus: $'+data.bonus+')',
            label: <><text x='-25' y='15'>{data.value}</text> <br></br> <text x='-25' y='30'>Level {data.level}</text> <br></br> <text x='-25' y='45'>Bonus ${data.bonus}</text>  </>,
            level: data.level,
            bonus: data.bonus,
            textProps: {x: -25, y: 25},
            children: []
        }
            
        for (let idx in data.children) {
            nodeData.children.push(this.dataToTreeGraph(data.children[idx]))
        }
        
        return nodeData
    }

    handleOption1Select = (eventKey) => {
        this.setState({ level: this.state.options1[eventKey].level, name: this.state.options1[eventKey].value, bonus: this.state.options1[eventKey].bonus });
    }

    handleOption2Select = (eventKey) => {
        this.setState({ parentId: eventKey });
    }

    handleButtonClick = () => {
        this.setState({ combination: this.state.bonus+"$" });
    }

    handleChange = (event) => {
        this.setState({ valueNewMember: event.target.value });
    }

    handleOptionNewParent = (eventKey) => {
        if (eventKey >=0){
            this.setState({ parentId: this.state.options1[eventKey]._id, parentName: this.state.options1[eventKey].value });
        }else{
            this.setState({ parentId: '', parentName: 'None'});
        }
    }

    handleButtonRegistrasi = () => {
        axios.post('http://localhost:3003/tree', {
            value: this.state.valueNewMember,
            parent: this.state.parentId
        }).then(res => {
            const node = {
                value: res.data.value,
                level: res.data.level,
                bonus: res.data.bonus
            }
            this.setState({newIdMember: res.data._id, options1: [...this.state.options1, node]})
            this.componentDidMount();
        })
    }

    handleOptionMigrateMemberID = (eventKey) => {
        this.setState({ migrateMemberID: this.state.options1[eventKey]._id, migrateMemberName: this.state.options1[eventKey].value});
    }

    handleOptionMigrateNewParentID = (eventKey) => {
        this.setState({ migrateNewParentID: this.state.options1[eventKey]._id, migrateNewParentName: this.state.options1[eventKey].value });
    }

    handleButtonMigrate = () => {
        console.log({
            id: this.state.migrateMemberID,
            newParent: this.state.migrateNewParentID,
        })
        axios.put('http://localhost:3003/tree', {
            id: this.state.migrateMemberID,
            newParent: this.state.migrateNewParentID,
        }).then(res => {
            this.componentDidMount();
            // eslint-disable-next-line eqeqeq
            if (res.status == 200) {
                this.setState({statusMigrate: "Berhasil!"})
            }else{
                this.setState({statusMigrate: "Gagal!"})
            }
        })
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        Perhitungan Bonus
                    </Col>
                </Row>
                
                <Row>
                    <Col>
                        <Dropdown onSelect={this.handleOption1Select} value={this.state.name}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" title={this.state.name || "Select an option"}>
                            {this.state.name || "Select an option"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {this.state.options1.map((option, index) => (
                                <Dropdown.Item key={option._id} eventKey={index}>{option.value}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    
                    <Col>
                        <Button variant="primary" disabled={true}>{this.state.level || "level"}</Button>
                    </Col>
                    
                    <Col>
                        <Button variant="primary" onClick={this.handleButtonClick}>Combine</Button>
                    </Col>
                    
                    <Col>
                        <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            {this.state.combination}
                        </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        Registrasi Member Baru
                    </Col>
                </Row>
                
                <Row>
                    <Col>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formMemberBaru">
                                <Form.Control type="text" placeholder="Inisialisasi Member Baru" value={this.state.valueNewMember} onChange={this.handleChange} />
                            </Form.Group>
                        </Form>
                    </Col>

                    <Col>
                        <Dropdown onSelect={this.handleOptionNewParent} value={this.state.parentName}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" title={this.state.parentName || "Select an option"}>
                            {this.state.parentName || "Select an option"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item key={0} eventKey={-1}>None</Dropdown.Item>
                            {this.state.options1.map((option, index) => (
                                <Dropdown.Item key={option._id} eventKey={index}>{option.value}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    
                    <Col>
                        <Button variant="primary" onClick={this.handleButtonRegistrasi}>Registrasi</Button>
                    </Col>
                    
                    <Col>
                        <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            {this.state.newIdMember || 'Member ID'}
                        </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        Migrasi Member/Pindah Member
                    </Col>
                </Row>
                
                <Row>
                    <Col>
                        <Dropdown onSelect={this.handleOptionMigrateMemberID} value={this.state.migrateMemberName}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" title={this.state.migrateMemberName || "Select Member ID"}>
                            {this.state.migrateMemberName || "Select Member ID"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {this.state.options1.map((option, index) => (
                                <Dropdown.Item key={option._id} eventKey={index}>{option.value}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                        </Dropdown>
                    </Col>

                    <Col>
                        <Dropdown onSelect={this.handleOptionMigrateNewParentID} value={this.state.migrateNewParentName}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" title={this.state.migrateNewParentName || "Select Parent"}>
                            {this.state.migrateNewParentName || "Select Parent"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {this.state.options1.map((option, index) => (
                                <Dropdown.Item key={option._id} eventKey={index}>{option.value}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    
                    <Col>
                        <Button variant="primary" onClick={this.handleButtonMigrate}>Migrate</Button>
                    </Col>
                    
                    <Col>
                        <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            {this.state.statusMigrate || 'Status'}
                        </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {this.state.dataNode.map((node, index) => (
                    <Row className='custom-container'>
                            <AnimatedTree 
                                key={index}
                                data={node} 
                                nodeRadius={15}
                                margins={{ top: 20, bottom: 10, left: 20, right: 200 }}
                                height={500} 
                                width={600}
                                labelPosition="bottom"
                                labelProp={'label'}
                            />
                    </Row>
                ))}
            </Container>
        );
    };
};

export default MyComponent;