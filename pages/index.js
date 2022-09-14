import { Component } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Container, ListGroup, Button } from 'react-bootstrap';
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
      image: "",
      nfts: [],
      address: ""
    }
    this.handleImageChange = this.handleImageChange.bind(this);
    this.upload = this.upload.bind(this);
  }

  componentDidMount() {
    axios.get(
      "https://thentic-api-backend.herokuapp.com/view/"
    ).then((res) => {
      if(res.status === 200) {
        console.log(res.data.nfts);
        this.setState({
          nfts: res.data.nfts
        })
      }
    })
  }

  handleImageChange(e) {
    this.setState({
      name: e.target.files[0].name,
      image: e.target.files[0].name,
      file: e.target.files[0]
    })
  }

  handleAddressChange(e) {
    this.setState({
      address: e.target.value
    })
  }

  async upload(e) {
    e.preventDefault();
    try {
      const res = await client.add(this.state.file);
      const url = `https://${res.cid.toV1().toString()}.ipfs.dweb.link/`;    
      this.setState({image: url});
      const jsonInfo = {"name" : this.state.name, "image" : url, "redirectUri": window.location.href, "address": this.state.address}
      console.log(jsonInfo)
      console.log("Uploaded!");
      const thenticResponse = await axios.post(
        "https://thentic-api-backend.herokuapp.com/mint/", jsonInfo
      )
      console.log(thenticResponse);
      window.location.replace(thenticResponse.data.transaction_url)
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <>
        <Container style={{marginTop: "3rem"}}>

          <div style={{textAlign: "center", marginBottom: "2rem"}}>
            <h1>Convert your memories into NFTs</h1>
          </div>

          <div style={{margin: "2rem" }}>
            <ListGroup>
              { 
                this.state.nfts.map(
                  element => (
                    <ListGroup.Item key={element.id} variant="success">
                      ChainId: {element.chain_id} &nbsp;
                      Contract: {element.contract} &nbsp;
                      NFT ID: {element.id} &nbsp;
                      Link: {<a href={""+JSON.parse(element.data).image}>Click here</a>} 
                    </ListGroup.Item>
                  )
                )
              }
            </ListGroup>
          </div>
          
          <InputGroup className="mb-3">
            <Form.Control type="file" accept='image/*' onChange={(e) => this.handleImageChange(e)} />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text variant="label">Address</InputGroup.Text>
            <Form.Control type="text" value={this.state.address} onChange={(e) => this.handleAddressChange(e)} />
          </InputGroup>
          <div style={{ textAlign: "center"}}>
            <Button type="button" variant="primary" onClick={(e) => this.upload(e)}>Mint!</Button>
          </div>
        </Container>
        
      </>
    )
  }
}
