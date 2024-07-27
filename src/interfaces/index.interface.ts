/**
 * Imports
 */

import type { ConfigurationInterface } from '@providers/interfaces/configuration.interface';

/**
 * Global Declaration
 */

declare global {
    /**
     * Declares a global function for configuring the application.
     *
     * @param configuration - A partial configuration object adhering to the ConfigurationInterface.
     *                        This allows users to provide only the properties they need to override.
     * @returns Returns a string representation of the configuration.
     */

    function jetConfig(configuration: Partial<ConfigurationInterface>): string;
}
