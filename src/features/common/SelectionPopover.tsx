import { Component, PropsWithChildren, useState } from "react";
import onClickOutside from "react-onclickoutside";

function selectionExists() {
  const selection = window.getSelection();
  return (
    selection &&
    selection.rangeCount > 0 &&
    selection.getRangeAt(0) &&
    !selection.getRangeAt(0).collapsed &&
    selection.getRangeAt(0).getBoundingClientRect().width > 0 &&
    selection.getRangeAt(0).getBoundingClientRect().height > 0
  );
}

function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

class SP extends Component<
  PropsWithChildren<{
    showPopover: boolean;
    style?: {};
    topOffset?: number;
    onDeselect: () => void;
    onSelect: () => void;
  }>,
  { popoverBox: { top: number; left: number } }
> {
  constructor(props) {
    super(props);
    this.state = {
      popoverBox: {
        top: 0,
        left: 0
      }
    };
  }

  _handleMouseUp = () => {
    if (selectionExists()) {
      this.props.onSelect();
      return this.computePopoverBox();
    }
    this.props.onDeselect();
  };

  computePopoverBox = () => {
    const selection = window.getSelection();
    if (!selectionExists()) {
      return;
    }
    const selectionBox = selection.getRangeAt(0).getBoundingClientRect();
    const popoverBox = this.refs.selectionPopover.getBoundingClientRect();
    const targetBox = document
      .querySelector("[data-selectable]")
      .getBoundingClientRect();
    this.setState({
      popoverBox: {
        top: selectionBox.top - targetBox.top - this.props.topOffset,
        left:
          selectionBox.width / 2 -
          popoverBox.width / 2 +
          (selectionBox.left - targetBox.left)
      }
    });
  };

  handleClickOutside = () => {
    this.props.onDeselect();
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.showPopover === true && nextProps.showPopover === false) {
      clearSelection();
    }
  }

  componentDidMount() {
    const target = document.querySelector("[data-selectable]");
    target && target.addEventListener("mouseup", this._handleMouseUp);
  }

  componentWillUnmount() {
    const target = document.querySelector("[data-selectable]");
    target && target.removeEventListener("mouseup", this._handleMouseUp);
  }

  render() {
    const {
      onDeselect,
      onSelect,
      showPopover,
      children,
      style,
      topOffset,
      ...otherProps
    } = this.props; // eslint-disable-line no-unused-vars
    const {
      popoverBox: { top, left }
    } = this.state;
    const visibility = showPopover ? "visible" : "hidden";
    const display = showPopover ? "inline-block" : "none";

    return (
      <div
        ref="selectionPopover"
        style={{
          visibility,
          display,
          position: "fixed",
          top: window.innerHeight / 2,
          //left,
          right: window.innerWidth / 2 - 140,
          ...style
        }}
        // {...otherProps}
      >
        {children}
      </div>
    );
  }
}

export const SelectionPopover = onClickOutside(SP);
