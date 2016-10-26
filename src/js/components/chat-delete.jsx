import React from 'react';

class PostDelete extends React.Component {

  render() {
    return <div className='modal modal-dialog'>
    <div className='dialog'> 
      <span className='dialog--haeder'>{this.props.title}</span>
      <span className='dialog--body'>{this.props.body}</span>
      <span className='dialog--actions'>
        <button className='dialog--actions--btn' onClick={this.props.action1}>{this.props.actionLabel1}</button>
        <button className='dialog--actions--btn' onClick={this.props.action2}>{this.props.actionLabel2}</button>
      </span>
    </div>
    <div className='modal-overlay'></div>
    </div>
  }
}

PostDelete.displayName = "PostDelete";
export default PostDelete;
