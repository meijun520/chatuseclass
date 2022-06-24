import style from './index.less';
import socketio from 'socket.io-client';
import React from 'react';
import { history } from 'umi';
let io = socketio('http://localhost:3000', {
  //transports和服务端统一，否则会跨域
  transports: ['websocket'],
});
export default class WeChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      message: '',
      user: '',
      count: 0,
    };
  }
  componentDidMount() {
    this.setState({ user: history.location.query.user }, () => {
      io.emit('user', this.state.user);
    });
    io.on('islogin', (msg) => {
      if (msg.islogin === false && msg.user === this.state.user) {
        io.close();
        alert('该用户已存在');
        history.push('/');
      }
    });
    io.on('pushMsg', (msg) => {
      this.state.list.push(msg);
      this.setState({ list: [...this.state.list] });
    });
    io.on('countmsg', (msg) => {
      this.setState({ count: msg });
    });
  }
  // componentWillReceiveProps (nextProps){
  //   if (this.state.user&&this.props.user!== nextProps.user) {
  //     io.emit('user', this.state.user);
  //     console.log(this.state.user, 8989);
  //     io.on('islogin', (msg) => {
  //       if (msg.islogin === false && msg.user === this.state.user) {
  //         io.close();
  //         alert('该用户已存在');
  //         history.push('/');
  //       }
  //     });
  //   }
  // };

  sendmessage() {
    if (this.state.message) {
      io.emit('sendMsg', {
        name: this.state.user,
        message: this.state.message,
      });
      this.setState({ message: '' });
    }
  }
  keyup(e) {
    if (e.keyCode == 13 && e.target.value) {
      io.emit('sendMsg', {
        name: this.state.user,
        message: this.state.message,
      });
      this.setState({ message: '' });
    }
  }

  render() {
    return (
      <div className={style.chat}>
        <div>
          在线人数{this.state.count}
          {history.location.query.user}
        </div>
        <div className={style.right}>
          <ul className={style.messages} id="mes">
            {this.state.list.map((item, index) => (
              <li
                key={index}
                className={
                  this.state.user == item.name
                    ? style.chartlistright
                    : style.chartlistleft
                }
              >
                {this.state.user == item.name
                  ? item.message + item.name + ':'
                  : item.name + ':' + item.message}
              </li>
            ))}
          </ul>
          <div className={style.form}>
            <input
              type="text"
              className={style.m}
              id="input"
              value={this.state.message}
              onKeyUp={(e) => {
                this.keyup(e);
              }}
              onChange={(event) =>
                this.setState({ message: event.target.value })
              }
            />
            <button onClick={() => this.sendmessage()}>send</button>
          </div>
        </div>
      </div>
    );
  }
}
