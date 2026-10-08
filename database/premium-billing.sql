-- Stripe-backed Premium catalogue and server-side subscription ownership.
-- Prices are live IDs from the PostisPop Stripe account. Keep them in sync
-- with functions/postispop-commerce/index.ts before changing the public offer.
begin;

create table if not exists public.postispop_billing_subscriptions (
  stripe_subscription_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  price_id text not null,
  status text not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.postispop_billing_subscriptions enable row level security;
revoke all on public.postispop_billing_subscriptions from public,anon,authenticated;
grant all on public.postispop_billing_subscriptions to service_role;

update public.store_products set active=false,updated_at=now()
where slug in ('pack-rebel','pack-minimal','reloj-recordatorios','postispop-pro');

insert into public.store_products(slug,title,description,price_cents,currency,stripe_price_id,active,sort_order)
values
 ('premium-monthly','Premium mensual','Premium renovable cada mes.',295,'eur','price_1UOAAH2RcjC8W03mpwqVv18l',true,1),
 ('premium-quarterly','Premium trimestral','Premium renovable cada tres meses.',595,'eur','price_1UOAAI2RcjC8W03myY2Q0eHI',true,2),
 ('premium-yearly','Premium anual','Premium renovable cada año.',1995,'eur','price_1UOAAJ2RcjC8W03mIglr3zdS',true,3),
 ('premium-lifetime','Premium de por vida','Acceso Premium de por vida mediante un único pago.',5995,'eur','price_1UOAAI2RcjC8W03mwIps4WqY',true,4)
on conflict(slug) do update set title=excluded.title,description=excluded.description,
 price_cents=excluded.price_cents,currency=excluded.currency,stripe_price_id=excluded.stripe_price_id,
 active=excluded.active,sort_order=excluded.sort_order,updated_at=now();

commit;
