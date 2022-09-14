import { Component } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Container } from 'react-bootstrap';
import { create } from 'ipfs-http-client';
import axios from 'axios';

const PROJECT_ID = "2EhsgI9nVT9JcegcQk3yl28rR5y";
const PROJECT_SECRET = "32a7e79ad99f487aaa8fcd3a9c2a48cb";

const auth =
    'Basic ' + Buffer.from(PROJECT_ID + ':' + PROJECT_SECRET).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

export default class Home extends Component{

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      file: "",
      image: ""
    }
    this.handleImageChange = this.handleImageChange.bind(this);
    this.upload = this.upload.bind(this);
  }

  handleImageChange(e) {
    this.setState({
      name: e.target.files[0].name,
      image: e.target.files[0].name,
      file: e.target.files[0]
    })
  }

  async upload(e) {
    e.preventDefault();
    try {
      const res = await client.add(this.state.file);
      const url = `https://ipfs.infura.io/ipfs/${res.path}`;
      this.setState({image: url});
      const jsonInfo = {"name" : this.state.name, "image" : url, "redirectUri": window.location.href}
      console.log(jsonInfo)
      console.log("Uploaded!");
      const thenticResponse = await axios.post(
        "https://thentic-api-backend.herokuapp.com/mint/", jsonInfo
      )
      console.log(thenticResponse);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <>
        <div style={{textAlign: "center"}}>
          <h1>Convert your memories into NFTs</h1>
        </div>
        <Container>
          <InputGroup controlId="formFile" className="mb-3">
            <Form.Control type="file" accept='image/*' onChange={(e) => this.handleImageChange(e)} />
            <InputGroup.Text variant="button" style={{cursor: "pointer"}} onClick={(e) => this.upload(e)}>Upload</InputGroup.Text>{' '}
          </InputGroup>
        </Container>
        
      </>
    )
  }
}
