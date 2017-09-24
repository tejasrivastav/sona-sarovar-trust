import React, {Component} from 'react';
import ImageCarousal from '../../lib/components/ImageCarousal';
import MessageCarousal from '../../lib/components/MessageCarousal';
import getScrollbarWidth from 'scrollbar-width';
import addHandler from '../../lib/helpers/addHandler';

const getSizeSubStateFromSrollBarWidth = scrollbarWidth => {
  scrollbarWidth = scrollbarWidth || 0;
  const ratio = 0.4;
  const width = window.innerWidth - scrollbarWidth;
  return {
    width,
    height: ratio * width
  }
};

class Carousal extends Component {
  constructor(props) {
    super(props);

    this.scrollbarWidth = null;

    this.state = {
      ...getSizeSubStateFromSrollBarWidth(this.scrollbarWidth),
      scrollState: "top"    // "top", "scrolled"
    };

    /*
     * This optimisation will not work in the following edge case -
     *   When vertical scrollbar wasn't present originally but
     *   appears because of vertical resize of screen.
     */

    document.addEventListener('DOMContentLoaded', () => {
      this.scrollbarWidth = getScrollbarWidth(true);
      this.setState(getSizeSubStateFromSrollBarWidth(this.scrollbarWidth));
    }, false);

    window.onresize = () => this.setState(getSizeSubStateFromSrollBarWidth(this.scrollbarWidth));

    addHandler(window, "onscroll", () => {
      if (window.scrollY > 100) {
        this.setState({scrollState: "scrolled"});
      } else {
        this.setState({scrollState: "top"});
      }
    });
  }

  render() {
    const {imageLinks, messages} = this.props;
    const {height, width, scrollState} = this.state;
    return (
      <div style={{height, width}} className={`carousal ${scrollState}`}>
        <ImageCarousal imageLinks={imageLinks} viewDuration={4000}/>
        <MessageCarousal messages={messages} viewDuration={4000}/>
      </div>
    );
  }
}

export default Carousal;
