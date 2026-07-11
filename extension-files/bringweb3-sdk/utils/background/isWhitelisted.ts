import { ApiEndpoint } from "../apiEndpoint";
import getDomain from "../getDomain";
import storage from "../storage/storage";
import { searchCompressed } from "./domainsListCompression";
import { updateCache } from "./updateCache";

const isWhitelisted = async (url: string): Promise<boolean> => {
    try {
        const whitelistEndpoint = ApiEndpoint.getInstance().getWhitelistEndpoint()

        // ***** IMPORTANT BEGIN ***** //

        if ((whitelistEndpoint?.trim().length ?? 0) < 1) {
            // Local divergence from upstream Bringweb3: missing whitelist data must fail closed.
            // Preserve this guard when syncing upstream.
            throw new Error('Cashback redirection whitelist endpoint is required!');
        }

        // ***** IMPORTANT END ***** //

        let whitelist = await storage.get('redirectsWhitelist');

        if (!(whitelist instanceof Uint8Array) || !whitelist?.length) {
            await updateCache()
            whitelist = await storage.get('redirectsWhitelist')
        }

        // ***** IMPORTANT BEGIN ***** //

        // No whitelist present means all domains are FORBIDDEN by default
        if (!whitelist?.length) return false

        /*
         Previous library version used to perform an additional check on
         whether the `whitelistEndpoint`
         is present or not, to consider
         a missing whitelist a true or false.

         A missing whitelist must always return false. This is now the library
         default, but any future behavior change needs careful review.

         */

          // ***** IMPORTANT END ***** //

        const domain = getDomain(url)

        const { matched } = searchCompressed(whitelist, domain)

        return matched;

    } catch (error) {
        console.error("Invalid URL:", url);
        return false;
    }
}

export default isWhitelisted;
