import * as React from 'react';
import {connect} from 'react-redux';
import { Helmet } from 'react-helmet';

import {ConfigMaps} from './configmap';
import {DaemonSets} from './daemonset';
import {DeploymentsList} from './deployment';
import {JobsList} from './job';
import {NamespacesList} from './namespace';
import {NodesListSearch} from './node';
import {PodList} from './pod';
import {ReplicaSetsList} from './replicaset';
import {ReplicationControllersList} from './replication-controller';
import {SecretsList} from './secret';
import {ServiceAccountsList} from './service-account';
import {ServicesList} from './service';
import {IngressesList} from './ingress';
import {PrometheusInstancesList} from './prometheus';
import {ServiceMonitorsList} from './service-monitor';
import {AlertManagersList} from './alert-manager';
import {getActiveNamespace} from '../ui/ui-actions';
import {NetworkPoliciesList} from './network-policy';
import {Dropdown, Firehose, kindObj, history, NavTitle, ResourceIcon, SelectorInput} from './utils';

import {split, selectorFromString} from '../module/k8s/selector';
import {requirementFromString} from '../module/k8s/selector-requirement';

// Map resource kind IDs to their list components
const resources = {
  Alertmanager: AlertManagersList,
  ConfigMap: ConfigMaps,
  DaemonSet: DaemonSets,
  Deployment: DeploymentsList,
  Ingress: IngressesList,
  Job: JobsList,
  Namespace: NamespacesList,
  NetworkPolicy: NetworkPoliciesList,
  Node: NodesListSearch,
  Pod: PodList,
  Prometheus: PrometheusInstancesList,
  ReplicaSet: ReplicaSetsList,
  ReplicationController: ReplicationControllersList,
  Secret: SecretsList,
  Service: ServicesList,
  ServiceAccount: ServiceAccountsList,
  ServiceMonitor: ServiceMonitorsList,
};

const DropdownItem = ({kind}) => <span>
  <div className="co-type-selector__icon-wrapper">
    <ResourceIcon kind={kind} />
  </div>
  {kindObj(kind).labelPlural}
</span>;

const ResourceListDropdown = ({selected, onChange}) => {
  const kinds = _.mapValues(resources, (v, k) => <DropdownItem kind={k} />);
  return <Dropdown className="co-type-selector" items={kinds} title={kinds[selected]} onChange={onChange} />;
};

const ResourceList = connect(() => ({namespace: getActiveNamespace()}))(
  ({kind, namespace, selector}) => {
    const List = resources[kind];
    const ns = kind === 'Node' || kind === 'Namespace' ? undefined : namespace;

    return <div className="co-m-pane__body">
      {List && <div className="co-m-resource-list">
        <Firehose isList={true} kind={kind} namespace={ns} selector={selector}>
          <List />
        </Firehose>
      </div>}
    </div>;
  });

const updateUrlParams = (k, v) => {
  const url = new URL(window.location);
  const sp = new URLSearchParams(window.location.search);
  sp.set(k, v);
  history.push(`${url.pathname}?${sp.toString()}${url.hash}`);
};

const updateKind = kind => updateUrlParams('kind', encodeURIComponent(kind));
const updateTags = tags => updateUrlParams('q', tags.map(encodeURIComponent).join(','));

export const SearchPage = ({match, location}) => {
  const { params } = match;
  let kind, q;
  if (location.search) {
    const sp = new URLSearchParams(window.location.search);
    kind = sp.get('kind');
    q = sp.get('q');
  }

  // Ensure that the "kind" route parameter is a valid resource kind ID
  kind = kind ? decodeURIComponent(kind) : 'Service';

  const tags = split(_.isString(q) ? decodeURIComponent(q) : '');
  const validTags = _.reject(tags, tag => requirementFromString(tag) === undefined);
  const selector = selectorFromString(validTags.join(','));

  // Ensure the list is reloaded whenever the search options are changed
  const key = `${params.ns}-${kind}-${validTags.join(',')}`;

  return <div className="co-p-search">
    <Helmet>
      <title>Search</title>
    </Helmet>
    <NavTitle title="Search" />
    <div className="co-m-pane" key={key}>
      <div className="co-m-pane__body">
        <div className="input-group">
          <div className="input-group-btn">
            <ResourceListDropdown selected={kind} onChange={updateKind} />
          </div>
          <SelectorInput labelClassName={`co-text-${_.toLower(kind)}`} tags={validTags} onChange={updateTags} autoFocus/>
        </div>
      </div>
      <ResourceList kind={kind} selector={selector} />
    </div>
  </div>;
};
