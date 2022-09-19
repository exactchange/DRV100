/*
 *
 * Decentralized Record of Value
 * DRV100: Record
 *
 */

const SUCCESS_CODE = 200;

module.exports = ({ drv, peers, serviceEvents }) => {
  const Contract = async ({
    token,
    sender,
    recipient,
    recipientAddress,
    contract = 'DRV100',
    usdValue,
    drvValue,
    isDrv
  }) => {
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

    const priceResult = await serviceEvents.onServiceGet({
      service: drv,
      serviceName: '/',
      method: 'price'
    });

    if (!priceResult || priceResult.status !== SUCCESS_CODE) {
      return false;
    }

    const transferResult = await Contract({
      token,
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
