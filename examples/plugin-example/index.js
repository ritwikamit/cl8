// Example JarvisCLI Plugin
// This demonstrates how to register custom tools

/**
 * Plugin initialization function
 * Called by JarvisCLI when the plugin is loaded
 * @param {import('../../src/types/plugin').PluginAPI} api - Plugin API
 */
function initialize(api) {
  api.log('info', 'Example plugin initialized!');

  api.registerTool({
    name: 'example-greet',
    description: 'A friendly greeting tool',
    category: 'utility',
    permissions: ['read'],
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name to greet' },
      },
      required: ['name'],
    },
    requiresApproval: false,
    dangerous: false,
  });

  api.log('info', 'Example tool registered');
}

module.exports = { initialize };
