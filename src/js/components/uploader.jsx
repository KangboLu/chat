import React from 'react';
import DropZone from 'react-dropzone';
import LoadImage from 'blueimp-load-image';
import uuid from 'node-uuid';

/*
 * value: list of media
 *
 * medium: key:
 *         url:
 *         state: "done"
 *         mimeType: "image/jpeg", ..
 *
 */

// .bebo-upload svg {
//     margin: auto;
//     height: 90%;
//     width: 90%;
// }
//
import styles from './uploaderStyles.css';
// console.log("styles", styles);
const cameraSvg = <svg className={styles['bebo-uploader-overlay']} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M64 96h64v64H64V96zM96 192c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32S113.7 192 96 192zM448 304c0 61.8-50.2 112-112 112s-112-50.2-112-112 50.2-112 112-112S448 242.2 448 304zM416 304c0-44.1-35.9-80-80-80s-80 35.9-80 80 35.9 80 80 80S416 348.1 416 304zM512 96v352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96c0-35.3 28.7-64 64-64V0h64v32h320C483.3 32 512 60.7 512 96zM160 480V64H64c-17.6 0-32 14.4-32 32v352c0 17.7 14.4 32 32 32H160zM480 96c0-17.6-14.3-32-32-32H192v416h256c17.7 0 32-14.3 32-32V96zM416 96h-32c-17.7 0-32 14.3-32 32s14.3 32 32 32h32c17.7 0 32-14.3 32-32S433.7 96 416 96z"/></svg>;


class Upload extends React.Component {

  constructor(params) {
    super(params);
    this.state = {
      media: []
    }
    this.onClick = this.onClick.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.newImage = this.newImage.bind(this);
  }

  componentWillMount() {
    if (this.props.value) {
      for(var i=0; i< this.props.value.length; i++) {
        if (!this.props.value[i].key) {
          this.props.value[i].key = uuid.v4();
        }
      }
      this.setState({media: this.props.value});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value) {
      for(var i=0; i< nextProps.value.length; i++) {
        if (nextProps.value[i].key == null) {
          nextProps.value[i].key = uuid.v4();
        }
      }
      var d = _.difference(this.state.media, nextProps.value);
      if (d.length > 0) {
        this.setState({media: nextProps.value});
      }
    }
  }

  isAllDone(media) {
    var test = function (m) { return m.state !== undefined && m.state !== "done" };
    return _.findIndex(media, test) === -1
  }

  newImage() {
    var image = { key: uuid.v4(),
                  state: "capture"};
    var media = this.state.media;
    if (this.isAllDone(media)) {
      if (this.props.onBusy) {
        this.props.onBusy();
      }
    }
    media.push(image);
    this.setState({media: media});
    return image;
  }

  uploadImage(image) {
    var media = this.state.media;
    var medium = _.find(media, { key: image.key});
    if (!medium) {
      media.push(image);
      medium = image;
    }
    medium.state = "uploading";
    this.setState({media: media});

    var that = this;
    return Bebo.uploadImage(image.raw)
      .then(function(image_url) {
        image.state = "done";
        image.url = image_url;
        delete image.raw;
        var media = that.state.media;
        var idx = _.findIndex(that.state.media, {key: image.key});
        if (idx === -1) {
          console.log("Lost image", image, media);
          return;
        }
        media[idx] = image;
        if (that.isAllDone(media)) {
          if(that.props.onChange) {
            that.props.onChange(media);
          }
        }

        if (that.props.multiple === false && that.props.showButton === true) {
          media = [];
        }

        that.setState({media: media});
      });
  }

  onDrop(files) {
    var that = this;
    console.log("onDrop")

    files.forEach(function(file) {
      var image = that.newImage();
      LoadImage.parseMetaData(file, (data) => {
        let orientation = 0;
        if (data.exif) {
          orientation = data.exif.get('Orientation');
        }
        LoadImage(
          file,
          (canvas) => {
            const base64data = canvas.toDataURL('image/jpeg');
            var mimeType = base64data.split(':')[1].split(';')[0];
            console.log("onDrop - cb", canvas)
            window.c = canvas;
            image.raw = base64data;
            image.mimeType = mimeType;
            image.height = canvas.height;
            image.width = canvas.width;
            // FIXME we proabaly should down size, but loadImage converson sucks (is broken)
            that.uploadImage(image);
          }, {
            orientation,
            canvas: true
          }
        );
      });
    });
  }

  onClick(e) {
    this.refs.dropZone.open();
  }

  addImage() {
    // TODO state protection?
    this.refs.dropZone.open();
  }

