import { RoleWrappper } from '../../../wrapper/k8s/role-wrapper';

export const buildV2VVMwareRole = ({ name, namespace }: { name: string; namespace: string }) =>
  new RoleWrappper()
    .init({ name, namespace })
    .addRules(
      {
        apiGroups: [''],
        attributeRestrictions: null,
        resources: [
          // TODO: review what's really needed
          'configmaps',
          'endpoints',
          'events',
          'persistentvolumeclaims',
          'pods',
          'secrets',
          'services',
        ],
        verbs: ['*'],
      },
      {
        apiGroups: [''],
        attributeRestrictions: null,
        resources: ['namespaces'],
        verbs: ['get'],
      },
      {
        apiGroups: ['apps'],
        attributeRestrictions: null,
        resources: ['daemonsets', 'deployments', 'replicasets', 'statefulsets'],
        verbs: ['*'],
      },
      {
        apiGroups: ['monitoring.coreos.com'],
        attributeRestrictions: null,
        resources: ['servicemonitors'],
        verbs: ['create', 'get'],
      },
      {
        apiGroups: ['kubevirt.io'],
        attributeRestrictions: null,
        resources: ['*'],
        verbs: ['*'],
      },
    )
    .asResource();
