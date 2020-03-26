import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import ChatterBox from './Client.jsx';
import Cookies from 'universal-cookie';

class Client extends React.Component {
    constructor (props){
      super(props);
      this.state = {messeges: [],chatWindow: false}
      this.cookies = new Cookies();
      this.handleMessageArea = this.handleMessageArea.bind(this);
    }
  
    handleMessageArea() {
      sessionStorage.removeItem('survival');
      this.setState({chatWindow : !this.state.chatWindow})
    };
    componentDidMount() {
      if(sessionStorage.getItem('survival')=== "on" ){
        this.setState({chatWindow : true});
      }
    }
    render(){
      return (
        <div className='sb-cont'>
          {this.state.chatWindow && <ChatterBox />}
          <div className= 'chat-img' >
            <button style={{outline: 'none', padding: 0, width: 60, height: 60, backgroundColor: '#1568c0', border: 'none', borderRadius: 50}} 
              onClick={() => this.handleMessageArea()}>
              {this.state.chatWindow ? <h2 style={{margin: 0, fontSize: 27, color: '#f8f8f8'}}>X</h2> : <h2 className='openChat'></h2>}
            </button>
          </div>
        </div>
      )
    }
  }
ReactDOM.render(<Client />, document.getElementById('sibylla-chat'));