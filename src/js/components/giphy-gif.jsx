import React from 'react';
import uuid from 'node-uuid'

class GiphyGif extends React.Component {

  constructor() {
    super();
    this.state = {};
    this.broadcastChat = this.broadcastChat.bind(this);
  }

  broadcastChat(err, data) {
    if (err) {
      console.log('error', err);
      return;
    }
    const m = data.result[0];
    // eslint-disable-next-line
    Bebo.Notification.roster('{{{user.username}}}', ' just posted a GIF', [], (error, resp) => {
      if (error) {
        return console.log('error sending notification', error);
      }
      return console.log('resp', resp); // an object containing success
    });
    // eslint-disable-next-line
    Bebo.Room.emitEvent({ type: 'chat_sent', message: m });

    this.props.switchMode('text');
  }


  render() {
    const { gif, me, children, originalSize, key } = this.props;
    const { username, user_id } = me;
    const { url, webp } = gif.images.fixed_width_downsampled;
    // eslint-disable-next-line
    const gifUrl = Bebo.getDevice() === 'android' ? webp || url : url;
    return (<div
      key={key || 0}
      className="gif-wrapper"
      onClick={this.props.onClick ? (this.props.onClick) : (() => {
        const image = {
          preview: gif.images.downsized_still.url,
          url: gif.images.fixed_width_downsampled.url,
          webp: gif.images.fixed_width_downsampled.webp,
          width: gif.images.fixed_width_downsampled.width,
          height: gif.images.fixed_width_downsampled.height,
        };
        const message = {
          id: uuid.v4(),
          image: image,
          username: username,
          user_id: user_id,
          type: 'image',
        };
        // eslint-disable-next-line
        Bebo.Db.save('messages', message, this.broadcastChat);
      })}
    >
      {originalSize ? (
        <img className="gif" style={{ paddingTop: 0 }} role="presentation" src={gifUrl.replace('http://', 'https://')} />
      ) : (
        <div className="gif" style={{ backgroundImage: `url(${gifUrl.replace('http://', 'https://')})` }} />
      )}
      {children}
    </div>);
  }
}

GiphyGif.displayName = 'GiphyGif';

// Uncomment properties you need
GiphyGif.propTypes = {
  gif: React.PropTypes.object,
  me: React.PropTypes.object.isRequired,
  switchMode: React.PropTypes.func.isRequired,
  onClick: React.PropTypes.func,
  children: React.PropTypes.element,
  originalSize: React.PropTypes.bool,
};
// GiphyGif.defaultProps = {};


export default GiphyGif;
