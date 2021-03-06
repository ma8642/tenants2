import React, { useEffect, useState } from 'react';
import autobind from 'autobind-decorator';
import { ga } from './google-analytics';

export interface ProgressiveEnhancementProps {
  /**
   * A render prop to render the progressively enhanced version of
   * the component. It is guaranteed to only be run in the browser
   * (never on the server-side).
   */
  renderEnhanced: (ctx: ProgressiveEnhancementContext) => JSX.Element|React.ReactPortal|null;

  /**
   * A render prop to render the baseline version of the component.
   * This is the version that will be rendered on the server-side,
   * or if any problems occur when rendering the enhanced
   * version, or if it's determined that the browser doesn't have
   * the requisite functionality to run the enhanced version.
   */
  renderBaseline?: () => JSX.Element;

  /**
   * If this is true, the baseline version of the component will
   * always be rendered.
   */
  disabled?: boolean;
}

interface ProgressiveEnhancementState {
  /** Whether or not our component has mounted to the DOM yet. */
  isMounted: boolean;

  /** 
   * Whether or not we've caught an error from our underlying enhanced
   * component.
   */
  hasCaughtError: boolean;

  /**
   * Whether or not our underlying enhanced component has explicitly
   * told us to fall back to the baseline version.
   */
  hasFallenback: boolean;
}

/**
 * This context is passed to the enhanced render prop.
 */
export interface ProgressiveEnhancementContext {
  /**
   * This instructs the component to fall back to the baseline version,
   * optionally logging the given error.
   */
  fallbackToBaseline: (err?: Error) => void;
}

/**
 * This component can be used to encapsulate a progressive enhancement
 * strategy, whereby a "baseline" version that works on the server-side
 * and in older browsers (preferably ones where even the ability to run
 * JS is not assumed) can be dynamically upgraded to an "enhanced" version
 * if certain prerequisites are met.
 * 
 * By default, those prerequisites are simply "can the browser run JS",
 * as the enhanced version is rendered as soon as the component is
 * mounted into a live DOM.
 */
export class ProgressiveEnhancement extends React.Component<ProgressiveEnhancementProps, ProgressiveEnhancementState> {
  constructor(props: ProgressiveEnhancementProps) {
    super(props);
    this.state = {
      isMounted: false,
      hasCaughtError: false,
      hasFallenback: false
    };
  }

  componentDidCatch(error: Error) {
    if (this.isEnhanced()) {
      this.setState({ hasCaughtError: true });
      if (window.SafeMode) {
        window.SafeMode.ignoreError(error);
      }
      if (window.Rollbar) {
        window.Rollbar.error(
          "ProgressiveEnhancement caught an error, reverting to baseline.",
          error
        );
      }
      ga('send', 'exception', {
        exDescription: error.message,
        exFatal: false
      });
    } else {
      throw error;
    }
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  @autobind
  fallbackToBaseline(err?: Error) {
    this.setState({ hasFallenback: true });
    if (err) {
      console.error('Falling back to baseline implementation due to error: ', err);
    }
  }

  isEnhanced() {
    return (
      this.state.isMounted &&
      !this.props.disabled &&
      !this.state.hasCaughtError &&
      !this.state.hasFallenback
    );
  }

  render() {
    if (this.isEnhanced()) {
      return this.props.renderEnhanced({
        fallbackToBaseline: this.fallbackToBaseline
      });
    } else {
      return this.props.renderBaseline ? this.props.renderBaseline() : null;
    }
  }
}

/**
 * A simplified progressive enhancement component that just
 * renders its children when enabled, and doesn't render
 * anything when disabled.
 */
export function SimpleProgressiveEnhancement(props: { children: JSX.Element, disabled?: boolean }): JSX.Element {
  return <ProgressiveEnhancement
    renderEnhanced={() => props.children}
    disabled={props.disabled}
  />;
}

/**
 * The opposite of progressive enhancement: this component
 * only renders its children in the initial server-side render of
 * the page, and removes them as soon as it's mounted on the
 * client-side.
 */
export function NoScriptFallback(props: { children: JSX.Element }): JSX.Element {
  return <ProgressiveEnhancement
    renderEnhanced={() => null}
    renderBaseline={() => props.children}
  />;
}

/**
 * This is a very simple custom React Hook that lets us know if we've been
 * mounted into the DOM or not. It's useful for any component whose baseline
 * experience is very similar to its progressively-enhanced one.
 */
export function useProgressiveEnhancement(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  });

  return isMounted;
}
