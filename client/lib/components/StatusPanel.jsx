import React, {Component, cloneElement} from 'react';
import PropTypes from 'prop-types';
import {generateRandomHexadecimalStringOfLength} from '../../lib/helpers/functions';

const statusBoxPropertyAdder = moreProps => statusBox => {
  const uuid = generateRandomHexadecimalStringOfLength(5);
  return cloneElement(statusBox, {
    key: uuid,
    uuid,
    ...moreProps
  });
};

const statusBoxMoveUpOutAnimationWaitPeriod = 8000;
const statusBoxRemoveWaitPeriod = 490;

/**
 * Earlier the StatusPanel was being handled within each panels (ex:- ProjectEditPanel).
 * This caused much code repetition.
 *
 * The way it worked was as follows.
 * Each component had state field 'statusBoxes'. When a new StatusBox was needed to be
 * added to the panel, a new StatusBox (success or failure) was pushed to the
 * 'statusBoxes' field.
 *
 * StatusPanel was then re-rendered with new 'StatusBoxes' as children elements.
 * Code example-
 *   <StatusPanel>
 *     {statusBoxes}    // these are <StatusBox/> instances
 *   </StatusPanel>
 *
 * The problem with this approach is -
 *   1. Code repetition. Many Panels share similar mechanism of adding
 *      new StatusBoxes.
 *   2. Dirty Code. The parent Panels, like ProjectEditPanel had to deal
 *      with dismissing old StatusBoxes when clicked on 'x' essentially
 *      by removing the said StatusBox from their StatusBox list in the field
 *      'statusBoxes'.
 *
 * Now, StatusPanel has been refactored so that StatusPanel itself deals with
 * the addition and dismissal/removal of StatusBoxes
 *
 * The API is as follows.
 * When a parent Component like ProjectEditPanel wants to add new StatusBox, it
 * updates its state field 'statusBoxToAdd', like so
 *
 * addStatusBox(statusBox) { this.setState({statusBoxToAdd: statusBox}) }
 *
 * This is communicated to StatusPanel as follows,
 * <StatusPanel statusBoxToAdd={statusBoxToAdd} />
 *
 * So when statusBoxToAdd field updates, the StatusPanel component gets new
 * prop in 'statusBoxToAdd'
 *
 * The advantage is that this is all the parent component needs to do. It doesn't
 * have to deal with dismissing the StatusBox or setting interval to make the StatusBoxes
 * fade out after some time.
 *
 * The StatusPanel works in the following way.
 *   # Add StatusBox
 *     When the StatusPanel receives a new prop in 'statusBoxToAdd' field,
 *     (It figures out whether the prop is new by comparing with old prop)
 *     it updates its state, i.e pushes the new StatusBox to its state's
 *     'statusBoxes' field. This causes a re-render with the new StatusBox
 *
 *   # Remove/Dismiss StatusBox
 *     This is handled totally within the StatusPanel.
 *     Each StatusBox has a unique id which is used to identify the StatusBox
 *     from which the dismiss click event was generated. Then the identified
 *     StatusBox is removed.
 */

class StatusPanel extends Component {
  constructor(props) {
    super(props);

    this.removeStatusBox = this.removeStatusBox.bind(this);
    this.addPropsToStatusBox = statusBoxPropertyAdder({
      removeStatusBox: this.removeStatusBox,
      adding: true
    });

    this.state = {
      statusBoxes: props.statusBoxToAdd === null ?
        [] : [this.addPropsToStatusBox(props.statusBoxToAdd)]
    };

    this.timeoutHandlers = this.state.statusBoxes.map(
      statusBox => setTimeout(() =>
        this.removeStatusBox(statusBox.props.uuid), statusBoxMoveUpOutAnimationWaitPeriod)
    );
  }

  componentWillReceiveProps(nextProps) {
    /**
     * `nextProps.statusBoxToAdd === this.props.statusBoxToAdd` check is
     * necessary because React according to docs sometimes passes old
     * props to components.
     */
    if (nextProps.statusBoxToAdd === null ||
      nextProps.statusBoxToAdd === this.props.statusBoxToAdd) {
      return;
    }

    const newStatusBox = this.addPropsToStatusBox(nextProps.statusBoxToAdd);

    this.setState({
      statusBoxes: [
        ...this.state.statusBoxes,
        newStatusBox
      ]
    });

    this.timeoutHandlers.push(
      setTimeout(() =>
        this.removeStatusBox(newStatusBox.props.uuid), statusBoxMoveUpOutAnimationWaitPeriod)
    );
  }

  componentWillUnmount() {
    this.timeoutHandlers.map(timeoutHandler => clearTimeout(timeoutHandler));
  }

  showStatusBoxRemoveAnimation(uuid) {
    const statusBoxIndex =
      this.state.statusBoxes.findIndex(statusBox => statusBox.props.uuid === uuid);
    if (statusBoxIndex === -1) return;
    this.setState({
      statusBoxes: [
        ...this.state.statusBoxes.slice(0, statusBoxIndex),
        cloneElement(this.state.statusBoxes[statusBoxIndex], {adding: false}),
        ...this.state.statusBoxes.slice(statusBoxIndex + 1)
      ]
    });
  }

  actuallyRemoveStatusBoxFromStatusPanel(uuid) {
    const statusBoxIndex =
      this.state.statusBoxes.findIndex(statusBox => statusBox.props.uuid === uuid);
    if (statusBoxIndex === -1) return;
    this.setState({
      statusBoxes: [
        ...this.state.statusBoxes.slice(0, statusBoxIndex),
        ...this.state.statusBoxes.slice(statusBoxIndex + 1)
      ]
    });
  }

  removeStatusBox(uuid) {
    this.showStatusBoxRemoveAnimation(uuid);
    this.timeoutHandlers.push(
      setTimeout(() => this.actuallyRemoveStatusBoxFromStatusPanel(uuid), statusBoxRemoveWaitPeriod)
    );
  }


  render() {
    return (
      <div className="status-panel">
        {this.state.statusBoxes}
      </div>
    );
  }
}

StatusPanel.defaultProps = {
  statusBoxToAdd: null
};

StatusPanel.propTypes = {
  statusBoxToAdd: PropTypes.element
};

export default StatusPanel;