  renderCaptureMedium(m) {
    var itemClassName = ((this.props.itemClassName && this.props.itemClassName + " ") || "");
    return (
      <li key={m.key} className={itemClassName || styles["bebo-uploader-image--uploading"]}>
        <svg className="capture-background" width="25px" height="18px" viewBox="0 0 146 118" version="1.1">
          <path d="M145.8408,103.37677 L145.6,100.19077 L145.6,6.01002703 C145.6,3.73015541 143.8712,1.59459459 141.5844,1.59459459 L137.2792,1.59459459 C136.416,0.614317568 135.1224,0.0318918919 133.718,0.137135135 L114.2908,1.59459459 L17.2176,1.59459459 C14.934,1.59459459 13.2,3.73015541 13.2,6.01002703 L13.2,9.17888514 L4.3884,9.83984459 C2.0132,10.0180405 0.23,12.0878243 0.4096,14.4577905 L7.9072,113.724493 C8.0852,116.095257 10.1604,117.87602 12.5344,117.697824 L141.8648,107.995514 C144.242,107.817318 146.0196,105.747135 145.8408,103.37677 L145.8408,103.37677 Z M13.2,94.4430541 L7.3508,17.0007703 L13.2,16.5622568 L13.2,94.4430541 L13.2,94.4430541 Z M48.3352,24.1361824 C53.78,24.1361824 58.1956,28.5368649 58.1956,33.9620743 C58.1956,39.3856892 53.78,43.7851757 48.3352,43.7851757 C42.8936,43.7851757 38.4784,39.3860878 38.4784,33.9620743 C38.4784,28.5368649 42.8936,24.1361824 48.3352,24.1361824 L48.3352,24.1361824 Z M14.3884,110.175723 L13.9104,103.847973 C14.6244,104.926318 15.8168,105.641892 17.218,105.641892 L74.8224,105.641892 L14.3884,110.175723 L14.3884,110.175723 Z M130,89.2972973 L113.2368,89.2972973 L96.408,89.2972973 L62.7516,89.2972973 L29.2,89.2972973 L29.2,82.9819054 L54.386,64.0397162 L54.454,64.4766351 L71.1556,74.5955338 L96.3908,40.7578378 L117.408,53.3371959 L130,80.9591622 L130,89.2972973 L130,89.2972973 Z" id="Shape" stroke="none" fill="#000000" fillRule="evenodd"></path>
        </svg>
        <div className={styles["bebo-uploader--spinner"]} />
      </li>
    )
  }

  renderUploadingMedium(m) {
    var itemClassName = ((this.props.itemClassName && this.props.itemClassName + " ") || "");
    var style = {backgroundImage: 'url(' + (m.url || m.raw) + ')'};
    return (
      <li key={m.key} className={itemClassName || styles["bebo-uploader-image--uploading"]} style={style}>
        <div className={styles["bebo-uploader--spinner"]} />
      </li>
    )
  }

  onDelete(e) {
    var media = this.state.media;
    media = _.remove(media, {"key": e.currentTarget.dataset.mediaId});
    if (this.isAllDone(media)) {
      if(this.props.onChange) {
        this.props.onChange(media);
      }
    }
    this.setState({media: media});
  }

  renderFinalMedium(m) {
    var itemClassName = ((this.props.itemClassName && " " + this.props.itemClassName) || "");
    var style = {backgroundImage: 'url(' + (m.url || m.raw) + ')'};
    return (
      <div className={itemClassName} style={style} key={m.key} data-media-id={m.key} onClick={this.onDelete}>
        <div className={styles["bebo-uploader--delete"]}>
          <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" >
              <polygon id="Shape" stroke="none" fill="#FFFFFF" fillRule="evenodd" points="14 1.4 12.6 0 7 5.6 1.4 0 0 1.4 5.6 7 0 12.6 1.4 14 7 8.4 12.6 14 14 12.6 8.4 7"></polygon>
          </svg>
        </div>
      </div>
    )
  }

  renderButton() {
    var itemClassName = ((this.props.itemClassName && " " + this.props.itemClassName) || "");
    if (this.props.showButton && this.isAllDone(this.media)) {
      return <div className={itemClassName} onClick={()=>this.onClick()}>
              {cameraSvg}
             </div>;
    }
  }

  renderMedium(m) {

    if (m.state === "capture") {
      return this.renderCaptureMedium(m);
    } else if (m.state === "uploading") {
      return this.renderUploadingMedium(m);
    } else {
      return this.renderFinalMedium(m);
    }
  }

  render() {
    var className = styles["bebo-uploader"] + ((this.props.className && " " + this.props.className) || "");
    var dropZone = <DropZone multiple={this.props.multiple || false}
                             inputProps={{ capture: 'camera' }}
                             onDrop={this.onDrop}
                             ref="dropZone"
                             style={{ display: 'none' }}
                             accept="image/*" />;


    return (
      <ul className={className}>
        {this.state.media.map((i) => this.renderMedium(i))}
        {this.renderButton()}
        {dropZone}
      </ul>
    )
  }
}

Upload.displayName = 'Uploader';

export default Upload;
