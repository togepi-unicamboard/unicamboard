import initStripe from "stripe";
import { useUser } from "../context/user";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { withProtected } from "../hooks/route";

const Pricing = ({ plans }) => {
  const processPayment = (planId) => async () => {
    const { data } = await axios.get(`/api/payment/${planId}`);
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
      <div className="rounded-l py-2 px-4 font-medium">
        <div className="text-center">
          <div className="w-90 max-w-3xl mx-auto py-16 flex justify-around">
            <div className="h-auto w-fill rounded text-center shadow px-6 py-4">
              {plans.map((plan) => (
                <div key={plan.id}>
                  <h2 className="font-semibold text-slate-500 text-2xl">
                    {plan.name}
                  </h2>
                  <div className="text-md">{plan.description}</div>
                  <div className="py-2">€ {plan.price / 100}</div>
                  <div className="py-2">
                    <button
                      className="p-4 text-lg font-medium"
                      onClick={processPayment(plan.id)}
                    >
                      <a>Acquista</a>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export const getStaticProps = async () => {
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

  const { data: prices } = await stripe.prices.list();

  const plans = await Promise.all(
    prices.map(async (price) => {
      const product = await stripe.products.retrieve(price.product);
      return {
        id: price.id,
        name: product.name,
        description: product.description,
        price: price.unit_amount,
        currency: price.currency,
      };
    })
  );

  return {
    props: {
      plans,
    },
  };
};

export default withProtected(Pricing);
