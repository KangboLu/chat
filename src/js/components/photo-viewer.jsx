import React from 'react';

class PhotoViewer extends React.Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
  }

  close() {
    this.props.close();
	}

  componentWillMount() {
  }

  render() {
    var bg = {backgroundImage: "url(" + this.props.media.mediaUrl + "?w=2049&h=2049)" };
    return (
      <div className="photo-viewer modal">
        <div className="photo-viewer-header">
          <div onClick={this.close} className="photo-viewer-close-btn"></div>
        </div>
        <div className="photo-viewer-media" style={bg}></div>
      </div>
    )
  }
}

PhotoViewer.displayName = "PhotoViewer";
export default PhotoViewer;
