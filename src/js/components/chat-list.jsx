import React from 'react';
import ChatItem from './chat-item.jsx';

import uuid from 'node-uuid';

const COUNT=30;
var bot_user_id;

class ChatList extends React.Component {

  constructor() {
    super();
    this.state = {
      maxCount: 50,
      scrolledPastFirstMessage: false,
      isScrolling: false,
      messages: [],
      unloadedMessages: [],
      usersTypingCount: 0,
      hasMore: true,
      roster: null,
    };
    if (!bot_user_id) {
      bot_user_id = "208ee4a33aca4b238648998e98fbb302";
      if (Bebo.Utils.getEnv() === "dev") {
        bot_user_id = "9c7b8cfb6e5b47b5afc2e3eb7f864516";
      }
    }
    this.maxElement = 0;
    this.hasMore = true;
    this.offset = 0;
    this.store = [];
    this.usersTyping = {};
    this.getMessages = this.getMessages.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    this.handleMessageEvent = this.handleMessageEvent.bind(this);
    this.addNewMessages = this.addNewMessages.bind(this);
    this.handlePresenceUpdates = this.handlePresenceUpdates.bind(this);
    this.scrollChatToBottom = this.scrollChatToBottom.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.updatePresence = this.updatePresence.bind(this);
    this.handleListClick = this.handleListClick.bind(this);
    this.renderNoChatsMessage = this.renderNoChatsMessage.bind(this);
    this.renderMessagesBadge = this.renderMessagesBadge.bind(this);
    this.renderUsersAreTyping = this.renderUsersAreTyping.bind(this);
    this.renderChatList = this.renderChatList.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.onAnchorRef = this.onAnchorRef.bind(this);
  }

  componentWillMount() {
    // eslint-disable-next-line
    Bebo.onEvent(this.handleEventUpdate);
  }

  componentWillUpdate(prevProps, prevState) {
    this.saveScrollPosition();
  }

  componentDidMount() {
    const list = this.refs.chatListInner;
    if (list.scrollTop < 1000 && this.hasMore) {
      this.loadMore(this.offset);
    }
    this.refs.chatListInner.scrollTop = this.refs.chatListInner.scrollHeight;
    Bebo.Server.getRoster((err, data) => {
      if(err){ console.log('err gettting roster')}
        console.log('ROSTER DATA', data);
      this.setState({roster: data });
    });
    // this.setState({roster: [{username: 'joshua'}, {username: 'bob'}] });
  }

  componentDidUpdate() {
    this.keepScrollPosition();
    const list = this.refs.chatListInner;
    if (list.scrollTop < 1000 && this.hasMore) {
      this.loadMore(this.offset);
    }
    // if (!this.state.scrolledPastFirstMessage) {
    //   this.refs.chatListInner.scrollTop = this.refs.chatListInner.scrollHeight;
    // }
  }

  componentWillUnmount() {
    if(this.presenceTimeout) {
      clearTimeout(this.presenceTimeout);
    }

    if(this.presenceInterval) {
      clearInterval(this.presenceInterval);
    }
  }

  loadMore(offset) {
    return this.getMessages(COUNT, offset);
  }

  keepScrollPosition() {
    if (this.scrollTop !== 0) {
      this.scrollTarget = this.scrollTop + ( this.refs.chatListInner.scrollHeight - this.scrollHeight);
      this.refs.chatListInner.scrollTop = this.scrollTarget;
    }
  }

  onAnchorRef(ref) {
    this.anchorRef = ref;
  }

