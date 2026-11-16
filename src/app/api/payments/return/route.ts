// The payment provider posts (or redirects) here after a payment; the kit checks it and sends the
// shopper on to /checkout/payment-return (or the payment link page)
export { paymentReturnHandler as GET, paymentReturnHandler as POST } from "@zcom/storefront-kit/server";
