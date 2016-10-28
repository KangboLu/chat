
import striptags from 'striptags';
import uuid from 'node-uuid'

import React from 'react';
import Remarkable from 'remarkable';
import Uploader from './uploader.jsx';
import _ from 'lodash';

var md = new Remarkable({html: false, breaks: false, linkify: false});

class ChatInput extends React.Component {

  constructor() {
    super();
    this.state = {
      messageText: '',
      multiLine: false,
      isTyping: false,
      media: []
    };
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.blockEnterKey = this.blockEnterKey.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.stoppedTyping = this.stoppedTyping.bind(this);
    this.resetTextarea = this.resetTextarea.bind(this);
    this.handleActionGIF = this.handleActionGIF.bind(this);
    this.broadcastChat = this.broadcastChat.bind(this);
    this.handleSendChat = this.handleSendChat.bind(this);
    this.handleMedia = this.handleMedia.bind(this);
    this.handleUploading = this.handleUploading.bind(this);
  }


  componentWillMount() {
  }

  componentDidMount() {
    document.addEventListener('keydown', this.blockEnterKey, false);
    if (!Bebo.Utils.isMobile()) {
      this.refs.textarea.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.blurInput) {
      this.refs.textarea.blur();
    } else if (!nextProps.blurInput) {
      this.refs.textarea.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.blockEnterKey);
    this.stoppedTyping();
  }

  handleUploading() {
    console.log("editor uploading");
    this.setState({uploading: true});
  }

  blockEnterKey(e) {
    if (e.keyCode === 13 && this.state.messageText && this.state.messageText.length) {
      if (e.shiftKey || Bebo.Utils.isMobile()) {
        this.setState({multiLine: true});
      } else {
        this.handleSendChat(e);
        e.preventDefault();
      }
    } else if (e.keyCode === 13) {
      this.refs.textarea.blur();
      e.preventDefault();
    }
  }

  handleInputChange(e) {
    clearTimeout(this.isTypingTimeout);
    if (!this.state.isTyping) {
      this.setState({ isTyping: true });
      // eslint-disable-next-line
      Bebo.Room.emitEvent({ presence: { started_typing: this.props.me.user_id } });
      this.typingInterval = setInterval(() => {
        // eslint-disable-next-line
        Bebo.Room.emitEvent({ type: 'chat_presence', presence: { started_typing: this.props.me.user_id } });
      }, 3000);
    }
    this.isTypingTimeout = setTimeout(this.stoppedTyping, 3000);
    this.setState({ messageText: e.target.value }, () => {
      if (this.state.messageText.length === 0) {
        this.stoppedTyping();
      }
    });
  }

  stoppedTyping() {
    clearInterval(this.typingInterval);
    // eslint-disable-next-line
    Bebo.Room.emitEvent({ type: 'chat_presence', presence: { stopped_typing: this.props.me.user_id } });
    this.setState({ isTyping: false });
  }

  handleMedia(media) {
    console.log("got media - need to post", media);
    var medium = media[0];
    this.setState({uploading: false, media: []});
    const image = {
      url: medium.url,
      width: medium.width,
      height: medium.height
    };
    const message = {
      id: uuid.v4(),
      image: image,
      username: this.props.me.username,
      user_id: this.props.me.user_id,
      type: 'image',
    };
    Bebo.Db.save('messages', message, this.broadcastChat);
  }

  handleSendChat(e) {
    //this.refs.textarea.focus();
    if(e){
      e.preventDefault();
    }
    const text = this.state.messageText.trim();
    if (text.length > 0) {
      const message = {
        id: uuid.v4(),
        type: 'message',
        username: this.props.me.username,
        user_id: this.props.me.user_id,
        message: text,
        users: [],
      };

      // TODO mention stuff in users[]
      // eslint-disable-next-line
      Bebo.Db.save('messages', message, this.broadcastChat);
      this.resetTextarea();
    } else {
      console.warn('no message, returning');
    }
  }
  resetTextarea() {
    this.setState({ messageText: '', multiLine: false });
  }

  broadcastChat(err, data) {
    if (err) {
      console.log('error', err);
      return;
    }
    const m = data.result[0];
    // eslint-disable-next-line
    var message;
    if (m.type === 'message') {
      message  = m.message.trim();
      message = _.split(message, "\n");
      message = message[0];
    } else if (m.type === 'image') {
      message = "sent a new image";
    }

    if (message && message.length > 0) {
      message = md.render(message);
      message = striptags(message);
      Bebo.Notification.roster('{{{user.username}}}:', message, []);
    }
    // eslint-disable-next-line
    Bebo.Room.emitEvent({ type: 'chat_sent', message: m });
    this.stoppedTyping();
    // TODO check if any user is in str
  }

  handleInputFocus() {
    this.setState({isFocussed: true});
    this.props.setChatInputState(true);
  }

  handleInputBlur() {
    this.setState({isFocussed: false});
    this.props.setChatInputState(false);
  }

  handleActionGIF() {
    this.props.switchMode('gif');
  }

  calculateSendBtnStyle() {
    if(this.state.messageText.length) {
      return {transform: 'translateX(0)'}
    }
    return {}
  }
  calculateChatBtnStyle() {
    if(this.state.messageText.length) {
      return {transform: 'translateX(100px)'}
    }
    return {}
  }
  renderUploader() {
    if (this.state.messageText.length) {
      return <Uploader ref="uploader"
                     value={this.state.media}
                     multiple={false}
                     onBusy={this.handleUploading}
                     onChange={this.handleMedia}
                     showButton={true}
                     itemClassName="media-upload-container chat-btn typing"
                     className="media-upload-media"/>
    }
    return <Uploader ref="uploader"
                     value={this.state.media}
                     multiple={false}
                     onBusy={this.handleUploading}
                     onChange={this.handleMedia}
                     showButton={true}
                     itemClassName="media-upload-container chat-btn"
                     className="media-upload-media"/>
  }

  render() {
    var rows="1";
    if (this.state.multiLine) {
      rows="1";
    }
    return (<div className="chat-input" style={this.state.mode === 'gif' ? { transform: 'translate3d(0,-100vh, 0' } : {}}>
      <div className="chat-input--middle">
        <textarea
          type="text"
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          ref="textarea"
          rows={rows}
          placeholder="type a message.."
          onChange={this.handleInputChange}
          value={this.state.messageText}
        />
      </div>
      <div className="chat-input--right">
        <button className="chat-btn gif-btn" onClick={this.handleActionGIF} style={this.calculateChatBtnStyle()}></button>
        {this.renderUploader()}
        <div onTouchStart={this.handleSendChat} onMouseDown={this.handleSendChat} className="send-btn" style={this.calculateSendBtnStyle()}>
          <span>Send</span>
        </div>

      </div>
    </div>);
  }
}

ChatInput.displayName = 'ChatInput';

// Uncomment properties you need
ChatInput.propTypes = {
  setChatInputState: React.PropTypes.func.isRequired,
  switchMode: React.PropTypes.func.isRequired,
};
// ChatInput.defaultProps = {};

export default ChatInput;
