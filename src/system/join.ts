// network the raw buffers over websockets

import { Net } from './net'

// Network to the Bifrost post physics update
class Join extends Net {}

// Ask a MCP where the bifrost is
/* Concept
  Relay either full buffers or buffer maps to the Bifrost which echos it down based on room
*/

new Join()
