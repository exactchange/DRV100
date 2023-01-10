/* eslint-disable no-magic-numbers */

module.exports = ({
  senderAddress,
  recipientAddress,
  contract = 'DRV100',
  usdValue,
  drvValue
}) => contract !== 'DRV100' || Boolean(
  (senderAddress !== recipientAddress) &&
  (senderAddress.length === 36 && recipientAddress.length === 36) &&
  (drvValue && usdValue)
);
