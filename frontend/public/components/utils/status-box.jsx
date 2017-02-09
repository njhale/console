import React from 'react';
import classNames from 'classnames';

import {inject} from './index';

export const Box = ({children, className}) => <div className={classNames('cos-status-box', className)}>{children}</div>;

export const LoadError = ({label}) => <Box>
  <div className="cos-text-center cos-error-title">Error Loading {label}</div>
  <div className="cos-text-center">Please <a onClick={window.location.reload.bind(window.location)}>try again</a>.</div>
</Box>;

export const Loading = ({className}) => <div className={classNames('co-m-loader co-an-fade-in-out', className)}>
  <div className="co-m-loader-dot__one"></div>
  <div className="co-m-loader-dot__two"></div>
  <div className="co-m-loader-dot__three"></div>
</div>;

export const LoadingInline = () => <Loading className="co-m-loader--inline" />;

const LoadingBox = () => <Box><Loading /></Box>;

export const EmptyBox = ({label}) => <Box>
  <div className="cos-text-center">No {label} Found</div>
</Box>;

export const MsgBox = ({title, detail}) => <Box className="co-sysevent-stream__status-box-empty">
  {title && <div className="cos-status-box__title">{title}</div>}
  {detail && <div className="cos-text-center cos-status-box__detail">{detail}</div>}
</Box>;


export const StatusBox = (props) => {
  const {loadError, loaded} = props;
  const label = props.label;

  if (loadError) {
    return <LoadError label={label} loadError={loadError} />;
  }

  if (!loaded) {
    return <LoadingBox />;
  }

  const {data, filters, selected} = props;

  if (!data || _.isEmpty(data)) {
    return <EmptyBox label={label} />;
  }

  let children;

  if (_.isArray(data)) {
    children = inject(props.children, {data, filters, selected});
  } else {
    children = inject(props.children, data);
  }

  if (children.length > 1) {
    return <div>{children}</div>;
  }
  return children[0];
};
