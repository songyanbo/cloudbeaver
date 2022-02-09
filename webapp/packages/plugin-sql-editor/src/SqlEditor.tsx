/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2022 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import styled, { css } from 'reshadow';

import { splitStyles, Split, ResizerControls, Pane, splitHorizontalStyles, Overlay, OverlayMessage, OverlayActions, Button, useMapResource, getComputed } from '@cloudbeaver/core-blocks';
import { ConnectionExecutionContextResource, ConnectionInfoResource } from '@cloudbeaver/core-connections';
import { useService } from '@cloudbeaver/core-di';
import { useTranslate } from '@cloudbeaver/core-localization';
import { useStyles } from '@cloudbeaver/core-theming';

import type { ISqlEditorTabState } from './ISqlEditorTabState';
import { SqlEditorLoader } from './SqlEditor/SqlEditorLoader';
import { SqlEditorService } from './SqlEditorService';
import { SqlResultTabs } from './SqlResultTabs/SqlResultTabs';

const viewerStyles = css`
  Pane {
    composes: theme-typography--body2 from global;
    display: flex;
  }
  SqlEditorLoader {
    composes: theme-typography--body1 from global;
  }
`;

interface Props {
  state: ISqlEditorTabState;
}

export const SqlEditor = observer<Props>(function SqlEditor({ state }) {
  const translate = useTranslate();
  const sqlEditorService = useService(SqlEditorService);
  const styles = useStyles(splitStyles, splitHorizontalStyles, viewerStyles);
  const connection = useMapResource(SqlEditor, ConnectionInfoResource, state.executionContext?.connectionId ?? null);

  const connected = getComputed(() => connection.data?.connected ?? false);

  const context = useMapResource(
    SqlEditor, 
    ConnectionExecutionContextResource, 
    connected ? (state.executionContext?.id ?? null) : null
  );

  const initializingContext = getComputed(() => connection.isLoading() || context.isLoading());
  const initExecutionContext = getComputed(() => context.data === undefined && state.executionContext !== undefined);

  async function cancelConnection() {
    await sqlEditorService.resetExecutionContext(state);
  }

  async function init() {
    await sqlEditorService.initEditorConnection(state);
  }

  useEffect(() => {
    if (initExecutionContext && connected) {
      init();
    }

  }, [connected, initExecutionContext]);

  return styled(styles)(
    <>
      <Split split="horizontal" sticky={30}>
        <Pane>
          <SqlEditorLoader state={state} />
        </Pane>
        <ResizerControls />
        <Pane main>
          <SqlResultTabs state={state} />
        </Pane>
      </Split>
      <Overlay active={initExecutionContext}>
        <OverlayMessage>{translate('sql_editor_restore_message')}</OverlayMessage>
        <OverlayActions>
          <Button
            type="button"
            mod={['outlined']}
            loader
            onClick={cancelConnection}
          >
            {translate('ui_processing_cancel')}
          </Button>
          <Button
            type="button"
            mod={['unelevated']}
            loading={initializingContext}
            loader
            onClick={init}
          >
            {translate('sql_editor_restore')}
          </Button>
        </OverlayActions>
      </Overlay>
    </>
  );
});
