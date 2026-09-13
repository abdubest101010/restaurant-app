# Stripe live key swap

Never commit real Stripe keys. Use environment variables only.

## Development

Set test keys in `.env`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Point the Stripe CLI at the local webhook:

```
stripe listen --forward-to localhost:4000/api/payments/stripe/webhook
```

If keys are missing or still placeholders, checkout uses a local demo path that confirms the order without calling Stripe.

## Production

1. Create a separate live Stripe account or use live mode in the same account.
2. Replace the three Stripe variables with `sk_live_`, `pk_live_`, and the live webhook secret.
3. Configure the live webhook URL: `https://<api-host>/api/payments/stripe/webhook`.
4. Restart the API so it picks up the new env vars.
5. Do not reuse test webhook secrets in production.

Test and live worlds stay isolated because they never share the same secret values.
