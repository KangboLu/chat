import React from 'react';
import GiphyGif from './giphy-gif.jsx';
import SimpleFetch from 'react-simple-fetch';
import Cluster from 'react-cluster';

const loader = function loader() {
  return (<div className="loader">
    <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 81 45" >
      <circle className="circle1" fill="#fe1263" cx="13.5" cy="22.5" r="4.5" />
      <circle className="circle2" fill="#fe1263" cx="31.5" cy="22.5" r="4.5" />
      <circle className="circle3" fill="#fe1263" cx="49.5" cy="22.5" r="4.5" />
      <circle className="circle4" fill="#fe1263" cx="67.5" cy="22.5" r="4.5" />
    </svg>
  </div>);
};

import backButton from '../../assets/img/icBack@3x.png';
import giphyAtttrib from '../../assets/img/powered_by_giphy.png';

loader.displayName = 'Loader';

class GiphyBrowser extends React.Component {

  constructor() {
    super();
    this.state = {
      categories: [
        {
          q: 'unicorn',
          id: 'zyvX4znjfNqdG',
        },
        {
          q: 'agree',
          id: 'l0MYrWIbh4o0NpVfO',
        },
        {
          q: 'applause',
          id: '8yyjBS2Cbu6Pe',
        },
        {
          q: 'awww',
          id: 'CwUkL9hh3vwaY',
        },
        {
          q: 'dance',
          id: 'MVDPX3gaKFPuo',
        },
        {
          q: 'do+not+want',
          id: '3WwhOP9gFzfmU',
        },
        {
          q: 'eww',
          id: 'NcXQzr1mcQnza',
        },
        {
          q: 'eye+roll',
          id: '3oAt2dA6LxMkRrGc0g',
        },
        {
          q: 'facepalm',
          id: '6yRVg0HWzgS88',
        },
        {
          q: 'fist+pump',
          id: '3o7abv34kyNg4A3XEY',
        },
        {
          q: 'good+luck',
          id: '4KxeicCUTvhrW',
        },
        {
          q: 'hearts',
          id: 'gfvxlwRKH1y5q',
        },
        {
          q: 'high+five',
          id: 'OcZp0maz6ALok',
        },
        {
          q: 'hug',
          id: 'dYJuvv8onVNJK',
        },
        {
          q: 'IDK',
          id: 'Y3jYuzvSJdh7y',
        },
        {
          q: 'kiss',
          id: '3wB3QcqXDMt20',
        },
        {
          q: 'mic+drop',
          id: '3o6Zthv4W72jUHRCUg',
        },
        {
          q: 'oh+snap',
          id: '26AHLBZUC1n53ozi8',
        },
        {
          q: 'oops',
          id: '3oEjHG1n0KwFz4hcC4',
        },
        {
          q: 'please',
          id: '9QrNWBKvBpCw0',
        },
        {
          q: 'popcorn',
          id: 'qVyrWRVaFoP7O',
        },
        {
          q: 'SMH',
          id: 'oxFDq4E9CHb7W',
        },
        {
          q: 'scared',
          id: 'rBJdErsm1DW24',
        },
        {
          q: 'seriously',
          id: 'aOROVpAgtsgdG',
        },
        {
          q: 'shocked',
          id: 'jIRPOnUASNsQw',
        },
        {
          q: 'shrug',
          id: 'qNFGrq3k8n6AE',
        },
        {
          q: 'sigh',
          id: 'LAFShX32UwUj6',
        },
        {
          q: 'slow+clap',
          id: '2xIOiAPXonois',
        },
        {
          q: 'sorry',
          id: '9heeVL46MuVq0',
        },
        {
          q: 'thank+you',
          id: 'tjuWJTevYz1Oo',
        },
        {
          q: 'thumbs+down',
          id: 'lUpO7DsIsdwpq',
        },
        {
          q: 'thumbs+up',
          id: 'l0MYHEI0xktKCVjri',
        },
        {
          q: 'want',
          id: 'sZn9IDozfRlGo',
        },
        {
          q: 'win',
          id: '2RGhmKXcl0ViM',
        },
        {
          q: 'wink',
          id: 'WWnyPSQDjQDIc',
        },
        {
          q: 'yawn',
          id: 'l46CtxRPR33gqo1MY',
        },
        {
          q: 'yes',
          id: 'z4Ut4kYEMW0s8',
        },
        {
          q: 'you+got+this',
          id: '11F0d3IVhQbreE',
        },
      ],
      filter: null,
      height: 0,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ height: window.innerHeight });
    }, 100);
  }

  render() {
    const { categories, filter, height } = this.state;
    const { style } = this.props;
    return (<div className="giphy-browser" style={style}>
      <div className="giphy-nav-title" onClick={filter ? (() => { this.setState({ filter: null }); }) : (() => {})}>
        {filter ? <button className="giphy-back"><img alt="back" src={backButton} /></button> : null}
        <div className="giphy-title" style={filter ? { marginRight: 0, paddingRight: '5px' } : {}}>{filter ? filter.q.replace(/\+/g, ' ') : 'Categories'}</div>
      </div>
      {filter ? (
        <div style={filter ? { position: 'absolute', top: 0, left: 0 } : {}} className={filter ? 'gif-list-container' : ''}>
          <SimpleFetch loader={loader()} as="gif" path="data" url={`http://api.giphy.com/v1/gifs/search?q=${filter.q}&api_key=dc6zaTOxFJmzC`}>
            <GiphyGif originalSize switchMode={this.props.switchMode} actingUser={this.props.actingUser} />
          </SimpleFetch>
        </div>
      ) : (
        <Cluster className="gif-list-container" height={height || window.innerHeight} rowHeight={(window.innerWidth * 0.4)}>
          {categories.map((category, ind) => (
            <SimpleFetch key={ind} as="gif" path="data" url={`http://api.giphy.com/v1/gifs/${category.id}?api_key=dc6zaTOxFJmzC`}>
              <GiphyGif loader={loader()} onClick={() => { this.setState({ filter: category }); }} switchMode={this.props.switchMode} actingUser={this.props.actingUser}>
                <div className="giphy-gif--category-background">
                  <div className="giphy-gif--category-title">{category.q.replace(/\+/g, ' ')}</div>
                </div>
              </GiphyGif>
            </SimpleFetch>)
          )}
        </Cluster>
      )}
      <img className="giphy-attrib" src={giphyAtttrib} role="presentation" />
    </div>);
  }
}

GiphyBrowser.displayName = 'GiphyBrowser';

// Uncomment properties you need
GiphyBrowser.propTypes = {
  switchMode: React.PropTypes.func.isRequired,
  actingUser: React.PropTypes.object.isRequired,
  style: React.PropTypes.object.isRequired,
};
// GiphyBrowser.defaultProps = {};


export default GiphyBrowser;
