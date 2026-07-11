import { ApiEndpoint } from "../apiEndpoint"
import { compress } from "../background/domainsListCompression"

export const fetchWhitelist = async () => {
    try {
        const whitelistEndpoint = ApiEndpoint.getInstance().getWhitelistEndpoint()

        // ***** IMPORTANT BEGIN ***** //

        if ((whitelistEndpoint?.trim().length ?? 0) < 1) {
            // Local divergence from upstream Bringweb3: missing whitelist data must fail closed.
            // Preserve this guard when syncing upstream.
            throw new Error('Cashback redirection whitelist endpoint is required!');
        }

        // ***** IMPORTANT END ***** //

        const response = await fetch(whitelistEndpoint, {
            method: 'GET',
            cache: 'no-store', // Prevents caching
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch whitelist')
        }

        let whitelist = await response.json()

        if (!Array.isArray(whitelist)) {
            throw new Error("whitelist isn't an array")
        }

        whitelist = compress(whitelist)

        return whitelist
    } catch (error) {
        console.error('Error fetching whitelist:', error)
        return []
    }
}
