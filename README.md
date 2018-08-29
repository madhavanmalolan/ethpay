# ETH Pay
Apple pay for ETH on mobile apps

## By developers for developers
Build apps that require the signature of the user for transactions. 

When your app requests the user's signature, the _ETH Pay_ app or any other app that accepts the `ethpay://` URI will open up requesting user's permission to sign the transaction with one of the private keys they hold.

## ETH Pay URI
The _ETH Pay_ URI has the prefix `ethpay://`

### Valid parameters in the URI 
- `action` : May be one of `sign` or `sendSignedTransaction`
- `to` : The address of the recipient of a transaction. This is an ETH address
- `value` : The amount to be transfered to the address `to`. This is an integer. Denomination is in Wei
- `data` : Hex encoded data to be signed in the transaction
- `gas` : Amount of gas to be used in transaction. This is an integer. This is a required field if `action` is `sendSignedTransaction`.
- `gasPrice` : The maximum gas price to be used for the transaction. If not provided will use the current gas price on the network. This is an integer. Denomination in Wei
- `redirectUri` : If the `action` is `sign`, this URI will be opened with the signature as a query parameter. This is a fully qualified URI

### Example URI
`ethpay://?action=sendSignedTransaction&to=0x2DB6Ff6eB673138E2dcc96EA7B9037552F788aF4&value=100&gas=90000`

Opening the above URI on the mobile will open the app, and request the user to sign the transaction with the account the he/she chooses and submits the transaction to Ethereum.

`ethpay://?action=sign&data=0x68656c6c6f20776f726c64&redirectUri=https://github.com`

Opening the above URI on the mobile will open the app, and request the user to sign the transaction with the account the he/she chooses and redirects to `https://github.com?signature=<SIGNATURE>`. Where SIGNATURE is for the data `{data:'0x68656c6c6f20776f726c64}`

## iOS integration

```
UIApplication.sharedApplication().openURL(NSURL(string:eth_pay_uri)!)
```

## Android integration

```
Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(eth_pay_uri));
startActivity(intent);
```

## Mobile web integration

```
location.href = eth_pay_uri;
```

or 

```
<a href="eth_pay_uri"> OPEN ETH PAY </a>
```