  getFakeWelcomeMessage() {
    var created_at = Date.now();
    return [
      {
        id: uuid.v4(),
        type: 'message',
        username: "Team Bebo",
        user_id: bot_user_id,
        user_image_url: "https://a.imgdropt.com/image/f162ee07-f92a-44de-bb64-7d70c5dd0ce8",
        message: "Welcome to your group chat!",
        users: [],
        created_dttm: new Date(),
        created_at,
      },
      {
        id: uuid.v4(),
        type: 'message',
        username: "Team Bebo",
        user_id: bot_user_id,
        user_image_url: "https://a.imgdropt.com/image/f162ee07-f92a-44de-bb64-7d70c5dd0ce8",
        message: "This chat is private to your group, you already know how chat works 🙂",
        users: [],
        created_dttm: new Date(),
        created_at,
      },
      {
        id: uuid.v4(),
        type: 'message',
        username: "Team Bebo",
        user_id: bot_user_id,
        user_image_url: "https://a.imgdropt.com/image/f162ee07-f92a-44de-bb64-7d70c5dd0ce8",
        message: "I'l be dropping out now",
        users: [],
        created_dttm: new Date(),
        created_at,
      }
    ];
  }

  getMessages(count, offset) {

    if (!offset) {
      offset = 0;
    }

    var maxElement = count + offset;
    if (maxElement <= this.maxElement) {
      return;
    }

    var that = this;
    var options = {count, offset, sort_by:"created_dttm", sort_order: "desc"};
    Bebo.Db.get('messages', options)
      .then(function (data) {
        var hasMore;
        if (options.count) {
          hasMore = data.result.length === options.count;
        }
        var state = {};
        that.offset = options.offset + options.count;
        if (options.count) {
          that.hasMore = hasMore;
          state.hasMore = hasMore;
        }
        if (data.result.length === 0 && options.offset === 0 && options.count > 0) {
          that.store = that.getFakeWelcomeMessage();
        } else {
          that.store = _.unionBy(data.result, that.store, "id");
          that.store = _.orderBy(that.store, "created_dttm", "asc");
          if (!that.anchor_id && that.store.length !== 0) {
            that.anchor_id = that.store[that.store.length-1].id;
          }
        }
        state.messages = that.store;
        that.setState(state);
      }).catch((err) => console.log('error getting list:', err, err.stack));
  }

  saveScrollPosition() {
    this.scrollTop = this.refs.chatListInner.scrollTop;
    this.scrollHeight = this.refs.chatListInner.scrollHeight;
    if (this.anchorRef) {
      console.log(this.anchorRef.offsetTop);
      this.offsetTop = this.anchorRef.offsetTop;
    }
    console.log("scrollTop", this.scrollTop, this.scrollHeight);
  }

  handleScroll() {
    const list = this.refs.chatListInner;
    if (list.scrollTop < 800 && this.hasMore) {
      this.loadMore(this.offset);
    }
    // console.log("handleScroll");
    // if (this.scrollTarget !== list.scrollTop) {
    //   console.error("manual scroll", this.scrollTarget, list.scrollTop);
    //   this.setState({ scrolledPastFirstMessage: true });
    // }
  }

  keepScrollPosition() {
    if (this.offsetTop == null) {
      return;
    }
    if (this.anchorRef.offsetTop !== this.offsetTop) {
      this.scrollTarget = this.scrollTop + (this.anchorRef.offsetTop - this.offsetTop );
      this.refs.chatListInner.scrollTop = this.scrollTarget;
    }
  }

  handleEventUpdate(data) {
    if (data.type === 'chat_sent') {
      this.handleMessageEvent(data.message);
    }
    if (data.type === 'chat_presence') {
      this.handlePresenceUpdates(data.presence);
    }
  }

  handleMessageEvent(message) {
    this.store = _.unionBy([message], this.store, "id");
    this.store = _.orderBy(this.store, "created_dttm", "asc");

    if (!this.state.scrolledPastFirstMessage) {
      this.addNewMessages([message]);
      if (message.user_id === this.props.actingUser.user_id) {
        this.scrollChatToBottom();
      }
    } else {
      const messages = this.state.unloadedMessages;
      messages.push(message);
      this.setState({ unloadedMessages: messages });
    }
  }

  addNewMessages(arr) {
    console.log("addNewMessages", arr);
    const messages = this.state.messages.concat(arr);
    this.setState({
      messages,
      unloadedMessages: [],
    });
  }

