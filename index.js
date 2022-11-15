/*
 *
 * Decentralized Record of Value
 * DRV100: Record
 *
 */

const SUCCESS_CODE = 200;

module.exports = ({ drv, peers, serviceEvents }) => {

  /*
   * Define a contract that either transfers DRV from
   * a sender to a recipient, or records collateral (like USD)
   * from a recipient, then recursively transfers DRV
   * against it.
   */

  const Contract = async ({
    sender,
    recipient,
    recipientAddress,
    contract = 'DRV100',
    usdValue,
    drvValue,
    isDrv
  }) => {

    /*
     * If DRV is being transferred, send a normal POST request
     * to `drv-core` and return the result.
     */

    if (isDrv) {
      const transactionResult = await serviceEvents.onServicePost({
        service: drv,
        serviceName: '/',
        method: 'transaction',
        body: {
          senderAddress: sender.userData.address,
          recipientAddress,
          contract,
          usdValue,
          drvValue,
          peers: Object.values(peers)
        }
      });

      if (!transactionResult || transactionResult.status !== SUCCESS_CODE) {
        return false;
      }

      return transactionResult;
    }

    /*
     * If non-DRV is being transferred, send a GET request
     * to `drv-core` to make sure the DRV is tradable.
     * (hit the /price endpoint)
     */

    const priceResult = await serviceEvents.onServiceGet({
      service: drv,
      serviceName: '/',
      method: 'price'
    });

    if (!priceResult || priceResult.status !== SUCCESS_CODE) {
      return false;
    }

    /*
     * If it has a valid price, recursively call this contract
     * transferring the originally requested DRV amount.
     */

    const transferResult = await Contract({
      sender: recipient,
      recipient: sender,
      recipientAddress: sender.userData.address,
      contract: 'DRV100',
      usdValue,
      drvValue,
      isDrv: true
    });

    if (!transferResult) {
      console.log(
        '<DRV> Transfer Error: There was a problem transferring DRV between accounts.', sender, recipient
      );
    }

    return transferResult;
  };

  return Contract;
};
