import React from 'react';
import ChatList from './chat-list.jsx';
import ChatBackground from './chat-background.jsx';
import ChatInput from './chat-input.jsx';
import GiphyBrowser from './giphy-browser.jsx';
import PhotoViewer from './photo-viewer.jsx';
import ChatDelete from './chat-delete.jsx';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      blurInput: true,
      me: {user_id: Bebo.User.getId()},
      admin: false,
      mode: 'text',
      open: false,
      modal: null,
      closing: false,

    };
    this.blurInput = this.blurInput.bind(this);
    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.getMe = this.getMe.bind(this);
    this.viewPhoto = this.viewPhoto.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.delay = 0;
  }

  componentWillMount() {
    // eslint-disable-next-line
    this.getMe();
    this.getServer();
  }

  getServer() {
    return Bebo.Server.get()
      .then((server) => {
        var admin = false;
        if (server.cohosts.includes(this.state.me.user_id)) {
          admin = true;
        } else if (server.user_id === this.state.me.user_id) {
          admin = true;
        }
        if (admin) {
          this.setState({admin: admin});
        }
      });
  }

  getMe() {
    var that = this;
    return Bebo.User.get('me')
      .then(function(user) {
        var state = {me: user};
        if (user.role === "admin") {
          state.admin = true;
        }
        that.setState(state);
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

  deleteItem(item) {
    this.setState({modal: {type: "delete", item: item}});
  }

  deleteChat(item) {
    var that = this;
    if (!item.id) {
      return;
    }
    var update = {id: item.id,
                  message: "[deleted]",
                  media: null,
                  deleted_dttm: new Date()};                                                                                                                                                                                                                         
    return Bebo.Db.save('messages', update)
      .then(function() {
        Bebo.emitEvent({ type: 'chat_delete',
                         message: {id: item.id,
                         deleted_dttm: update.deleted_dttm}});
      }).then(function() {
        that.setState({modal: null});
      });
  }

  renderChatDelete() {
    var that = this;
    if (this.state.modal && this.state.modal.type  === "delete") {
      function navigateHome() {
        that.setState({modal: null});
      }

      function deleteChat() {
        that.deleteChat(that.state.modal.item);
      }
      return <ChatDelete body={"Are you sure want to delete this message?"}
                         title={''}
                         actionLabel1='cancel'
                         action1={navigateHome}
                         actionLabel2='delete'
                         action2={deleteChat} 
                         action2color='#FC4E4E'
      />
    }
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
          <ChatList deleteItem={this.deleteItem} admin={this.state.admin} viewPhoto={this.viewPhoto} blurChat={this.blurInput} me={this.state.me} />
          <ChatBackground />
        </div>
        <div className="chat-lower" style={this.state.mode === 'gif' ? { transform: 'translate3d(8.125rem,0,0)' } : {}}>
          <ChatInput me={this.state.me} blurChat={this.state.blurInput} switchMode={this.handleSwitchMode} setChatInputState={this.blurInput} />
        </div>
        {(giphyOpen || giphyClosing || this.state.mode === 'gif') && <GiphyBrowser style={giphyOpen ? { transform: 'translate3d(0,0,0)' } : {}} me={this.state.me} switchMode={this.handleSwitchMode} />}
        {this.renderPhotoViewer()}
        {this.renderChatDelete()}
      </div>);
  }
}

App.displayName = 'App';

// Uncomment properties you need
// App.propTypes = {};
// App.defaultProps = {};


export default App;
