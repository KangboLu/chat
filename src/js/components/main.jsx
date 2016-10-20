import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      blurInput: true,
      actingUser: {},
      mode: 'text',
      open: false,
      closing: false,
    };
    this.blurInput = this.blurInput.bind(this);
    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.getMe = this.getMe.bind(this);
    this.delay = 0;
  }

  componentWillMount() {
    // eslint-disable-next-line
    this.getMe();
  }

  getMe() {
    var that = this;
    Bebo.User.get('me')
    .then(function(user) {
      that.setState({ actingUser: user});
      if (!user.username) {
        that.delay += 500;
        setTimeout(that.getMe, that.delay);
      }
    });
  }

  blurInput() {
    this.setState({ blurInput: true });
    this.handleSwitchMode('text');
  }

  handleSwitchMode(mode) {
    if (this.state.mode === 'gif') {
      this.setState({ mode: 'text', closing: true, open: false }, () => {
        setTimeout(() => {
          this.setState({ closing: false });
        }, 333);
      });
    }
    if (this.state.mode === 'text' && mode !== 'text') {
      this.setState({ mode }, () => {
        setTimeout(() => {
          this.setState({ open: true });
        }, 5);
      });
    }
  }

  render() {
    const giphyOpen = this.state.open === true;
    const giphyClosing = this.state.closing === true;
    return (<div className="chat">
      <div className="chat-upper" style={this.state.mode === 'gif' ? { transform: 'translate3d(8.125rem,0,0)' } : {}}>
        <ChatList blurChat={this.blurInput} actingUser={this.state.actingUser} />
        <ChatBackground />
      </div>
      <div className="chat-lower" style={this.state.mode === 'gif' ? { transform: 'translate3d(8.125rem,0,0)' } : {}}>
        <ChatInput me={this.state.actingUser} blurChat={this.state.blurInput} switchMode={this.handleSwitchMode} setChatInputState={this.blurInput} />
      </div>
      {(giphyOpen || giphyClosing || this.state.mode === 'gif') && <GiphyBrowser style={giphyOpen ? { transform: 'translate3d(0,0,0)' } : {}} actingUser={this.state.actingUser} switchMode={this.handleSwitchMode} />}
    </div>);
  }
}

App.displayName = 'App';

// Uncomment properties you need
// App.propTypes = {};
// App.defaultProps = {};


export default App;
