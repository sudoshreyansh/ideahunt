export async function checkEthereumConnection() {
    try {
        const provider = window.ethereum;
        if ( provider && provider.isConnected() ) {
            const accounts = await provider.request({ method: 'eth_accounts' });
            const chainID = await provider.request({ method: 'eth_chainId' });

            return accounts.length > 0 && chainID === '0x4';
        }
        return false;
    } catch ( e ) {
        console.log(e);
        return false;
    }
}