  handlePresenceUpdates(user) {
    if (user.started_typing === this.props.actingUser.user_id || user.stopped_typing === this.props.actingUser.user_id) {
      return;
    }
    if(this.presenceTimeout) {
      clearTimeout(this.presenceTimeout);
    }
    this.presenceTimeout = setTimeout(() => {
      if(this.presenceInterval) {
        clearInterval(this.presenceInterval);
      }
    }, 4000);

    if (user.started_typing) {
      this.usersTyping[user.started_typing] = Date.now();

      if (!this.presenceInterval) {
        this.updatePresence();
        this.presenceInterval = setInterval(this.updatePresence, 3000);
      }
    } else if (user.stopped_typing && this.usersTyping[user.stopped_typing]) {
      delete this.usersTyping[user.stopped_typing];
      this.updatePresence();
    }
  }

  updatePresence() {
    const usersTypingCount = Object.keys(this.usersTyping).length;
    if(usersTypingCount === 0) {
      clearInterval(this.presenceInterval);
    }
    this.setState({ usersTypingCount });
  }

  scrollChatToBottom() {
    if (this.state.unloadedMessages.length > 0) {
      this.addNewMessages(this.state.unloadedMessages);
    }
    this.refs.chatListInner.scrollTop = this.refs.chatListInner.scrollHeight;

    this.setState({
      scrolledPastFirstMessage: false,
    });
  }


  handleNewMessage() {
    if (!this.state.scrolledPastFirstMessage) {
      this.scrollChatToBottom();
    }
  }

  handleListClick() {
    this.props.blurChat();
  }

  // Renders

  renderNoChatsMessage() {
    if (!this.state.messages || this.state.messages.length === 0) {
      return <div key="nope" className="chat-list--no-messages" />;
    }
  }

  renderMessagesBadge() {
    if (this.state.unloadedMessages.length > 0) {
      return (<div className="chat-list--unseen-messages" onClick={this.scrollChatToBottom}>
        <span className="chat-list--unseen-messages--text">{`${this.state.unloadedMessages.length} New Messages`}</span>
      </div>);
    }
    return null;
  }

  renderUsersAreTyping() {
    const count = this.state.usersTypingCount;
    return (<div className="chat-list--users-typing" style={count > 0 ? {} : { transform: 'translate3d(0,100%,0)' }}>
      <span className="chat-list--users-typing--text">{count === 1 ? '1 person is typing right now...' : `${count} people are typing right now...`}</span>
    </div>);
  }

  renderChatList() {
    const { messages } = this.state;
    var hasMore = this.state.hasMore && this.hasMore;

    return (
      <div ref="chatListInner" className="chat-list--inner" onScroll={this.handleScroll} onClick={this.handleListClick}>
        <ul ref="chats" className="chat-list--inner--list">
          {hasMore ?  <li style={{clear: 'both'}} className="loading"></li> : ""}
          {messages.map((item, i) => <ChatItem
            roster={this.state.roster}
            isAnchor={item.id===this.anchor_id}
            onAnchorRef={this.onAnchorRef}
            handleNewMessage={this.handleNewMessage}
            viewPhoto={this.props.viewPhoto}
            item={item} prevItem={messages[i - 1] || {}}
            key={item.id} />)}
          {this.renderNoChatsMessage}
        </ul>
      </div>
    );
  }

  render() {
    const count = this.state.usersTypingCount;
    return (
      <div className="chat-list">
        {this.renderMessagesBadge()}
        {this.renderChatList()}
        {this.renderUsersAreTyping()}
      </div>);
  }

}

ChatList.displayName = 'ChatList';

// Uncomment properties you need
ChatList.propTypes = {
  blurChat: React.PropTypes.func.isRequired,
  actingUser: React.PropTypes.object.isRequired,
};
// ChatList.defaultProps = {};

export default ChatList;
