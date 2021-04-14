/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import styled, { css } from 'reshadow';

import { Pane, ResizerControls, Split, splitStyles } from '@cloudbeaver/core-blocks';
import { composes, useStyles } from '@cloudbeaver/core-theming';

import { LogViewerInfoPanel } from './LogViewerInfoPanel';
import { LogViewerTable } from './LogViewerTable';
import { useLogViewer } from './useLogViewer';

const styles = composes(
  css`
    pane-content {
      composes: theme-background-surface theme-text-on-surface from global;
    }
  `,
  css`
    log-view-wrapper, Pane, pane-content {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
`);

export const LogViewer = observer(function LogViewer() {
  const style = useStyles(styles, splitStyles);
  const logViewerState = useLogViewer();

  if (!logViewerState.isActive) {
    return null;
  }

  return styled(style)(
    <log-view-wrapper as='div'>
      <Split mode={logViewerState.selectedItem ? undefined : 'maximize'} keepRatio>
        <Pane main>
          <pane-content as='div'>
            <LogViewerTable
              items={logViewerState.logItems}
              selectedItem={logViewerState.selectedItem}
              onClearTable={logViewerState.clearLog}
              onItemSelect={logViewerState.selectItem}
            />
          </pane-content>
        </Pane>
        {logViewerState.selectedItem && (
          <>
            <ResizerControls />
            <Pane>
              <pane-content as='div'>
                <LogViewerInfoPanel
                  selectedItem={logViewerState.selectedItem}
                  onClose={logViewerState.closeInfoPanel}
                />
              </pane-content>
            </Pane>
          </>
        )}
      </Split>
    </log-view-wrapper>
  );
});
