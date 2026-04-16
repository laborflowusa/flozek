export default function CheckoutButton() {
  const handleCheckout = () => {
    window.location.href =
      "https://buy.stripe.com/9B628jfKn3r3bLp5b0ao801";
  };

  return <button onClick={handleCheckout}>Subscribe</button>;
}