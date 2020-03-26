import React, { Component } from 'react';
import io from 'socket.io-client';
import Cookies from 'universal-cookie';
import { v1 as uuid } from 'uuid';
class ChatterBox extends Component {
  constructor(props) {
    super(props);
    this.state = {messages: [],user: '',msg:'',actived:false};
    this.cookies = new Cookies();
    this.insideFooter = (
      <div className='startChat'>
        <input type= 'text' className='nameEntry' placeholder='Enter Your email address...' onKeyUp={(e) => this.handleChange(e)}></input>
        <button onClick={() => {        
            if(typeof(this.cookies.get('Pacman')) === "undefined"){
              let ed=new Date(Date.now()+3600000*87600);  //  10 years 60*1000*60*24*365*10
              this.cookies.set('Pacman', uuid(), { path: '/',expires:ed});
              this.cookies.set('User', this.state.user, { path: '/',expires:ed});
              console.log('Pacman: '+this.cookies.get('Pacman')); 
            }
            //this.cookies.set('Conversation', Date.now(), { path: '/',expires: new Date(Date.now() + 180000)});//3 min
            this.setState({actived:true});
            this.socket.emit('add user', this.cookies.get('Pacman'),this.state.user+'\nuid: '+this.cookies.get('Pacman')+'\n'+navigator.userAgent);
          }
        }>Chat</button>
      </div>
    )
    this.insideChat = (
      <div className='chatField'>
        <textarea className='sb-text' id='msgBody' placeholder="Send a message…" onKeyUp={this.handleSubmit} ></textarea>
        <div className='sb-att'></div>
        <div className='gif' id='sendMsg' onClick={this.handleSend}></div>
      </div>
    )
    this.handleSend = this.handleSend.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = event => {
    //this.cookies.set('Conversation', Date.now(), { path: '/',expires: new Date(Date.now() + 180000)});//3 min
    const body = event.target.value
    if (event.keyCode === 13&& body) {
      this.socket.emit('new message', this.cookies.get('Pacman'),body);
			this.setState({ messages: [...this.state.messages, {user:'guest',msg:body}] })
      event.target.value = '';
    }else{
      this.setState({msg: event.target.value});
    }
    document.getElementById('allMsg').scrollTop = 80000;
  }
  handleChange(event) {
    this.setState({user: event.target.value});
  }
  handleSend= () => {
    //this.cookies.set('Conversation', Date.now(), { path: '/',expires: new Date(Date.now() + 180000)});//3 min
    if(this.state.msg.length>0){
      this.socket.emit('new message', this.cookies.get('Pacman'),this.state.msg);      
			this.setState({ messages: [...this.state.messages, {user:'guest',msg:this.state.msg}] ,msg: ''})
      document.getElementById("msgBody").value='';
    }
    document.getElementById('allMsg').scrollTop = 80000;
  }

  componentDidMount() {
    //console.log('inside componentDidMount on client component');
    this.socket =io('http://192.169.180.48/');
    if(sessionStorage.getItem('survival') === "on"){
      this.setState({actived:true});
      this.socket.emit('re connect', this.cookies.get('Pacman'),this.cookies.get('User'));
    }
    
    this.socket.on('new message', message => {//console.log(JSON.stringify(message));
      sessionStorage.setItem('survival','on');
      //console.log('sessionStorage survival: '+sessionStorage.getItem('survival')); 
      this.setState({ messages: [...this.state.messages, message] });
      if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
      }
      else if (Notification.permission === "granted") {
        var notification = new Notification(message.msg);
      }
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            var notification = new Notification(message.msg);
          }
        });
      }
    })
  }
  render(){
    const messages = this.state.messages.map((message, index) => {
      return (message.user === 'admin') ? 
        <div key={index}><br className="bk"/><div className='sFmt' >{message.msg}</div><br className="bk"/></div> : 
				<div key={index}><br className="bk"/><div className='cFmt' >{message.msg}</div><br className="bk"/></div>
    });
    return (
      <div className='sb-win'>
        <div className='sb-win-header'><p>{this.state.user} talk to Jonas</p></div>
        <div className='sb-win-body' id='allMsg'>{messages}</div>
        <div className='sb-win-footer'>{(this.state.actived)? this.insideChat : this.insideFooter}</div>
      </div>
    )
  }
}
export default ChatterBox;