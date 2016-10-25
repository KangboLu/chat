import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';
import PhotoViewer from './photo-viewer.jsx';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      blurInput: true,
      me: {user_id: Bebo.User.getId()},
      mode: 'text',
      open: false,
      closing: false,
    };
    this.blurInput = this.blurInput.bind(this);
    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.getMe = this.getMe.bind(this);
    this.viewPhoto = this.viewPhoto.bind(this);
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
      that.setState({ me: user});
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

  viewPhoto(d) {
    this.setState({viewPhoto: d});
  }

  renderPhotoViewer() {
    if (this.state.viewPhoto) {
      return <PhotoViewer media={this.state.viewPhoto} close={()=> this.setState({viewPhoto: null})} />;
    }
  }

  render() {
    const giphyOpen = this.state.open === true;
    const giphyClosing = this.state.closing === true;
    return (
      <div className="chat">
        <div className="chat-upper" style={this.state.mode === 'gif' ? { transform: 'translate3d(8.125rem,0,0)' } : {}}>
          <ChatList viewPhoto={this.viewPhoto} blurChat={this.blurInput} me={this.state.me} />
          <ChatBackground />
        </div>
        <div className="chat-lower" style={this.state.mode === 'gif' ? { transform: 'translate3d(8.125rem,0,0)' } : {}}>
          <ChatInput me={this.state.me} blurChat={this.state.blurInput} switchMode={this.handleSwitchMode} setChatInputState={this.blurInput} />
        </div>
        {(giphyOpen || giphyClosing || this.state.mode === 'gif') && <GiphyBrowser style={giphyOpen ? { transform: 'translate3d(0,0,0)' } : {}} me={this.state.me} switchMode={this.handleSwitchMode} />}
        {this.renderPhotoViewer()}
      </div>);
  }
}

App.displayName = 'App';

// Uncomment properties you need
// App.propTypes = {};
// App.defaultProps = {};


export default App;
