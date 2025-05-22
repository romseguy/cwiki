import { Button } from "@chakra-ui/react";
import { marked } from "marked";
import { Component, PropsWithChildren, useEffect, useState } from "react";
import onClickOutside from "react-onclickoutside";

class SelectionPopover extends Component<
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

  componentWillReceiveProps(nextProps) {
    if (this.props.showPopover === true && nextProps.showPopover === false) {
      clearSelection();
    }
  }

  componentDidMount() {
    const target = document.querySelector("[data-selectable]");
    target.addEventListener("mouseup", this._handleMouseUp);
  }

  componentWillUnmount() {
    const target = document.querySelector("[data-selectable]");
    target.removeEventListener("mouseup", this._handleMouseUp);
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
          top: 10,
          //left,
          right: window.innerWidth / 2 - 50,
          ...style
        }}
        // {...otherProps}
      >
        {children}
      </div>
    );
  }
}

const md = `
  ---
order-number: 1

---

> [!info] The main article in the series [[Books]]

There are many **books** related to the topics covered on this wiki, and more generally, related to the topics discussed on the [Cassiopaea Forum](https://cassiopaea.org/forum/index.php). This article series is about such books.

Currently, the main way of navigating to articles on books is the [[Recommended books|recommended books]] list.

See also
--------

*   [[Recommended books]]

External links
--------------

*   [Cassiopaea Forum board: Books](https://cassiopaea.org/forum/index.php/board,31.0.html) (Discussion board for books. Some book discussions also take place elsewhere on the Cassiopaea Forum, though.)

All ‘Books’ topics
------------------

*   [[All and Everything]] (Ten books in three series by G. I. Gurdjieff)
*   [[Recommended books]] (The current list of books recommended by the FOTCM, with links to further information and overviews of the topics concerned.)
*   [[The Wave Series]] (A book in 8 volumes that covers concepts and material integral to Cassiopaea Forum.)

`;
const SandboxPage = () => {
  let html = ``;
  useEffect(() => {
    function decodeHTMLEntities(text) {
      var textArea = document.createElement("textarea");
      textArea.innerHTML = text;
      return textArea.value;
    }

    console.log(decodeHTMLEntities(html));
  }, []);
  return null;
};
// const SandboxPage = () => {
//   const [showPopover, setShowPopover] = useState(false);
//   const SP = onClickOutside(SelectionPopover);
//   return (
//     <div>
//       <div data-selectable>
//         <p>This is the first selectable paragraph. Looking pretty good.</p>
//         <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
//       </div>
//       <SP
//         showPopover={showPopover}
//         onSelect={() => {
//           setShowPopover(true);
//         }}
//         onDeselect={() => {
//           setShowPopover(false);
//         }}
//       >
//         <Button>Add a note with this selection</Button>
//       </SP>
//     </div>
//   );
// };
export default SandboxPage;
