import React from 'react';
import AriaModal from 'react-aria-modal';
import autobind from 'autobind-decorator';
import { RouteComponentProps, withRouter, Route } from 'react-router';
import { getAppStaticContext } from './app-static-context';
import { Link, LinkProps } from 'react-router-dom';


const ANIMATION_CLASS = "jf-modal-animate";

const DIALOG_CLASS = "jf-modal-dialog"

const UNDERLAY_CLASS = "jf-modal-underlay";

interface ModalRenderPropContext {
  /** Handler the render prop can call to close the modal. */
  close: () => void;

  /**
   * Returns Link properties for closing the modal, to be used by
   * e.g. custom-rendered "ok" buttons.
   */
  getLinkCloseProps: () => LinkProps;
}

interface ModalProps {
  title: string;
  children?: any;
  render?: (ctx: ModalRenderPropContext) => JSX.Element;
  onClose?: () => void;
  onCloseGoBackOneDirLevel?: boolean;
  onCloseGoTo?: string;
}

type ModalPropsWithRouter = ModalProps & RouteComponentProps<any>;

interface ModalState {
  isActive: boolean;
  animate: boolean;
}

function getOneDirLevelUp(path: string) {
  return path.split('/').slice(0, -1).join('/');
}

export class ModalWithoutRouter extends React.Component<ModalPropsWithRouter, ModalState> {
  constructor(props: ModalPropsWithRouter) {
    super(props);
    this.state = {
      isActive: false,
      animate: true
    };
  }

  get closeDestination(): string|null {
    if (this.props.onCloseGoBackOneDirLevel) {
      return getOneDirLevelUp(this.props.location.pathname);
    } else if (this.props.onCloseGoTo) {
      return this.props.onCloseGoTo;
    }
    return null;
  }

  @autobind
  getLinkCloseProps(): LinkProps {
    const { closeDestination } = this;
    if (!closeDestination) {
      throw new Error("Cannot get Link close props when closeDestination is null!");
    }
    return {
      to: closeDestination,
      onClick: (e) => {
        e.preventDefault();
        this.handleClose();
      }
    };
  }

  @autobind
  handleClose() {
    this.setState({ isActive: false });
    if (this.props.onCloseGoBackOneDirLevel && this.props.history.action === "PUSH") {
      this.props.history.goBack();
    } else if (this.closeDestination) {
      this.props.history.push(this.closeDestination);
    }
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  componentDidMount() {
    this.setState({ isActive: true });

    // It's possible that this modal was pre-rendered on the
    // server side. If so, get rid of it, since we've just
    // replaced it with this component instance.
    const prerenderedModalEl = document.getElementById('prerendered-modal');
    if (prerenderedModalEl && prerenderedModalEl.parentNode) {
      if (prerenderedModalEl.children.length) {
        // There's an actual modal we're replacing; since it came with the
        // page, it's already being shown at its final location, so we don't
        // want to animate ourselves in, lest we disorient the user.
        this.setState({ animate: false });
      }
      prerenderedModalEl.parentNode.removeChild(prerenderedModalEl);
    }
  }

  renderServerModal(): JSX.Element {
    return (
      <div className={UNDERLAY_CLASS}>
        <div className={DIALOG_CLASS}>
          {this.renderBody()}
        </div>
      </div>
    );
  }

  renderBody(): JSX.Element {
    return (
      <React.Fragment>
        {this.props.render && this.props.render({
          close: this.handleClose,
          getLinkCloseProps: this.getLinkCloseProps
        })}
        {this.props.children}
        <button onClick={this.handleClose} className="modal-close is-large" aria-label="close"></button>
      </React.Fragment>
    );
  }

  render() {
    const ctx = getAppStaticContext(this.props);
    if (ctx) {
      ctx.modal = this.renderServerModal();
    }

    if (!this.state.isActive) {
      return null;
    }

    const underlayClasses = [UNDERLAY_CLASS];

    if (this.state.animate) {
      underlayClasses.push(ANIMATION_CLASS);
    }

    return (
      <AriaModal
        titleText={this.props.title}
        onExit={this.handleClose}
        includeDefaultStyles={false}
        dialogClass={DIALOG_CLASS}
        underlayClass={underlayClasses.join(' ')}
        focusDialog
      >
        {this.renderBody()}
      </AriaModal>
    );
  }
}

export const Modal = withRouter(ModalWithoutRouter);

interface LinkToModalRouteProps extends LinkProps {
  to: string;
  component: React.ComponentType;
  children: any;
}

/**
 * A component that's similar to React Router's <Link> but
 * assumes the link target is a modal, and simultaneously
 * defines a route that points to said modal.
 */
export function ModalLink(props: LinkToModalRouteProps): JSX.Element {
  const { component, ...linkProps } = props;
  return (
    <React.Fragment>
      <Link {...linkProps}>{props.children}</Link>
      <Route path={props.to} exact component={props.component} />
    </React.Fragment>
  );
}
