import * as React from 'react';
import * as _ from 'lodash';
import { Formik, FormikValues } from 'formik';
import {
  createModalLauncher,
  ModalComponentProps,
} from '@console/internal/components/factory/modal';
import { k8sCreate } from '@console/internal/module/k8s';
import { PipelineRunModel } from '../../../models';
import { Pipeline, PipelineResource, Param, PipelineRun } from '../../../utils/pipeline-augment';
import StartPipelineForm from './StartPipelineForm';
import { validationSchema } from './pipelineForm-validation-utils';

export type newPipelineRun = (Pipeline: Pipeline, latestRun: PipelineRun) => {};

export interface StartPipelineModalProps {
  pipeline: Pipeline;
  getNewPipelineRun: newPipelineRun;
}
export interface StartPipelineFormValues extends FormikValues {
  namespace: string;
  parameters: Param[];
  resources: PipelineResource[];
}

const StartPipelineModal: React.FC<StartPipelineModalProps & ModalComponentProps> = ({
  pipeline,
  getNewPipelineRun,
  close,
}) => {
  const initialValues: StartPipelineFormValues = {
    namespace: pipeline.metadata.namespace,
    parameters: _.get(pipeline.spec, 'params', []),
    resources: _.get(pipeline.spec, 'resources', []),
  };
  initialValues.resources.map((resource: PipelineResource) =>
    _.merge(resource, { resourceRef: { name: '' } }),
  );

  const handleSubmit = (values: StartPipelineFormValues, actions): void => {
    actions.setSubmitting(true);
    const pipelineRunData = {
      spec: {
        pipelineRef: {
          name: pipeline.metadata.name,
        },
        params: values.parameters,
        resources: values.resources,
        trigger: {
          type: 'manual',
        },
      },
    };
    k8sCreate(PipelineRunModel, getNewPipelineRun(pipeline, pipelineRunData))
      .then(() => {
        actions.setSubmitting(false);
        close();
      })
      .catch((err) => {
        actions.setSubmitting(false);
        actions.setStatus({ submitError: err.message });
        close();
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ subFormsOpened: 0 }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      render={(props) => <StartPipelineForm {...props} close={close} />}
    />
  );
};

export default createModalLauncher(StartPipelineModal);