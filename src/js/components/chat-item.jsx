import Moment from 'moment';
import React from 'react';
import Remarkable from 'remarkable';

var isMobile = true;
var md = new Remarkable({html: false,
                         breaks: true,
                         linkify: true});

class ChatItem extends React.Component {

  constructor() {
    super();
    this.state = {
      item: null,
      imageLoaded: false,
    };
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.renderAvatar = this.renderAvatar.bind(this);
    this.renderTimestamp = this.renderTimestamp.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.viewPhoto = this.viewPhoto.bind(this);
    this.checkForUsername = this.checkForUsername.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.toggleActions = this.toggleActions.bind(this);
  }

  componentWillMount() {
    isMobile = Bebo.Utils.isMobile();
    const obj = this.props.item;
    if (this.props.item.username === '') {
      obj.username = obj.user_id.substr(0, 7);
    }
    this.setState({ item: obj });
  }

  componentDidMount() {
    this.props.handleNewMessage();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.item.id !== nextProps.item.id) {
      return true;
    }
    if (this.props.roster !== nextProps.roster) {
      return true;
    }
    if ((this.props.showActionsForItem === this.props.item.id)
        !== (nextProps.showActionsForItem === nextProps.item.id)) {
      return true;
    }
    if (!this.state.item) {
      return true;
    }
    if (this.state.item.id !== nextState.item.id) {
      return true;
    }
    if (this.state.imageLoaded !== nextState.imageLoaded) {
      return true;
    }
    return false;
  }

  deleteItem(e) {
    this.props.deleteItem(this.state.item);
  }

  handleImageLoaded() {
    this.setState({ imageLoaded: true });
  }

  handleLinkClick(e) {
    if (e.target.href) {
      e.preventDefault();
      Bebo.openURI(e.target.href);
    }
  }

  renderAvatar(isRepeat) {
    const { item } = this.props;
    if (isRepeat) {
      return null;
    }
    const size = 288; // use default profile image size so we may cache it
    var url = item.user_image_url;
    if (url) {
      url = `${url}?h=${size}&w=${size}`;
    } else {
      url = `${Bebo.getImageUrl()}image/user/${item.user_id}?h=${size}&w=${size}`;
    }
    return (<div className="ui-avatar">
              <img src={url} role="presentation" />
            </div>);
  }

  renderTimestamp(isRepeat) {
    const { item } = this.props;
    if (isRepeat) {
      return null;
    }
    return this.timestampToString(item.created_at);
  }

  timestampToString(t) {
    var m = Moment(t);
    if (m.isBefore(new Date(), 'day')) {
      return m.format('lll');
    }
    return m.format('LT');
  }

  viewPhoto(e) {
    this.props.viewPhoto({"mediaUrl": e.currentTarget.dataset.mediaUrl});
  }

  checkForUsername(message) {
    if(!this.props.roster) { 
      return message; 
    }
    this.props.roster.forEach((user) => {
      var regexp = /(@\w*)/g;
      var results = message.match(regexp);
      if(!results){return}
      for (var i = 0; i < results.length; i++) {
        if('@'+user.username === results[i]){
          let checkName = '@' + user.username;
          let startMess = message.substring(0, message.indexOf(checkName));
          let endMess = message.substring(message.indexOf(checkName) + checkName.length);
          message = startMess + "<span class='mention-name'>" + checkName + "</span>" + endMess;
        }
      }
    })
    return message;
  }

  renderContent(isRepeat) {
    const { type, image } = this.props.item;
    if (type === 'image') {
      const {webp, url} = image;
      // eslint-disable-next-line
      let gifUrl = Bebo.getDevice() === 'android' ? webp || url : url;
      if (gifUrl.indexOf("imgdropt") !== -1) {
        gifUrl = gifUrl + "?w=1024&h=1024&contain";
      }
      return (
        <span className={`chat-item--inner--message--content ' ${this.state.imageLoaded ? 'is-loaded' : 'is-loading'}`}
              data-media-url={gifUrl}
              onClick={this.viewPhoto}>
          <div className="chat-item--inner--message--content--image">
            <div style={{ backgroundImage: `url(${gifUrl.replace('http://', 'https://')})` }} />
          </div>
        </span>);
    }

    var message = {__html: md.render(this.props.item.message)};
    message.__html = this.checkForUsername(message.__html);
    return (<div className="chat-item--inner--message--content"
      onClick={this.handleLinkClick} 
      dangerouslySetInnerHTML={message}>
   </div>)
  }

  toggleActions(e) {
    // FIXME only if keyboard is closed
    // console.log("showActions:" + !this.state.showActions);
    // this.setState({showActions: !this.state.showActions});
    this.props.toggleActionsForItem(e, this.props.item.id);
  }

  render() {

    var itemDelete;
    if (this.props.me.user_id === this.props.item.user_id || this.props.admin) {
      var style;
      if (isMobile && this.props.showActionsForItem === this.props.item.id) {
        style = { display: "block" };
      }
      itemDelete = <div style={style} className="chat-delete-btn" data-post-id={this.props.item.id} onClick={this.deleteItem}></div>
    }

    const { prevItem, item } = this.props;
    const isRepeat = (item.type !== 'image' && prevItem.user_id === item.user_id) && ((item.created_at-prevItem.created_at) < 60*60*1000);
    var onAnchorRef;
    if (this.props.isAnchor) {
      onAnchorRef = this.props.onAnchorRef
    }
    return (<li className="chat-item"
                onClick={this.toggleActions}
                ref={onAnchorRef} style={isRepeat ? { padding: 0 } : {}}>
      <div className="chat-item--inner">
        <div className="chat-item--inner--left">
          <div className="chat-item--inner--avatar" style={isRepeat ? { visibility: 'hidden', height: 'auto' } : {}}>
            {this.renderAvatar(isRepeat)}
          </div>
        </div>
        <div className="chat-item--inner--right">
          <div className="chat-item--inner--meta">
            <span style={isRepeat ? { display: 'none' } : {}} className="chat-item--inner--meta--username">{this.props.item.username}</span>
            <span style={isRepeat ? { display: 'none' } : {}} className="chat-item--inner--meta--time">
              {this.renderTimestamp(isRepeat)}
            </span>
          </div>
          <div className="chat-item--inner--message" style={isRepeat ? { margin: 0 } : {}}>
            {this.renderContent(isRepeat)}
          </div>
        </div>
        {itemDelete}
      </div>
    </li>);
  }
}

ChatItem.displayName = 'ChatItem';

// Uncomment properties you need
ChatItem.propTypes = {
  item: React.PropTypes.object.isRequired,
  handleNewMessage: React.PropTypes.func.isRequired,
  prevItem: React.PropTypes.object.isRequired,
};
// ChatItem.defaultProps = {};

export default ChatItem;
